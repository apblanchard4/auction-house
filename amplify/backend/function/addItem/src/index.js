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
    const name = event.name;
    const description = event.description;
    const image = event.image;
    const price = event.price;
    const startDate = event.startDate;

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

        // Update the item details in the database
        const updateQuery = `
            INSERT INTO Item (name, description, image, initialPrice, startDate, sellerUsername)
            VALUES (?, ?, ?, ?, ?, ?);`;

        await connection.execute(updateQuery, [
            name,
            description,
            image,
            price,
            startDate,
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