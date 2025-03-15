const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const params = {
    TableName: process.env.TARGET_TABLE, 
    Item: {
      id: "UUID v4", // Generate a unique ID
      principalId: 10,
      createdAt: new Date().toISOString(),
      body: { key: "value" },
    },
  };

  try {
    await dynamoDb.put(params).promise();
    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Event created successfully" }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to create event" }),
    };
  }
};