const AWS = require('aws-sdk');
const mysql = require('mysql2/promise');

AWS.config.update({ region: 'us-east-1' });

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

exports.handler = async (event) => {

  // Extract seller information and item details from the event
  const sellerUsername = event.sellerUsername;
  const itemId = event.itemId; // ID of the item to be updated
  const newName = event.newName; // New item name (if changed)
  const newDescription = event.newDescription; // New description (if changed)
  const newImage = event.newImage; // New image URL (if changed)
  const newPrice = event.newPrice; // New price (if changed)
  const newLength = event.newLength; // New length (if changed)


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

    // Update the item details in the database
    const updateQuery = `
      UPDATE Item 
      SET 
        name = ?, 
         description = ?, 
        image = ?
        initialPrice = ?, 
        length = ?, 
      WHERE id = ? AND sellerUsername = ?`;

    await connection.execute(updateQuery, [
      newName,
      newDescription,
      newImage,
      newPrice,
      newLength,
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
