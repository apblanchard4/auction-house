const lambdaFunction = require('../index.js');
require('dotenv').config();

const validEvent = {
    sellerUsername: 'amanda1',
    itemId: '1',
};

const invalidEventMissingFields = {
    sellerUsername: 'a',
};

const invalidEventNoName = {
    sellerUsername: 'a',
    itemId: '2',
};

const invalidEventLowPrice = {
    sellerUsername: 'a',
    itemId: '3',
};

const invalidEventNoImage = {
    sellerUsername: 'a',
    itemId: '4',
};

async function testLambda() {
    console.log('Running tests for Lambda function...');

    // Test case 1: Valid item
    console.log('Test case 1: Valid item');
    try {
        const response = await lambdaFunction.handler(validEvent);
        console.log('Response:', response);
    } catch (error) {
        console.error('Error:', error);
    }

    // Test case 2: Missing required fields (itemId)
    console.log('Test case 2: Missing required fields (itemId)');
    try {
        const response = await lambdaFunction.handler(invalidEventMissingFields);
        console.log('Response:', response);
    } catch (error) {
        console.error('Error:', error);
    }

    // Test case 3: Item with no name
    console.log('Test case 3: Item with no name');
    try {
        const response = await lambdaFunction.handler(invalidEventNoName);
        console.log('Response:', response);
    } catch (error) {
        console.error('Error:', error);
    }

    // Test case 4: Item with price below $1
    console.log('Test case 4: Item with price below $1');
    try {
        const response = await lambdaFunction.handler(invalidEventLowPrice);
        console.log('Response:', response);
    } catch (error) {
        console.error('Error:', error);
    }

    // Test case 5: Item with no image
    console.log('Test case 5: Item with no image');
    try {
        const response = await lambdaFunction.handler(invalidEventNoImage);
        console.log('Response:', response);
    } catch (error) {
        console.error('Error:', error);
    }

    console.log('Tests completed.');
}

testLambda();
