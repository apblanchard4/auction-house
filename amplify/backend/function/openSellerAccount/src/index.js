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
    const { username, password, email } = event;


    console.log("Received event:", JSON.stringify(event, null, 2));

    if (!username || !password || !email) {
        console.error("Missing parameters:", { username, password, email });
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Missing required fields' }),
        };
    }

    try {
        const userExists = await checkUserExists(username);
        console.log("checking if user exists complete");

        if (userExists) {
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*",
                },
                body: JSON.stringify({ message: 'User already exists' }),
            };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Creating cognito user");
        const cognitoUser = await createUser(username, password, email);
        console.log("created user in cognito", cognitoUser);

        await saveUserToDatabase(username, hashedPassword);

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
            },
            body: JSON.stringify({
                message: 'User created successfully',
                cognitoUser: cognitoUser,
            }),
        };
    } catch (error) {
        console.error('Error creating seller account:', error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
            },
            body: JSON.stringify({ message: 'Internal server error', error: error.message }),
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
        return true; // User exists
    } catch (error) {
        if (error.code === 'UserNotFoundException') {
            return false; // User does not exist
        }
        throw error;
    }
};

const createUser = async (username, password, email) => {
    const cognitoParams = {
        UserPoolId: USER_POOL_ID,
        Username: username,
        UserAttributes: [
            {
                Name: "email",
                Value: email,
            },
        ],
        TemporaryPassword: Math.random().toString(36).substr(2, 10),
        MessageAction: "SUPPRESS",
    };
    try {
        const user = await cognito.adminCreateUser(cognitoParams).promise();
        const setPasswordParams = {
            UserPoolId: USER_POOL_ID,
            Username: username,
            Password: password,
            Permanent: true,
        };
        await cognito.adminSetUserPassword(setPasswordParams).promise();
        return user;
    } catch (error) {
        console.error('Error creating user in Cognito:', error);
        throw error;
    }
};

const saveUserToDatabase = async (username, hashedPassword) => {
    const connection = await mysql.createConnection(MYSQL_CONFIG);
    console.log("Connected to db")
    try {
        const query = 'INSERT INTO Seller (username, password) VALUES (?, ?)';
        await connection.execute(query, [username, hashedPassword]);
        console.log('User saved to MySQL database with hashed password');
    } finally {
        await connection.end();
    }
};