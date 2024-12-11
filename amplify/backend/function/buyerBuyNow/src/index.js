const AWS = require('aws-sdk');
const mysql = require('mysql2/promise');

AWS.config.update({ region: 'us-east-1' });

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

exports.handler = async (event) => {
    const buyerUsername = event.username;
    const itemId = event.itemId;

    console.log('buyerUsername:', buyerUsername);
    console.log('itemId:', itemId);

    if (!buyerUsername || !itemId) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify({ message: 'Missing buyerUsername or itemId' }),
        };
    }

    const connectConfig = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    };

    let connection;
    try {
        connection = await mysql.createConnection(connectConfig);
        console.log('Connection to database successful');

        // Start a transaction
        await connection.beginTransaction();

        // Fetch item details
        const fetchItemQuery = `
            SELECT 
                sellerUsername, 
                isBuyNow, 
                currentPrice, 
                fulfilled,
                archived,
                frozen 
            FROM Item
            WHERE id = ? AND published = 1
        `;

        const [itemRows] = await connection.execute(fetchItemQuery, [itemId]);
        if (itemRows.length === 0) {
            await connection.rollback();
            return {
                statusCode: 404,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*"
                },
                body: JSON.stringify({ message: 'Item not found' }),
            };
        }
        const item = itemRows[0];

        // Validate item availability and price
        if (!item.isBuyNow) {
            await connection.rollback();
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*"
                },
                body: JSON.stringify({ message: 'Buy Now is not enabled for this item' }),
            };
        }

        // Fetch buyer and seller funds
        const fetchFundsQuery = `
            SELECT username, funds
            FROM Buyer
            WHERE username = ?
            UNION ALL
            SELECT username, funds
            FROM Seller
            WHERE username = ?
        `;
        const [fundsRows] = await connection.execute(fetchFundsQuery, [
            buyerUsername,
            item.sellerUsername
        ]);

        if (fundsRows.length < 2) {
            await connection.rollback();
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*"
                },
                body: JSON.stringify({ message: 'Invalid buyer or seller' }),
            };
        }

        const buyerFundsRow = fundsRows.find(f => f.username === buyerUsername);
        const sellerFundsRow = fundsRows.find(f => f.username === item.sellerUsername);

        if (!buyerFundsRow || !sellerFundsRow) {
            await connection.rollback();
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*"
                },
                body: JSON.stringify({ message: 'Buyer or Seller not found' }),
            };
        }

        const buyerFunds = buyerFundsRow.funds;
        const sellerFunds = sellerFundsRow.funds;

        // Validate buyer funds
        if (!buyerFunds || buyerFunds < parseFloat(item.currentPrice)) {
            await connection.rollback();
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*"
                },
                body: JSON.stringify({ message: 'Insufficient funds' }),
            };
        }

        // Update buyer funds
        const updateFundsQueryBuyer = `
            UPDATE Buyer 
            SET funds = funds - ? 
            WHERE username = ? AND funds >= ?`;
        await connection.execute(updateFundsQueryBuyer, [item.currentPrice, buyerUsername, item.currentPrice]);

        // Update seller funds
        const updateFundsQuerySeller = `
            UPDATE Seller 
            SET funds = funds + ? 
            WHERE username = ?`;
        await connection.execute(updateFundsQuerySeller, [item.currentPrice, item.sellerUsername]);

        // Update item status
        const updateItemQuery = `
            UPDATE Item
            SET 
                fulfilled = FALSE,
                published = FALSE,
                archived = TRUE
            WHERE id = ?`;
        await connection.execute(updateItemQuery, [itemId]);

        // Commit the transaction
        await connection.commit();

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify({
                message: 'Buy Now successful. Item is pending fulfillment.',
                itemId: itemId,
                price: item.currentPrice,
            }),
        };
    } catch (error) {
        // Rollback the transaction in case of an error
        if (connection) {
            await connection.rollback();
        }
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify({ message: 'Internal Server Error' }),
        };
    } finally {
        if (connection && connection.end) {
            await connection.end();
        }
    }
};