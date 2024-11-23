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

    const hasActiveBids = await checkActiveBids(username);

    if(hasActiveBids){
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
    console.log("checking if user exists")
    await cognito.adminGetUser(params).promise();
    return true; 
  } catch (error) {
    if (error.code === 'UserNotFoundException') {
      return false; 
    }
    throw error;
  }
};

const checkActiveBids = async (username) => {
  console.log("checking active bids")

  try{
    const query = 'SELECT COUNT(*) AS activeBids FROM Bid JOIN Item ON Bid.itemName = Item.name WHERE Bid.buyerUsername = ? AND Item.frozen = 0 AND Item.fulfilled = 0';
    const [rows] = await pool.execute(query, [username]);
    return rows[0].activeBids > 0;
  } catch(error){
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
    await cognito.adminDeleteUser(params).promise();
    console.log('Buyer deleted from Cognito:', username);
  } catch (error) {
    console.error('Error deleting user from cognito:', error);
    throw error;
  }
};

const setUserInactive = async (username) => {
  try {
    const query = 'UPDATE Buyer SET inactive = 1 WHERE username = ?';
    await pool.execute(query, [username]);
    console.log('User set to inactive in MySQL:', username);
  } catch(error){
    console.error('Error setting user to inactive:', error);
    throw error;
  }
};

