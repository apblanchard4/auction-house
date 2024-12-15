const AWS = require('aws-sdk');
const mysql = require('mysql2/promise');

AWS.config.update({ region: 'us-east-1' });

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

exports.handler = async (event) => {

    //extract sellerID from event
    const sellerUsername = event.sellerUsername;
    console.log('sellerUsername:', sellerUsername);
    if (!sellerUsername) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify({ message: 'Missing sellerID' }),
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
            i.frozen,
            i.requestUnfrozen,
            i.startDate, 
            i.length,
            i.isBuyNow,
            (SELECT COUNT(*) FROM Bid WHERE Bid.itemId = i.id) AS bidCount
        FROM 
            Item AS i
        WHERE 
            i.sellerUsername = ?`,
            [sellerUsername]
        );

        const categorizedItems = [];

        const currentDate = new Date();

        items.forEach(item => {
            console.log('item:', item);
            let { id, itemName, price, published, archived, fulfilled, startDate, length, description, image, frozen, requestUnfrozen, isBuyNow, bidCount } = item;
      
            // Check if startDate or endDate is null, and set the appropriate message
            let startDateObj = startDate ? new Date(startDate) : 'Publish item to set start date';
            let endDateObj = startDate ? new Date(startDate) : 'Publish item to set end date';
            if (startDate !== null) {
              endDateObj.setDate(endDateObj.getDate() + length);
            }
            if (isBuyNow) {
                bidCount = 1;
                console.log("Bid Count: " + bidCount);
            }


            let status;

            if (frozen && requestUnfrozen) {
                status = 'Frozen (Unfreeze Requested)';
            } else if (frozen) {
                status = 'Frozen';
            } else if(!published){
                status = 'Inactive';
            } else if (published && currentDate < endDateObj && bidCount >= 0 && !archived && !fulfilled) {
                status = 'Active';
            } else if (published && currentDate >= endDateObj && bidCount === 0 && !archived && !fulfilled) {
                status = 'Failed';
            } else if (published && currentDate >= endDateObj && bidCount > 0 && !archived && !fulfilled) {
                status = 'Completed';
            } else if (archived || fulfilled) {
                status = 'Archived';
            } 

            categorizedItems.push({
                id,
                itemName,
                price,
                startDate: (startDateObj instanceof Date && !isNaN(startDateObj)) ? startDateObj.toISOString().split('T')[0] : startDateObj,
                endDate: (endDateObj instanceof Date && !isNaN(endDateObj)) ? endDateObj.toISOString().split('T')[0] : endDateObj,
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
            body: JSON.stringify({ message: 'Failed to review items' }),
        };
    } finally {
        if (connection && connection.end) {
            await connection.end();
        }
    }

};