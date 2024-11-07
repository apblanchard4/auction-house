const mysql = require('mysql2/promise');
const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');

AWS.config.update({ region: 'us-east-1' });

const cognito = new AWS.CognitoIdentityServiceProvider();


exports.handler = async (event) => {
    const { username, password } = event;

    if (!username || !password) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Username and password are required' }),
        };
    }

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        const [rows] = await connection.execute(
            'SELECT password FROM Seller WHERE username = ?',
            [username]
        );

        await connection.end();

        if (rows.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'User not found' }),
            };
        }

        const user = rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Invalid password' }),
            };
        }

        // Authenticate with AWS Cognito and generate a token
        const params = {
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: process.env.COGNITO_CLIENT_ID,
            AuthParameters: {
                USERNAME: username,
                PASSWORD: password,
            },
        };

        const authResult = await cognito.initiateAuth(params).promise();
        const token = authResult.AuthenticationResult.IdToken;

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Login successful',
                token,
            }),
        };

    } catch (error) {
        console.error('Error during authentication:', error);
        return {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' }),
        };
    }
};
