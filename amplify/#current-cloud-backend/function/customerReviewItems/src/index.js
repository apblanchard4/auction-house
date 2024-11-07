const AWS = require('aws-sdk');
const mysql = require('mysql2/promise');
AWS.config.update({ region: 'us-east-1' });

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

exports.handler = async () => {
  const connectConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };
  console.log('connectConfig:', connectConfig);

  let connection;
  try {
    connection = await mysql.createConnection(connectConfig);
    console.log('Connection to database successful');

    const [items] = await connection.execute(
      `SELECT * FROM Item WHERE Item.published = 1 AND Item.archived = 0 AND Item.fulfilled = 0`
    );

    const categorizedItems = [];
    const currentDate = new Date();

    items.forEach(item => {
      const { id, itemName, price, startDate, length } = item;
      console.log(startDate, length);
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(startDate);
      endDateObj.setDate(endDateObj.getDate() + length);

      // Only add items that are currently active
      if (currentDate >= startDateObj && currentDate <= endDateObj) {
        categorizedItems.push({
          id,
          itemName,
          price,
          startDate: startDateObj.toISOString().split('T')[0],
          endDate: endDateObj.toISOString().split('T')[0]
        });
      }
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify(categorizedItems),
    };

  } catch (error) {
    console.error('Error: ', error);
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({ message: 'Failed to review items' }),
    };
  } finally {
    if (connection && connection.end) {
      await connection.end();
    }
  }
};
