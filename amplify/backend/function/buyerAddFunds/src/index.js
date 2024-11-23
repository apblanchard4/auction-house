const AWS = require('aws-sdk');
const mysql = require('mysql2/promise');

AWS.config.update({ region: 'us-east-1' });

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

// Database configuration
const MYSQL_CONFIG = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

exports.handler = async (event) => {
  
  const { username, amount } = JSON.parse(event.body);

  if (!username || !amount || amount <= 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid input' }),
    };
  }

  let connection;
  try {
    connection = await mysql.createConnection(MYSQL_CONFIG);
    console.log('Connection to database successful');

    const [buyer] = await connection.query(
      'SELECT funds, inactive FROM Buyer WHERE username = ?',
      [username]
    );

    if (buyer.length === 0 || buyer[0].inactive) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Buyer not found' }),
      };
    }

    const newFunds = parseFloat(buyer[0].funds) + parseFloat(amount);
    
    await connection.query('UPDATE Buyer SET funds = ? WHERE username = ?', [newFunds, username]);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Funds added successfully',
        username: username,
        newFunds: newFunds.toFixed(2),
      }),
    };
  } catch (error) {
    console.error('Error adding funds:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error', error: error.message }),
    };
  } finally {
    if (connection && connection.end) {
      await connection.end();
    }
  }
};

