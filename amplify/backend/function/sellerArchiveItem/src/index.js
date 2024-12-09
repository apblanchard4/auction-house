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

    //check if the item exists and is currently inactive
    const checkItemQuery = `
            SELECT COUNT(*) AS count 
            FROM Item 
            WHERE id = ? AND sellerUsername = ? AND isActive = 0`;
    const [rows] = await connection.execute(checkItemQuery, [itemId, sellerUsername]);
    if (rows[0].count === 0) {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*"
        },
        body: JSON.stringify({ message: 'Item not found or is currently active' }),
      };
    }
    else {
      //archive the item
      const archiveItemQuery = `
            UPDATE Item 
            SET isActive = 1
            WHERE id = ? AND sellerUsername = ?`;
      await connection.execute(archiveItemQuery, [itemId, sellerUsername]);
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({ message: 'Item archived successfully' }),
    };

  } catch (error) {
    console.error('Error: ', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({ message: 'Failed to archive item' }),
    };
  } finally {
    if (connection && connection.end) {
      await connection.end();
    }
  }
};