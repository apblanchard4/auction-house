const lambdaFunction = require('../index.js');

const event = {
    body: JSON.stringify({
        username: 'testUser',
        password: 'testPassword',
        email: 'email.com'
    }),
};


lambdaFunction.handler(event).then(response => {
    console.log('Response:', response);
}).catch(error => {
    console.error('Error:', error);
});
