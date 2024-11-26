const AWS = require('aws-sdk');
const mysql = require('mysql2/promise');

AWS.config.update({ region: 'us-east-1' });

const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const MYSQL_CONFIG = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};
const pool = mysql.createPool(MYSQL_CONFIG);

exports.handler = async (event) => {
  const { username, itemId, bidAmount } = event;
  if (!username || !itemId || !bidAmount || bidAmount <= 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid input fields' }),
    };
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Check buyer's funds
    const [buyerRows] = await connection.execute('SELECT funds FROM Buyer WHERE username = ?', [username]);
    if (buyerRows.length === 0) throw new Error('Buyer not found');
    const funds = buyerRows[0].funds;
    if (funds < bidAmount) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Insufficient funds' }) };
    }

    // Handle previous highest bid
    const [currentHighestBid] = await connection.execute(
      'SELECT buyerUsername, amount FROM Bid WHERE itemId = ? AND winningBid = 1',
      [itemId]
    );
    if (currentHighestBid.length > 0) {
      const previousBid = currentHighestBid[0];
      await connection.execute('UPDATE Buyer SET funds = funds + ? WHERE username = ?', [previousBid.amount, previousBid.buyerUsername]);
      await connection.execute('UPDATE Bid SET winningBid = 0 WHERE itemId = ? AND buyerUsername = ?', [itemId, previousBid.buyerUsername]);
    }

    // Deduct funds and record new bid
    await connection.execute('UPDATE Buyer SET funds = funds - ? WHERE username = ?', [bidAmount, username]);
    await connection.execute(
      'INSERT INTO Bid (buyerUsername, dateMade, itemId, amount, winningBid) VALUES (?, NOW(), ?, ?, 1)',
      [username, itemId, bidAmount]
    );

    // Update item price
    await connection.execute('UPDATE Item SET currentPrice = ? WHERE id = ?', [bidAmount, itemId]);

    await connection.commit();
    return { statusCode: 200, body: JSON.stringify({ message: 'Bid placed successfully' }) };
  } catch (error) {
    await connection.rollback();
    console.error('Transaction failed:', error);
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal server error' }) };
  } finally {
    connection.release();
  }
};
