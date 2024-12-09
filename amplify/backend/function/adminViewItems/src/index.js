const AWS = require('aws-sdk');
const mysql = require('mysql2/promise');
AWS.config.update({ region: 'us-east-1' });

const s3 = new AWS.S3();

exports.handler = async () => {
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

    const [items] = await connection.execute(
      `SELECT * FROM Item `
    );

    const categorizedItems = [];

    for (const item of items) {
      const { id, name, frozen, requestUnfrozen } = item;

      categorizedItems.push({
        id,
        name,
        frozen,
        requestUnfrozen,
      });
    }

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