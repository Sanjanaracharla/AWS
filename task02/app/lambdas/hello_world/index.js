exports.handler = async (event) => {
    const path = event.rawPath; 
    const method = event.requestContext.http.method;
 
    if (path === "/hello" && method === "GET") {
        return {
            "statusCode": 200,
            "body": {
              "statusCode": 200,
              "message": "Hello from Lambda"
            },
            "headers": {
              "content-type": "application/json"
            },
            "isBase64Encoded": false
          }
    }
 
    return {
        "statusCode": 400,
        "body": {
          "statusCode": 400,
          "message": `Bad request syntax or unsupported method. Request path: ${path}. HTTP method: ${method}`
        },
        "headers": {
          "content-type": "application/json"
        },
        "isBase64Encoded": false
      }
};