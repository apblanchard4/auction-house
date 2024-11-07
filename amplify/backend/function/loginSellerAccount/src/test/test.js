const lambdaFunction = require('../index.js');
require('dotenv').config();
const event = {
    username: 'amanda1',
    password: 'amanda1',

};

// Invoke the Lambda function
lambdaFunction.handler(event).then(response => {
    console.log('Response:', response);
}).catch(error => {
    console.error('Error:', error);
});
