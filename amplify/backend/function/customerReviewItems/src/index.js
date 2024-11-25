const AWS = require('aws-sdk');
const mysql = require('mysql2/promise');
AWS.config.update({ region: 'us-east-1' });

const s3 = new AWS.S3();

exports.handler = async () => {
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

    const [items] = await connection.execute(
      `SELECT * FROM Item WHERE Item.published = 1 AND Item.archived = 0 AND Item.fulfilled = 0`
    );


    const categorizedItems = [];
    const currentDate = new Date();

    for (const item of items) {
      const { id, name, initialPrice, startDate, length, image, description, currentPrice } = item;
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(startDate);
      endDateObj.setDate(endDateObj.getDate() + length);

      // Only add items that are currently active
      if (currentDate >= startDateObj && currentDate <= endDateObj) {
        let signedImageUrl = image; // Default to the stored URL if public

        // Generate a signed URL if the image is in S3 and private
        if (image && image.startsWith('s3://')) {
          const s3Path = image.replace('s3://', ''); // Remove the 's3://' prefix
          const [bucketName, ...keyParts] = s3Path.split('/'); // Split the path into bucket and key
          const key = keyParts.join('/'); // Reassemble the key from the path parts

          signedImageUrl = s3.getSignedUrl('getObject', {
            Bucket: bucketName,
            Key: key,
            Expires: 3600, // URL expiration time in seconds (1 hour)
          });
        }

        categorizedItems.push({
          id,
          name,
          initialPrice,
          startDate: startDateObj.toISOString().split('T')[0],
          endDate: endDateObj.toISOString().split('T')[0],
          image: signedImageUrl,
          description,
          currentPrice,
        });
      }
    }
    console.log('Categorized items:', categorizedItems);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: categorizedItems,
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
