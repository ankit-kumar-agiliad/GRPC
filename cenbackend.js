const express = require('express');
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const mqtt = require('mqtt');

const brokerUrl = "mqtt://broker.hivemq.com:1883"
const mqttClient = mqtt.connect(brokerUrl);

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const cipProto = protoLoader.loadSync("cip.proto", {});
const gRPCObject = grpc.loadPackageDefinition(cipProto);
const cips = gRPCObject.cips;

let cipList = [];

// Import required modules
const { WebSocket, WebSocketServer } = require("ws");
const http = require("http");

// Create an HTTP server and a WebSocket server
const server = http.createServer();
const wsServer = new WebSocketServer({ server });
const port = 8081;

// Start the WebSocket server
server.listen(port, () => {
    console.log(`WebSocket server is running on port ${port}`);
});

// // Handle new client connections
wsServer.on("connection", (connection) => {
    console.log("Received a new connection");
    const msg = { data: "SEnding this message from server" }
    connection.send(JSON.stringify(msg))
    console.log("Message sent to client");

    // connection.on("close", () => console.log("CLosing web socket connection"));
});

mqttClient.on('connect', () => {
    console.log("connected to broker");
    mqttClient.subscribe('equipment/status', (err) => {
        if (err) {
            console.log('Subscribed to error: ' + err.message);

        }
        else {
            console.log("Subscribed to successfully topic");

        }
    });
});

app.get('/test', (req, res) => {
    const id = req.query.id;

    const cip = cipList.find(cip => cip.id === id);
    // startStreaming();

    cip.client.Getname({ id: cip.id, name: "", port: "" }, (err, response) => {
        if (err) {
            console.log("IN ERROR CEN")
            console.log(err.message);
            res.send(err.message)
        } else {
            let streamdata;
            let resData = response;
            let arr = response.equipment.equipmentname;

            mqttClient.on('message', (topic, message) => {

                streamdata = JSON.parse(JSON.parse(message));

                if (streamdata) {

                    let i = arr?.findIndex((data) => data.name === streamdata.name);

                    if (i !== -1) {

                        arr[i].status = streamdata.status;

                        resData.equipment.equipmentname = arr;

                        console.log("Updated array", JSON.stringify(resData));

                        wsServer.clients.forEach(client => {
                            console.log(client);

                            if (client.readyState === WebSocket.OPEN) {
                                console.log("Response send to websocket client: ", resData);

                                client.send(JSON.stringify(resData))
                            }
                        });
                    }
                }
            })
            res.send(JSON.stringify(resData))
        }

    })


})

app.post("/cips", (req, res) => {
    const { id, name, port } = req.body;
    const clientInfo = {
        name, id, port, ip: `0.0.0.1:${port}`, client: new cips.Cips(`127.0.0.1:${port}`, grpc.
            credentials.createInsecure())
    }

    cipList.push(clientInfo);

    res.send(cipList)
})

app.listen(3001, () => {
    console.log("Server running on port 3000");
});
