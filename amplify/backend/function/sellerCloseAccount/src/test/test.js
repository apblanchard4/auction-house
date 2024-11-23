const lambdaFunction = require('../index.js');
// Mock event data for testing account creation
const event = {
    username: 'amanda',
    password: '$2a$10$sLwhLoI4.aT/C0soTpgxUePXHk1oJBEtOdar96pkenyGufU5UZudG'
    //email: 'test@example.com'
};

// Invoke the Lambda function
lambdaFunction.handler(event).then(response => {
    console.log('Response:', response);
}).catch(error => {
    console.error('Error:', error);
});
