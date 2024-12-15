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
  const currentDate = new Date();

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

    // Check if the item is currently fulfillable
    const checkFulfillableQuery = `
      SELECT i.published, 
        i.archived, 
        i.fulfilled, 
        i.startDate, 
        i.length,
        i.frozen,
        i.isBuyNow,
        (SELECT COUNT(*) FROM Bid WHERE Bid.itemId = i.id) AS bidCount
      FROM 
        Item AS i
      WHERE id = ? AND sellerUsername = ?`;

    const [rows] = await connection.execute(checkFulfillableQuery, [itemId, sellerUsername]);

    // If no item is found
    if (rows.length === 0) {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*"
        },
        body: JSON.stringify({ message: 'Item not found ' }),
      };
    }

    const { published, archived, fulfilled, startDate, length, bidCount, frozen, isBuyNow } = rows[0];
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(startDate);
    endDateObj.setDate(endDateObj.getDate() + length);

    //If item is not completed
    if (!isBuyNow && !(published && currentDate >= endDateObj && bidCount > 0 && !archived && !frozen)) {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*"
        },
        body: JSON.stringify({ message: 'Item not completed' }),
      };
    }

    // If the item is not fulfillable, return an error
    if (fulfilled) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*"
        },
        body: JSON.stringify({ message: 'Item has already been fulfilled, cannot fulfill again' }),
      };
    }

    // Proceed to fulfilled the item by setting 'fulfilled' to true
    const updateQuery = `
      UPDATE Item 
      SET fulfilled = True, archived = true
      WHERE id = ? AND sellerUsername = ? AND fulfilled = false`;

    const [result] = await connection.execute(updateQuery, [itemId, sellerUsername]);

    // Check if the item was successfully fulfilled
    if (result.affectedRows === 0) {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*"
        },
        body: JSON.stringify({ message: 'Item not found or already fulfilled' }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({ message: 'Item fulfilled successfully' }),
    };

  } catch (error) {
    console.error('Error: ', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({ message: 'Failed to fulfilled item' }),
    };
  } finally {
    if (connection && connection.end) {
      await connection.end();
    }
  }

};
