<<<<<<< HEAD
const lambdaFunction = require('../index.js');
require('dotenv').config();
const event = {
    sellerUsername: 'a',
    itemId: '1',
    NewName: 'Update',
    newDescription: 'Updated description',
    newImage: 'https://example.com/image.jpg',
    newPrice: 100.50,
    newLength: 14
};

// Invoke the Lambda function
lambdaFunction.handler(event).then(response => {
    console.log('Response:', response);
}).catch(error => {
    console.error('Error:', error);
=======
const lambdaFunction = require('../index.js');
require('dotenv').config();
const event = {
    sellerUsername: 'a',
    itemId: '1',
    NewName: 'Update',
    newDescription: 'Updated description',
    newImage: 'https://example.com/image.jpg',
    newPrice: 100.50,
    newLength: 14
};

// Invoke the Lambda function
lambdaFunction.handler(event).then(response => {
    console.log('Response:', response);
}).catch(error => {
    console.error('Error:', error);
>>>>>>> main
});