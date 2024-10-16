const express = require('express');
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// const mqtt = require('mqtt');

// const brokerUrl = "mqtt://broker.hivemq.com:1883"
// const mqttClient = mqtt.connect(brokerUrl);

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const cipProto = protoLoader.loadSync("main.proto", {});
const gRPCObject = grpc.loadPackageDefinition(cipProto);
const cips = gRPCObject.grpc;

let cipList = [];

// Import required modules
// const { WebSocket, WebSocketServer } = require("ws");
// const http = require("http");

// Create an HTTP server and a WebSocket server
// const server = http.createServer();
// const wsServer = new WebSocketServer({ server });
// const port = 8081;

// Start the WebSocket server
// server.listen(port, () => {
//     console.log(`WebSocket server is running on port ${port}`);
// });

// let displayMethod;

// // Handle new client connections
// wsServer.on("connection", (connection) => {
//     console.log("Received a new connection");
//     connection.on("message", (message) => {
//         displayMethod = message.toString();
//         console.log("++++++++++", message.toString())
//         mqttClient.publish('getmethod/status', displayMethod)

//     });
//     const msg = { data: "SEnding this message from server" }
//     connection.send(JSON.stringify(msg))
//     console.log("Message sent to client");

//     // connection.on("close", () => console.log("CLosing web socket connection"));
// });

// mqttClient.on('connect', () => {
//     console.log("connected to broker");
//     mqttClient.subscribe('equipment/status', (err) => {
//         if (err) {
//             console.log('Subscribed to error: ' + err.message);

//         }
//         else {
//             console.log("Subscribed to successfully topic");

//         }
//     });
// });

app.get('/test', (req, res) => {
    const id = req.query.id;
    let resData;
    const cip = cipList.find(cip => cip.id === id);
    console.log(cip.id, cip.name);

    const request = {
        clientId: parseInt(cip.id), clientName: "Ottawa_CIP1"
    }
    console.log(request);


    cip.client.GetStatusStream(request).on("data", status => {
        console.log(JSON.stringify(status));
        resData = status;

        cip.client.GetEquipmentListStream().on("data", data => {
            console.log(JSON.stringify(data));

        }).on("error", (error) => {
            console.log(`Error occured : ${error.message}`);
        }).on("end", () => {
            console.log("Ending equipmentliststream");
        })



    }).on("error", (err) => {
        console.log(err);

    }).on("end", () => {
        console.log("Ending stream");

    })
    // let streamdata;
    // let resData = response;
    // let arr = response.equipment.equipmentname;

    // if (displayMethod !== "GRPC") {

    //     mqttClient.on('message', (topic, message) => {

    //         streamdata = JSON.parse(JSON.parse(message));

    //         if (streamdata) {

    //             let i = arr?.findIndex((data) => data.name === streamdata.name);

    //             if (i !== -1) {

    //                 arr[i].status = streamdata.status;

    //                 resData.equipment.equipmentname = arr;

    //                 console.log("Updated array", JSON.stringify(resData));

    //                 // wsServer.clients.forEach(client => {

    //                 //     if (client.readyState === WebSocket.OPEN) {
    //                 //         console.log("Response send to websocket client: ", resData);

    //                 //         client.send(JSON.stringify(resData))
    //                 //     }
    //                 // });
    //             }
    //         }
    //     })
    // } else {
    // cip.client.GetEquipmentStatus({ id: id })
    //     .on("data", (status) => {

    //         console.log("response1", JSON.stringify(status));

    //         streamdata = status

    //         // let arr = response.equipment.equipmentname

    //         console.log(response.equipment, "resData", arr)

    //         if (streamdata) {

    //             let i = arr?.findIndex(data => data.name === streamdata.name)

    //             arr[i].status = streamdata.status

    //             resData.equipment.equipmentname = arr

    //             console.log("array", JSON.stringify(resData));

    //             // wsServer.clients.forEach(client => {
    //             //     console.log(client);

    //             //     if (client.readyState === WebSocket.OPEN) {
    //             //         console.log("IN GRPC Sending response to WebSocket-Client");

    //             //         client.send(JSON.stringify(resData))
    //             //     }
    //             // });


    //         }
    //     })
    //     .on("end", () => {
    //         console.log("Server has ended the stream.");
    //     });
    // }
    res.send(JSON.stringify(resData))
})

app.post("/cips", (req, res) => {
    const { id, name, port } = req.body;
    const clientInfo = {
        name, id, port, ip: `0.0.0.1:${port}`, client: new cips.EquipmentService(`127.0.0.1:${port}`, grpc.
            credentials.createInsecure())
    }

    cipList.push(clientInfo);

    res.send(cipList)
})

app.listen(3001, () => {
    console.log("Server running on port 3000");
});
