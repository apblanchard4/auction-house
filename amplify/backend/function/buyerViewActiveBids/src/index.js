const AWS = require('aws-sdk');
const mysql = require('mysql2/promise');
AWS.config.update({ region: 'us-east-1' });

const s3 = new AWS.S3();

exports.handler = async (event) => {
  const connectConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };

  let connection;
  try {
    connection = await mysql.createConnection(connectConfig);
    console.log('Connection to database successful');

    const buyerUsername = event.buyerUsername

    //get the winning bids associated with this buyerUsername
    const [bids] = await connection.execute(
      `SELECT * FROM Bid WHERE buyerUsername = ? AND winningBid = 1`,
      [buyerUsername]
    );

    let purchases = []
    if (bids.length === 0) {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*"
        },
        body: purchases,
      };
    }
    else {

      //get the name of the item and the bid amount
      for (const bid of bids) {
        const { itemId, amount } = bid;
        const [items] = await connection.execute(
          `SELECT * FROM Item WHERE Item.id = ?`,
          [itemId]
        );
        //check the date to make sure these auctions have not been completed
        const currentDate = new Date();
        const { startDate, length } = items[0];
        const endDateObj = new Date(startDate);
        endDateObj.setDate(endDateObj.getDate() + length);
        if (currentDate > endDateObj) {
          const { name } = items[0];
          purchases.push({
            name,
            amount
          });
        }

      }
      console.log(purchases)

    }
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: purchases,
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
