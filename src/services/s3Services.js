const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

/**
 * Upload buffer to S3
 * @param {Buffer} buffer 
 * @param {string} key 
 * @param {string} contentType 
 * @returns {Promise<string>} CDN URL or S3 URL
 */
async function uploadToS3(buffer, key, contentType) {
    try {
        await s3.send(new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: contentType
        }));

        const cdnBase = process.env.CDN_BASE_URL || `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;
        return `${cdnBase}/${key}`;
    } catch (error) {
        console.error("S3 Upload Error:", error);
        throw new Error("Failed to upload file to storage");
    }
}

module.exports = { uploadToS3 };
