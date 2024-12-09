const AWS = require('aws-sdk');
const mysql = require('mysql2/promise');

AWS.config.update({ region: 'us-east-1' });

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

exports.handler = async (event) => {
    const sellerUsername = event.username;
    const itemId = event.itemId;
    const buyNowPrice = event.buyNowPrice ?? null;
    
    console.log('sellerUsername:', sellerUsername);
    console.log('itemId:', itemId);
    console.log('buyNowPrice:', buyNowPrice);

    if (!sellerUsername || !itemId) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify({ message: 'Missing sellerUsername or itemId' }),
        };
    }

    if (!buyNowPrice) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify({ message: 'Missing Buy Now Price' }),
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

        const isBuyNowQuery = `SELECT isBuyNow FROM Item WHERE id = ? AND sellerUsername = ?`;
        const [isBuyNowRows] = await connection.execute(isBuyNowQuery, [itemId, sellerUsername]);
        if (isBuyNowRows.length === 0) {
            return {
                statusCode: 404,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*"
                },
                body: JSON.stringify({ message: 'Item not found' }),
            };
        }
        let isBuyNow = isBuyNowRows[0].isBuyNow;
        const updateQuery = `
            UPDATE Item
            SET 
                isBuyNow = ?, 
                buyNowPrice = ?
            WHERE id = ? AND sellerUsername = ?`;
        
        await connection.execute(updateQuery, [
            isBuyNow ? 0: 1,
            isBuyNow ? null : buyNowPrice,
            itemId,
            sellerUsername
        ]);

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify({ message: 'Item updated to Buy Now successfully' }),
        };
    } catch (error) {
        console.error('Error updating item:', error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify({ message: 'Failed to update item to Buy Now' }),
        };
    } finally {
        if (connection && connection.end) {
            await connection.end();
        }
    }
};