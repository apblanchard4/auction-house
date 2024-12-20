const AWS = require('aws-sdk');
const mysql = require('mysql2/promise');
AWS.config.update({ region: 'us-east-1' });
const s3 = new AWS.S3();

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

exports.handler = async (event) => {
  const itemId = event.itemId;

  if (!itemId) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({ message: 'Missing item id' }),
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
      `SELECT * 
        FROM 
            Item
        WHERE 
            id = ?`,
      [itemId]
    );

    const [bids] = await connection.execute(
      `SELECT * 
        FROM 
            Bid
        WHERE 
            itemId = ?`,
      [itemId]
    );

    const categorizedItems = [];

    const currentDate = new Date();

    items.forEach(item => {
      console.log('item:', item);
      const { id, name, initialPrice, published, archived, fulfilled, startDate, length, description, image } = item;
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(startDate);
      endDateObj.setDate(endDateObj.getDate() + length);

      let status;

      if (!published) {
        status = 'inactive';
      } else if (published && currentDate < endDateObj && !archived && !fulfilled) {
        status = 'active';
      } else if (published && currentDate >= endDateObj && !archived && !fulfilled) {
        status = 'failed';
      } else if (published && currentDate >= endDateObj && !archived && !fulfilled) {
        status = 'completed';
      } else if (archived || fulfilled) {
        status = 'archived';
      }

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

        categorizedItems.push({
          id,
          name,
          initialPrice,
          startDate: startDateObj.toISOString().split('T')[0],
          endDate: endDateObj.toISOString().split('T')[0],
          status,
          image: signedImageUrl,
          description,
          bids
        });
      }
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