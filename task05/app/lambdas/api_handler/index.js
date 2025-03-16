import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const dynamoDBClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

const TABLE_NAME = process.env.TARGET_TABLE;

export const handler = async (event) => {
    try {
        console.log("Received event:", JSON.stringify(event, null, 2));

        if (!TABLE_NAME) {
            console.error("Error: TARGET_TABLE environment variable is not set.");
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "Server configuration error: Table name missing." }),
            };
        }

        let inputEvent;
        try {
            inputEvent = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
        } catch (parseError) {
            console.error("Error parsing event body:", parseError);
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Invalid JSON format in request body" }),
            };
        }

        // Corrected validation to use 'body' instead of 'content'
        if (!inputEvent?.principalId || !inputEvent?.body) {
            console.error("Validation failed: Missing required fields", inputEvent);
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Invalid input: principalId and body are required" }),
            };
        }

        const eventId = uuidv4();
        const createdAt = new Date().toISOString();

        const eventItem = {
            id: eventId,
            principalId: Number(inputEvent.principalId),
            createdAt,
            body: inputEvent.body,  // Changed from 'content' to 'body'
        };

        console.log("Saving to DynamoDB:", JSON.stringify(eventItem, null, 2));

        try {
            await docClient.send(new PutCommand({
                TableName: TABLE_NAME,
                Item: eventItem,
            }));
        } catch (dbError) {
            console.error("DynamoDB put error:", dbError);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: "Failed to save event to DynamoDB", error: dbError.message }),
            };
        }

        return {
            statusCode: 201,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(eventItem)  // Directly return the event item
        };

    } catch (error) {
        console.error("Error processing request:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error", error: error.message }),
        };
    }
};