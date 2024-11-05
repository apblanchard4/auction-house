const mysql = require('mysql2/promise');
AWS.config.update({ region: 'us-east-1' });

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

exports.handler = async (event) => {
  const sellerUsername = event.sellerUsername;
  const itemID = event.itemID;

  if(!sellerUsername || !itemID) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({message: 'Failed to unpublish item'}),
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

    const [result] = await connection.execute(
      `UPDATE Item
      SET published = false
      WHERE id = ? AND sellerUsername = ?`,
      [itemID, sellerUsername]
    );

    if(result.affectedRows === 0) {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*"
        },
        body: JSON.stringify({message: 'Item not found'}),
      };
    }
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({message: 'Item unpublished'}),
    };
  } catch (error) {
    console.error('Error unpublishing item', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({message: 'Failed to unpublish item'}),
    };
  } finally {
    if(connection) {
      await connection.end();
    }
  }
} 