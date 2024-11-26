const AWS = require('aws-sdk');
const mysql = require('mysql2/promise');
AWS.config.update({ region: 'us-east-1' });
const s3 = new AWS.S3();

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
  try {
    const { name, description, initialPrice, length, image, imageFilename, sellerUsername } = JSON.parse(event.body);

    // Validate input
    if (!name || !description || !initialPrice || !length || !image || !imageFilename || !sellerUsername) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*"
        },
        body: JSON.stringify({ message: 'Missing required fields' }),
      };
    }

    // Upload image to S3
    const bucketName = process.env.S3_BUCKET_NAME;
    const imageKey = `images/${Date.now()}_${imageFilename}`;
    const imageBuffer = Buffer.from(image, 'base64');

    await s3.upload({
      Bucket: bucketName,
      Key: imageKey,
      Body: imageBuffer,
      ContentType: 'image/jpeg', // Adjust based on expected file type
    }).promise();

    const s3ImageUrl = `s3://${bucketName}/${imageKey}`;

    // Save item to the database
    const connectConfig = {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    };

    const connection = await mysql.createConnection(connectConfig);

    const query = `
      INSERT INTO Item (name, description, initialPrice, currentPrice, length, image, sellerUsername) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const values = [name, description, initialPrice, initialPrice, length, s3ImageUrl, sellerUsername];
    await connection.execute(query, values);

    await connection.end();

    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({ message: 'Item successfully added' }),
    };
  } catch (error) {
    console.error('Error: ', error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({ message: 'Failed to add item' }),
    };
  }
};
