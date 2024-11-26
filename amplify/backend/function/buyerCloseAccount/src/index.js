const AWS = require('aws-sdk');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

AWS.config.update({ region: 'us-east-1' });

const cognito = new AWS.CognitoIdentityServiceProvider();
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const MYSQL_CONFIG = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};
const pool = mysql.createPool(MYSQL_CONFIG);

exports.handler = async (event) => {
  const { username, password } = event;
  console.log("Received event:", JSON.stringify(event, null, 2));

  if (!username || !password) {
    console.error("Missing parameters:", { username, password });
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing required fields' }),
    };
  }

  try {
    const userExists = await checkUserExists(username);

    if (!userExists) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
        },
        body: JSON.stringify({ message: 'Buyer does not exist' }),
      };
    }

    const passwordValid = await validatePassword(username, password);
    isPasswordValid = JSON.stringify(passwordValid)
    console.log("Validate pw" + isPasswordValid)


    if (isPasswordValid === "false") {
      return {
        statusCode: 401,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
        },
        body: JSON.stringify({ message: 'Invalid password' }),
      };
    }

    const hasActiveBids = await checkActiveBids(username);
    if (hasActiveBids) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
        },
        body: JSON.stringify({ message: 'Buyer has active bids' }),
      };
    }

   await deleteFromCognito(username);
    await setUserInactive(username);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      },
      body: JSON.stringify({ message: 'Buyer account closed' }),
    };
  } catch (error) {
    console.error('Error closing buyer account:', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      },
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};

const checkUserExists = async (username) => {
  const params = {
    UserPoolId: USER_POOL_ID,
    Username: username,
  };

  try {
    console.log("Checking if user exists in Cognito...");
    await cognito.adminGetUser(params).promise();
    return true;
  } catch (error) {
    if (error.code === 'UserNotFoundException') {
      return false;
    }
    throw error;
  }
};

const validatePassword = async (username, password) => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    const [rows] = await connection.execute(
      'SELECT password FROM Buyer WHERE username = ?',
      [username]
    );

    await connection.end();

    if (rows.length === 0) {
     return false; 
    }

    const user = rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log("PW Match" + passwordMatch)
    return passwordMatch

  } catch (error) {
    console.error('Error validating password:', error);
    throw error;
  }
};

const checkActiveBids = async (username) => {
  try {
    const query = `
      SELECT COUNT(*) AS activeBids 
      FROM Bid 
      JOIN Item ON Bid.itemId = Item.Id 
      WHERE Bid.buyerUsername = ? AND Item.frozen = 0 AND Item.fulfilled = 0
    `;
    const [rows] = await pool.execute(query, [username]);
    return rows[0].activeBids > 0;
  } catch (error) {
    console.error('Error checking active bids:', error);
    throw error;
  }
};

const deleteFromCognito = async (username) => {
  const params = {
    UserPoolId: USER_POOL_ID,
    Username: username,
  };

  try {
    console.log("Deleting user from Cognito...");
   await cognito.adminDeleteUser(params).promise();
    console.log('Buyer deleted from Cognito:', username);
  } catch (error) {
    console.error('Error deleting user from Cognito:', error);
    throw error;
  }
};

const setUserInactive = async (username) => {
  try {
    console.log("Setting user to inactive...");
    const query = 'UPDATE Buyer SET inactive = 1 WHERE username = ?';
   await pool.execute(query, [username]);
    console.log('User set to inactive in MySQL:', username);
  } catch (error) {
    console.error('Error setting user to inactive:', error);
    throw error;
  }
};