const lambdaFunction = require('../index.js');

// Mock event data for testing account creation
const event = {
    body: JSON.stringify({
        username: 'buyer1',
        amount: 50
    })
};

// Invoke the Lambda function
lambdaFunction.handler(event).then(response => {
    console.log('Response:', response);
}).catch(error => {
    console.error('Error:', error);
});