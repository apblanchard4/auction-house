

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs'); //use for hashing passwords

exports.handler = async (event) => {

    console.log(`EVENT: ${JSON.stringify(event)}`);
    const { username, password } = JSON.parse(event.body);
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        // Query seller by username
        const [rows] = await connection.execute(
            'SELECT password FROM Seller WHERE username = ?',
            [username]
        );

        await connection.end();

        if (rows.length === 0) {
            // User not found
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'User not found' }),
            };
        }

        // Check if the password matches
        const user = rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            // Password does not match
            return {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*"
                },
                statusCode: 401,
                body: JSON.stringify({ message: 'Invalid password' }),
            };
        }

        // Successful login
        return {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            statusCode: 200,
            body: JSON.stringify({ message: 'Login successful' }),
        };


    } catch (error) {
        console.error('Error during login:', error);
        return {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' }),
        };
    };
};


