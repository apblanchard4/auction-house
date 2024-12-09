const AWS = require('aws-sdk');
const mysql = require('mysql2/promise');

AWS.config.update({ region: 'us-east-1' });

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

exports.handler = async (event) => {
  const connectConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };

  const { startDate, endDate } = event;

  let connection;

  try {
    connection = await mysql.createConnection(connectConfig);
    console.log('Connection to database successful');

    // Fetch bids and item information within the date range
    const [bids] = await connection.execute(
      `
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
      WHERE b.dateMade BETWEEN ? AND ?
      `,
      [startDate, endDate]
    );

    if (bids.length === 0) {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
        },
        body: JSON.stringify({ message: 'No data found for the selected date range' }),
      };
    }

    // Data analysis
    let totalBids = bids.length;
    let totalEarnings = 0;
    let totalFulfilledItems = 0;
    let totalBidAmount = 0;
    let highestBid = { amount: 0, buyerUsername: null, itemName: null };
    let buyerSpends = {};

    let dailyBids = {};
    let itemCounts = {};
    let auctionDetails = [];

    bids.forEach((bid) => {
      // Convert bid.amount to a number
      const bidAmount = parseFloat(bid.amount);
      totalBidAmount += bidAmount;

      // Accumulate earnings
      if (bid.itemFulfilled) {
        const commission = bid.amount * 0.05;
        totalEarnings += commission;
        totalFulfilledItems += 1;
      }

      // Update highest bid
      if (bidAmount > highestBid.amount) {
        highestBid = {
          amount: bidAmount,
          buyerUsername: bid.buyerUsername,
          itemName: bid.itemName,
        };
      }

      // Track spending per buyer
      buyerSpends[bid.buyerUsername] = (buyerSpends[bid.buyerUsername] || 0) + bidAmount;

      // Daily activity
      const date = new Date(bid.dateMade).toISOString().split('T')[0];
      dailyBids[date] = (dailyBids[date] || 0) + 1;

      // Item bid counts
      itemCounts[bid.itemId] = (itemCounts[bid.itemId] || 0) + 1;

      // Detailed auction record
      auctionDetails.push({
        bidId: bid.bidId,
        itemId: bid.itemId,
        itemName: bid.itemName,
        buyerUsername: bid.buyerUsername,
        amount: bidAmount.toFixed(2),
        dateMade: bid.dateMade,
        fulfilled: bid.itemFulfilled === 1,
        commission: bid.itemFulfilled === 1 ? (bidAmount * 0.05).toFixed(2) : "0.00",
      });
    });

    // Top buyer
    const topBuyer = Object.entries(buyerSpends).reduce(
      (max, [buyer, spend]) => (spend > max.spend ? { buyer, spend } : max),
      { buyer: null, spend: 0 }
    );

    // Sort items by popularity
    const popularItems = Object.entries(itemCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([itemId, count]) => ({ itemId, count }));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      },
      body: JSON.stringify({
        summary: {
          totalBids,
          totalEarnings: totalEarnings.toFixed(2),
          totalFulfilledItems,
          averageBidAmount: (totalBidAmount / totalBids).toFixed(2),
          highestBid,
          topBuyer,
        },
        trends: {
          dailyBids,
          popularItems,
        },
        details: auctionDetails,
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
      body: JSON.stringify({ message: 'Failed to generate forensics report' }),
    };
  } finally {
    if (connection && connection.end) {
      await connection.end();
    }
  }
};
