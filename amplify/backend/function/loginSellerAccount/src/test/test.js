const lambdaFunction = require('../index.js');
require('dotenv').config();
const event = {
    body: JSON.stringify({
        username: 'ab',
        password: 'pass123',
    }),
};

// Invoke the Lambda function
lambdaFunction.handler(event).then(response => {
    console.log('Response:', response);
}).catch(error => {
    console.error('Error:', error);
});
