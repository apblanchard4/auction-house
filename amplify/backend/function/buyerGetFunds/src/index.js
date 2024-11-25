const AWS = require("aws-sdk");
const mysql = require("mysql2/promise");

AWS.config.update({ region: "us-east-1" });

const MYSQL_CONFIG = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

/**
 * Lambda handler to fetch the current funds of a buyer.
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
  let connection;

  try {
    const { username } = JSON.parse(event.body);

    if (!username) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Username is required." }),
      };
    }

    connection = await mysql.createConnection(MYSQL_CONFIG);
    console.log("Connected to the database successfully.");

    const [buyer] = await connection.query(
      "SELECT funds, inactive FROM Buyer WHERE username = ?",
      [username]
    );

    if (buyer.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Buyer not found." }),
      };
    }

    if (buyer[0].inactive) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: "Buyer account is inactive." }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Funds retrieved successfully.",
        username: username,
        funds: parseFloat(buyer[0].funds).toFixed(2),
      }),
    };
  } catch (error) {
    console.error("Error fetching buyer funds:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error.",
        error: error.message,
      }),
    };
  } finally {
    if (connection && connection.end) {
      await connection.end();
    }
  }
};