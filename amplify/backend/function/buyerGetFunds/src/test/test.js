const lambdaFunction = require('../index.js');

// Mock event data for testing account creation
const event = {
    username: 'buyer1',
    password: '$2a$10$6QpmX2OUWz17lWJVdJ/AIu.oYkwp0L19knX6vvG0yKMcHHXQjUFR6'
    //email: 'test@example.com'
};

// Invoke the Lambda function
lambdaFunction.handler(event).then(response => {
    console.log('Response:', response);
}).catch(error => {
    console.error('Error:', error);
});