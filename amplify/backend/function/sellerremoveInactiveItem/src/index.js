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
  };

  let connection;
  try {
    connection = await mysql.createConnection(connectConfig);
    console.log('Connection to database successful');

    // Start a transaction
    await connection.beginTransaction();

    // Delete all bids associated with the item
    const deleteBidsQuery = `DELETE FROM Bid WHERE itemId = ?`;
    const [bidsResult] = await connection.execute(deleteBidsQuery, [itemId]);
    console.log(`Deleted ${bidsResult.affectedRows} bids`);

    // Delete the item
    const deleteItemQuery = `
      DELETE FROM Item 
      WHERE id = ? AND sellerUsername = ? AND published = false AND archived = false`;
    const [itemResult] = await connection.execute(deleteItemQuery, [itemId, sellerUsername]);

    // Check if the item was found and deleted
    if (itemResult.affectedRows === 0) {
      // Rollback transaction if no item was deleted
      await connection.rollback();
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*"
        },
        body: JSON.stringify({ message: 'Item not found, is published, or already archived' }),
      };
    }

    // Commit transaction
    await connection.commit();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({ message: 'Item and associated bids deleted successfully' }),
    };

  } catch (error) {
    console.error('Error: ', error);
    // Rollback the transaction on error
    if (connection) await connection.rollback();
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({ message: 'Failed to delete item and associated bids' }),
    };
  } finally {
    if (connection && connection.end) {
      await connection.end();
    }
  }

};
