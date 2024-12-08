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
  }

  let connection;
  try {
    connection = await mysql.createConnection(connectConfig);
    console.log('Connection to database successful');

    // Update the item to set the 'archived' status to true
    const updateQuery = `
      UPDATE Item 
      SET archived = true 
      WHERE id = ? AND sellerUsername = ? AND published = false AND archived = false`;

    const [result] = await connection.execute(updateQuery, [itemId, sellerUsername]);

    // Check if the item was found and updated
    if (result.affectedRows === 0) {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*"
        },
        body: JSON.stringify({ message: 'Item not found, is published, or already archived' }),
      };
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
