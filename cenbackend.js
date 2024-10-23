// Import required modules
const express = require('express');
const app = express();
const cors = require('cors');
const mqtt = require('mqtt');

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { WebSocket, WebSocketServer } = require("ws");
const http = require("http");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//MQTT broker setup
const brokerUrl = "mqtt://broker.hivemq.com:1883"
const mqttClient = mqtt.connect(brokerUrl);

//MQTT connection
mqttClient.on('connect', () => {
    console.log("connected to broker");
    mqttClient.subscribe('sendstatus', (err) => {
        if (err) {
            console.log('Subscribed to error: ' + err.message);
        }
        else {
            console.log("Subscribed  successfully to sendstatus");
        }
    });
});

const cipProto = protoLoader.loadSync("bag.proto", {});
const gRPCObject = grpc.loadPackageDefinition(cipProto);
const cips = gRPCObject.bag;

let cipList = [];

// Create an HTTP server and a WebSocket server
const server = http.createServer();
const wsServer = new WebSocketServer({ server });
const port = 8081;

// Start the WebSocket server
server.listen(port, () => {
    console.log(`WebSocket server is running on port ${port}`);
});

// Handle new client connections
wsServer.on("connection", (connection) => {
    console.log("Received a new connection");
    connection.send(JSON.stringify({ data: cipList }))
    console.log("Message sent to client");
});

mqttClient.on('message', (topic, message) => {
    if (topic === 'sendstatus') {

        const cipClientInfo = JSON.parse(message.toString());

        const existingClientIndex = cipList?.findIndex(client => client.id === cipClientInfo.id);

        if (existingClientIndex > -1) {

            cipClientInfo.lastUpdatedFrom = Date.now();

            cipList[existingClientIndex] = cipClientInfo;

        } else {
            cipClientInfo.lastUpdatedFrom = Date.now();

            cipClientInfo.client = new cips.Cips(`${cipClientInfo.ipaddress}`, grpc.credentials.createInsecure());

            cipList.push(cipClientInfo);
        }
    }
    console.log(cipList);

    // wsServer.clients?.forEach(client => {
    //     console.log("IN");

    //     if (client.readyState === WebSocket.OPEN) {
    //         console.log("IN GRPC Sending response to WebSocket-Client");
    //         client.send(JSON.stringify(cipList))
    //     }
    // });
});

setInterval(() => {
    const currentTime = Date.now();

    cipList = cipList?.filter(client => {
        console.log(new Date(client.lastUpdatedFrom).getTime(), currentTime);

        console.log(currentTime - new Date(client.lastUpdatedFrom).getTime());

        if (currentTime - new Date(client.lastUpdatedFrom).getTime() < 30000) {
            return true;
        } else {
            clearInterval(null);
            return false;
        }
    });
    console.log("CIPLIST", cipList);

}, 15000);

app.listen(3001, () => {
    console.log("Server running on port 3000");
});
