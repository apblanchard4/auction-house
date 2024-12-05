const AWS = require('aws-sdk');
const mysql = require('mysql2/promise');
AWS.config.update({ region: 'us-east-1' });

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

    // Query to get all bids and item information
    const [bids] = await connection.execute(`
      SELECT 
        b.id AS bidId, 
        b.buyerUsername, 
        b.amount, 
        b.dateMade, 
        i.id AS itemId, 
        i.name AS itemName, 
        i.fulfilled AS itemFulfilled
      FROM Bid b
      JOIN Item i ON b.itemId = i.id
    `);

    // Group bids by itemId
    const groupedItems = bids.reduce((acc, bid) => {
      if (!acc[bid.itemId]) {
        acc[bid.itemId] = { 
          itemName: bid.itemName, 
          fulfilled: bid.itemFulfilled === 1, 
          bids: [] 
        };
      }
      acc[bid.itemId].bids.push(bid);
      return acc;
    }, {});

    let auctionReport = [];
    let totalAuctionEarnings = 0;

    // Process each item
    for (const itemId in groupedItems) {
      const { itemName, fulfilled, bids } = groupedItems[itemId];

      // Determine the highest bid
      const highestBid = bids.reduce((max, bid) => (bid.amount > max.amount ? bid : max), { amount: 0 });

      const earnings = fulfilled ? highestBid.amount * 0.05 : 0;
      if (fulfilled) {
        totalAuctionEarnings += earnings;
      }

      // Include all bids for this item in the report
      bids.forEach((bid) => {
        auctionReport.push({
          bidId: bid.bidId,
          itemId: bid.itemId,
          itemName: bid.itemName,
          buyerUsername: bid.buyerUsername,
          amount: parseFloat(bid.amount).toFixed(2),
          dateMade: bid.dateMade,
          fulfilled: fulfilled,
          earnings: bid.bidId === highestBid.bidId && fulfilled ? earnings.toFixed(2) : "0.00",
        });
      });
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      },
      body: JSON.stringify({
        auctionReport,
        totalAuctionEarnings: totalAuctionEarnings.toFixed(2),
      }),
    };
  } catch (error) {
    console.error('Error: ', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      },
      body: JSON.stringify({ message: 'Failed to generate auction report' }),
    };
  } finally {
    if (connection && connection.end) {
      await connection.end();
    }
  }
};