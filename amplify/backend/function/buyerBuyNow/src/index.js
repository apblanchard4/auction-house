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

        const fetchItemQuery = `
            SELECT 
                sellerUsername, 
                isBuyNow, 
                buyNowPrice, 
                fulfilled,
                archived,
                frozen 
            FROM Item
            WHERE id = ? AND published = 1
        `;

        const [itemRows] = await connection.execute(fetchItemQuery, [itemId]);

        if (itemRows.length === 0) {
            return {
                statusCode: 404,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*"
                },
                body: JSON.stringify({ message: 'Item not found' }),
            };
        }

        const fetchFundsQuery = `
            SELECT username, funds
            FROM Buyer
            WHERE username = ?
            UNION ALL
            SELECT username, funds
            FROM Seller
            WHERE username = ?
        `;
        let item = itemRows[0];
        const [fundsRows] = await connection.execute(fetchFundsQuery, [
            buyerUsername,
            item.sellerUsername
        ]);

        if (fundsRows.length < 2) {
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*"
                },
                body: JSON.stringify({ message: 'Invalid buyer or seller' }),
            };
        }

        const buyerFunds = fundsRows.find(f => f.username === buyerUsername).funds;
        const sellerFunds = fundsRows.find(f => f.username === item.sellerUsername).funds;

        if (buyerFunds < item.buyNowPrice) {
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*"
                },
                body: JSON.stringify({ message: 'Insufficient funds' }),
            };
        }

        if (!item.isBuyNow) {
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*"
                },
                body: JSON.stringify({ message: 'Buy Now is not enabled' }),
            };
        }

        const updateFundsQueryBuyer = `
            UPDATE Buyer 
            SET funds = funds - ? 
            WHERE username = ?`;

        const updateFundsQuerySeller = `
            UPDATE Seller 
            SET funds = funds + ? 
            WHERE username = ?`;

        await connection.execute(updateFundsQueryBuyer, [item.buyNowPrice, buyerUsername]);
        await connection.execute(updateFundsQuerySeller, [item.buyNowPrice, item.sellerUsername]);
        //TO-DO: Double check logic here
        const updateItemQuery = `
            UPDATE Item
            SET 
                fulfilled = FALSE,
                published = FALSE,
                archived = TRUE
            WHERE id = ?`;

        await connection.execute(updateItemQuery, [itemId]);

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify({
                message: 'Buy Now successful. Item is pending fulfillment.',
                itemId: itemId,
                price: item.buyNowPrice,
            }),
        };
    } catch (error) {
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
