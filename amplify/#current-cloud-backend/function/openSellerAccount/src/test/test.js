const lambdaFunction = require('../index.js');
// Mock event data for testing account creation
const event = {
    body: JSON.stringify({
        username: 'testUser',
        password: 'testPassword',
        email: 'test@example.com'
    }),
};

// Invoke the Lambda function
lambdaFunction.handler(event).then(response => {
    console.log('Response:', response);
}).catch(error => {
    console.error('Error:', error);
});
