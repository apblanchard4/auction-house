const AWS = require('aws-sdk');
const mysql = require('mysql2/promise');
AWS.config.update({ region: 'us-east-1' });
const s3 = new AWS.S3();

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

exports.handler = async (event) => {
  const sellerUsername = event.sellerUsername;
  const itemId = event.itemId;

  if (!sellerUsername || !itemId) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      },
      body: JSON.stringify({ message: 'Missing seller username or item id' }),

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
            sellerUsername = ? AND
            id = ?`,
      [sellerUsername, itemId]
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
      const { id, name, initialPrice, currentPrice, published, archived, fulfilled, startDate, length, description, image, frozen, requestUnfrozen, isBoughtNow, isBuyNow } = item;

      // Check if startDate or endDate is null, and set the appropriate message
      let startDateObj = startDate ? new Date(startDate) : 'publish item to set start Date';
      let endDateObj = startDate ? new Date(startDate) : 'publish item to set end Date';
      if (startDate !== null) {
        endDateObj.setDate(endDateObj.getDate() + length);
      }

      let status;
      let bidCount = bids.length

      if (isBoughtNow) {
        status = 'Completed';
      } else {
        if (frozen && currentDate < endDateObj) {
          status = 'Frozen';
          if (requestUnfrozen) status = 'Frozen (Unfreeze Requested)';
        } else if (!published && !archived && !fulfilled) {

          status = 'Inactive';
        } else if (published && currentDate < endDateObj && bidCount >= 0 && !archived && !fulfilled) {
          status = 'Active';
        } else if (published && currentDate >= endDateObj && bidCount === 0 && !archived && !fulfilled) {
          status = 'Failed';
          if (frozen) status = 'Failed (Frozen)'
        } else if (published && currentDate >= endDateObj && bidCount > 0 && !archived && !fulfilled) {
          status = 'Completed';
          if (frozen) status = 'Completed (Frozen)'
        } else if (archived || fulfilled) {

          status = 'Archived';
        }
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
          currentPrice,
          startDate: (startDateObj instanceof Date && !isNaN(startDateObj)) ? startDateObj.toISOString().split('T')[0] : startDateObj,
          endDate: (endDateObj instanceof Date && !isNaN(endDateObj)) ? endDateObj.toISOString().split('T')[0] : endDateObj,
          status,
          length,
          image: signedImageUrl,
          description,
          isBoughtNow,
          isBuyNow,
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