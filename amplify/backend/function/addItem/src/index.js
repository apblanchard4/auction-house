const AWS = require('aws-sdk');
const mysql = require('mysql2/promise');
AWS.config.update({ region: 'us-east-1' });
const s3 = new AWS.S3();

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
  try {
    const { sellerUsername, newName, newDescription, initialPrice, newLength, newImage } = event;

    // Validate input
    if (!newName || !newDescription || !initialPrice || !newLength || !newImage || !sellerUsername) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*"
        },
        body: JSON.stringify({ message: 'Missing required fields' }),
      };
    }

    // Validate initial price
    if (parseFloat(initialPrice) < 1) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*"
        },
        body: JSON.stringify({ message: 'Initial price must be at least $1' }),
      };
    }

    // Validate auction length
    if (parseInt(newLength) < 1) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*"
        },
        body: JSON.stringify({ message: 'Auction length must be at least 1 day' }),
      };
    }

    // Database connection configuration
    const connectConfig = {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    };

    const connection = await mysql.createConnection(connectConfig);

    // Check for duplicate item name
    const [existingItem] = await connection.execute(
      `SELECT id FROM Item WHERE name = ? AND sellerUsername = ?`,
      [newName, sellerUsername]
    );

    if (existingItem.length > 0) {
      await connection.end();
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*"
        },
        body: JSON.stringify({ message: 'An item with this name already exists for the seller' }),
      };
    }

    // Query to insert a new item into the database
    const query = `
      INSERT INTO Item (name, description, initialPrice, currentPrice, length, image, sellerUsername, published, archived, frozen, fulfilled) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      newName,
      newDescription,
      initialPrice,
      initialPrice, // Assuming the initial price is the current price
      newLength,
      newImage,
      sellerUsername,
      false, // Default value for published
      false, // Default value for archived
      false, // Default value for frozen
      false  // Default value for fulfilled
    ];

    await connection.execute(query, values);
    await connection.end();

    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({ message: 'Item successfully added' }),
    };
  } catch (error) {
    console.error('Error: ', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({ message: 'Failed to add item' }),
    };
  }
};
