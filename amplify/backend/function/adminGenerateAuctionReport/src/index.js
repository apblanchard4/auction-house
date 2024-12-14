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

    // Query to get all bids and items, including the "isBuyNow" status in bids
    const [bidsAndItems] = await connection.execute(`
      SELECT 
        b.id AS bidId, 
        b.buyerUsername, 
        b.amount, 
        b.dateMade, 
        b.isBuyNow AS bidIsBuyNow, 
        i.id AS itemId, 
        i.name AS itemName, 
        i.fulfilled, 
        i.currentPrice, 
        i.startDate
      FROM Item i
      LEFT JOIN Bid b ON b.itemId = i.id
    `);

    // Group data by itemId
    const groupedItems = bidsAndItems.reduce((acc, entry) => {
      if (!acc[entry.itemId]) {
        acc[entry.itemId] = {
          itemName: entry.itemName,
          fulfilled: entry.fulfilled === 1,
          currentPrice: entry.currentPrice || 0,
          startDate: entry.startDate || null,
          bids: []
        };
      }

      if (entry.bidId) {
        acc[entry.itemId].bids.push(entry);
      }

      return acc;
    }, {});

    let auctionReport = [];
    let totalAuctionEarnings = 0;

    // Process each item
    for (const itemId in groupedItems) {
      const { itemName, fulfilled, bids, currentPrice, startDate } = groupedItems[itemId];

      // Separate "Buy Now" bids and regular bids
      const buyNowBids = bids.filter(bid => bid.bidIsBuyNow === 1);
      const regularBids = bids.filter(bid => bid.bidIsBuyNow !== 1);

      // Determine the highest regular bid
      const highestRegularBid = regularBids.reduce((max, bid) => (bid.amount > max.amount ? bid : max), { amount: 0 });

      let earnings = 0;

      if (fulfilled) {
        // Calculate earnings for "Buy Now" bids
        buyNowBids.forEach(buyNowBid => {
          const buyNowEarnings = buyNowBid.amount * 0.05;
          totalAuctionEarnings += buyNowEarnings;

          // Add "Buy Now" bid to report
          auctionReport.push({
            bidId: buyNowBid.bidId,
            itemId: buyNowBid.itemId,
            itemName: buyNowBid.itemName,
            buyerUsername: buyNowBid.buyerUsername,
            amount: parseFloat(buyNowBid.amount).toFixed(2),
            dateMade: buyNowBid.dateMade,
            fulfilled: true,
            earnings: buyNowEarnings.toFixed(2),
            isBuyNow: true,
          });
        });

        // Calculate earnings for the highest regular bid
        if (highestRegularBid.amount > 0) {
          earnings = highestRegularBid.amount * 0.05;
          totalAuctionEarnings += earnings;
        }
      }

      // Include all regular bids for this item in the report
      regularBids.forEach((bid) => {
        auctionReport.push({
          bidId: bid.bidId,
          itemId: bid.itemId,
          itemName: bid.itemName,
          buyerUsername: bid.buyerUsername,
          amount: parseFloat(bid.amount).toFixed(2),
          dateMade: bid.dateMade,
          fulfilled: fulfilled,
          earnings: bid.bidId === highestRegularBid.bidId && fulfilled ? earnings.toFixed(2) : "0.00",
          isBuyNow: false,
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
