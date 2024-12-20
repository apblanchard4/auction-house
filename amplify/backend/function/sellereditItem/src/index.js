const AWS = require('aws-sdk');
const mysql = require('mysql2/promise');

AWS.config.update({ region: 'us-east-1' });

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

exports.handler = async (event) => {
    // Extract seller information and item details from the event
    const sellerUsername = event.sellerUsername;
    const itemId = event.itemId;
    const newName = event.newName ?? null;
    const newDescription = event.newDescription ?? null;
    const newPrice = event.newPrice ?? null;
    const newLength = event.newLength ?? null;
    const newCPrice = event.newCPrice ?? null;
  

    console.log('sellerUsername:', sellerUsername);
    console.log('itemId:', itemId);

    // Validate required parameters
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

         // Check if the new name already exists for another item
         if (newName) {
            const checkNameQuery = `
                SELECT COUNT(*) AS count 
                FROM Item 
                WHERE name = ? AND id != ?`;
            const [rows] = await connection.execute(checkNameQuery, [newName, itemId]);

            if (rows[0].count > 0) {
                return {
                    statusCode: 400,
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "*"
                    },
                    body: JSON.stringify({ message: 'An item with this name already exists' }),
                };
            }
        }

        // Update the item details in the database
        const updateQuery = `
            UPDATE Item
            SET 
                name = COALESCE(?, name), 
                description = COALESCE(?, description), 
                initialPrice = COALESCE(?, initialPrice), 
                length = COALESCE(?, length),
                currentPrice = COALESCE(?, initialPrice)
            WHERE id = ? AND sellerUsername = ?`;

        await connection.execute(updateQuery, [
            newName,
            newDescription,
            newPrice,
            newLength,
            newCPrice,
            itemId,
            sellerUsername
        ]);


        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify({ message: 'Item updated successfully' }),
        };

    } catch (error) {
        console.error('Error: ', error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify({ message: 'Failed to update item' }),
        };
    } finally {
        if (connection && connection.end) {
            await connection.end();
        }
    }
};