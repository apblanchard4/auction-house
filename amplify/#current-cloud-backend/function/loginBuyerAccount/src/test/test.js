<<<<<<< HEAD
const lambdaFunction = require('../index.js');

const event = {
    username: 'testUser',
    password: 'testPassword',

};

// Invoke the Lambda function
lambdaFunction.handler(event).then(response => {
    console.log('Response:', response);
}).catch(error => {
    console.error('Error:', error);
});
=======
const lambdaFunction = require('../index.js');

const event = {
    username: 'testUser',
    password: 'testPassword',

};

// Invoke the Lambda function
lambdaFunction.handler(event).then(response => {
    console.log('Response:', response);
}).catch(error => {
    console.error('Error:', error);
});
>>>>>>> main
