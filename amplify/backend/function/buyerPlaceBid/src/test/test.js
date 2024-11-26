const lambdaFunction = require('../index.js');
// Mock event data for testing account creation
const event = {
    username: 'testBuyer',
    itemId: '1',
    bidAmount: 100,
};

// Invoke the Lambda function
lambdaFunction.handler(event).then(response => {
    console.log('Response:', response);
}).catch(error => {
    console.error('Error:', error);
});
