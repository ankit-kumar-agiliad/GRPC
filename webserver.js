


// // Maintain active connections and users
// const clients = {};
// const users = {};
// let editorContent = null;
// let userActivity = [];

// // Handle new client connections
// wsServer.on("connection", function handleNewConnection(connection) {
//   const userId = uuidv4();
//   console.log("Received a new connection");

//   clients[userId] = connection;
//   console.log(`${userId} connected.`);

//   connection.on("message", (message) =>
//     processReceivedMessage(message, userId),
//   );
//   connection.on("close", () => handleClientDisconnection(userId));
// });

// // Handle incoming messages from clients
// function processReceivedMessage(message, userId) {
//     const dataFromClient = JSON.parse(message.toString());
//     const json = { type: dataFromClient.type };
  
//     if (dataFromClient.type === eventTypes.USER_EVENT) {
//       users[userId] = dataFromClient;
//       userActivity.push(`${dataFromClient.username} joined to collaborate`);
//       json.data = { users, userActivity };
//     } else if (dataFromClient.type === eventTypes.CONTENT_CHANGE) {
//       editorContent = dataFromClient.content;
//       json.data = { editorContent, userActivity };
//     }
  
//     sendMessageToAllClients(json);
//   }