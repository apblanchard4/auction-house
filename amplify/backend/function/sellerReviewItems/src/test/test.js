const lambdaFunction = require('../index.js');
require('dotenv').config();
const event = {
        sellerUsername: 'a',
};

// Invoke the Lambda function
lambdaFunction.handler(event).then(response => {
    console.log('Response:', response);
}).catch(error => {
    console.error('Error:', error);
});