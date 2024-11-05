const AWS = require('aws-sdk');
<<<<<<< HEAD
const mysql = require('mysql2/promise');
=======
const { stat } = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config(); //TODO REMOVE AT END!!!!
>>>>>>> eb1e1e8314d06ca127e3316338bdb5aa0d57afd1

AWS.config.update({ region: 'us-east-1' });

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

exports.handler = async (event) => {
    
    //extract sellerID from event
    const sellerUsername = event.sellerUsername; 
    console.log('sellerUsername:', sellerUsername);
    if(!sellerUsername) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify({message: 'Missing sellerID'}),
        };
    }

    const connectConfig = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    }
console.log('connectConfig:', connectConfig);
    let connection;
    try {
        connection = await mysql.createConnection(connectConfig);
        console.log('Connection to database successful');
        
        const [items] = await connection.execute(
            `SELECT i.id, 
            i.name AS itemName, 
            i.initialPrice AS price,
            i.published, 
            i.archived, 
            i.fulfilled, 
            i.startDate, 
            i.length,
            (SELECT COUNT(*) FROM Bid WHERE Bid.itemName = i.name) AS bidCount
        FROM 
            Item AS i
        WHERE 
            i.sellerUsername = ?`, 
        [sellerUsername]
    );

    const categorizedItems = [];

    const currentDate = new Date();

    items.forEach(item => {
        const { id, itemName, price, published, archived, fulfilled, startDate, length, bidCount } = item;
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(startDate);
        endDateObj.setDate(endDateObj.getDate() + length);

        let status;

        if(!published){
            status = 'inactive';
        } else if (published && currentDate < endDateObj && bidCount === 0 && !archived && !fulfilled) {
            status = 'active';
        } else if (published && currentDate >= endDateObj && bidCount === 0 && !archived && !fulfilled) {
            status = 'failed';
        } else if (published && currentDate >= endDateObj && bidCount > 0 && !archived && !fulfilled) {
            status = 'completed';
        } else if (archived || fulfilled) {
            status = 'archived';
        } 

        categorizedItems.push({
            id,
            itemName,
            price,
            startDate: startDateObj.toISOString().split('T')[0],
            endDate: endDateObj.toISOString().split('T')[0],
            status
        });
    });

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*"
        },
        body: JSON.stringify(categorizedItems),
    };

} catch (error) {
    console.error('Error: ', error);
    return {
        statusCode: 400,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*"
        },
        body: JSON.stringify({message: 'Failed to review items'}),
    };
} finally {
    if(connection && connection.end) {
        await connection.end();
    }
}

};