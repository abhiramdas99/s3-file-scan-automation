const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const sns = new AWS.SNS();

const DEST_BUCKET = process.env.DEST_BUCKET;
const SNS_TOPIC = process.env.SNS_TOPIC;

exports.handler = async (event) => {
    console.log("Event: ", JSON.stringify(event, null, 2));
    const record = event.Records[0];
    const srcBucket = record.s3.bucket.name;
    const srcKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

    // Send initial SNS notification
    const msg = `File '${srcKey}' uploaded successfully. Now scanning the file...`;
    await sns.publish({
        Message: msg,
        TopicArn: SNS_TOPIC,
        Subject: "File Upload Notification"
    }).promise();

    // Simulate virus scan (GuardDuty does not scan individual files)
    const simulatedClean = true;

    if (simulatedClean) {
        // Copy to destination bucket
        await s3.copyObject({
            Bucket: DEST_BUCKET,
            CopySource: `${srcBucket}/${srcKey}`,
            Key: srcKey
        }).promise();

        console.log(`File copied to ${DEST_BUCKET}`);
    }

    return {
        statusCode: 200,
        body: JSON.stringify("Done."),
    };
};
