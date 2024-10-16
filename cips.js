const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const equipmentInfo = require("./equipment.json");
// const mqtt = require('mqtt');

// const brokerUrl = "mqtt://broker.hivemq.com:1883"
// const mqttClient = mqtt.connect(brokerUrl);

const packageDef = protoLoader.loadSync("main.proto", {});
const gRPCObject = grpc.loadPackageDefinition(packageDef);

const cip = gRPCObject.grpc;

let isServerOperational = true;
let isServerOnline = true;

let clients = {};

function getStatusStream(call) {
    console.log(JSON.stringify(call.request));
    const id = call.request.clientId;
    const name = call.request.clientName;
    clients[id] = call;

    console.log("ID , NAme: ", id, name);

    call.write({
        serverId: process.argv[2],
        serverName: process.argv[3],
        status: {
            isOnline: isServerOnline,
            isOperational: isServerOperational
        }
    });

    const intervalId = setInterval(() => {
        if (!isServerOperational) {
            call.write({
                server_id: process.argv[2],
                server_name: process.argv[3],
                status: {
                    isOnline: isServerOnline,
                    isOperational: isServerOperational
                }
            });
            call.end();
            clearInterval(intervalId)
        }
    }, 5000);


    // const equipmentDetails = equipmentInfo.find(equipment => {
    //     if (equipment.region === process.argv[3]) {

    //         let obj = equipment;

    //         function randomizeStatus(equipmentList) {
    //             equipmentList.forEach(equipment => {
    //                 equipment.status = Math.random() > 0.5 ? 'online' : 'offline';
    //             });
    //         }
    //         randomizeStatus(obj.equipmentname);
    //         console.log("obj", obj)
    //         return obj;
    //     }

    // });

    // console.log("Equipment Details: ", equipmentDetails, id);


    // stream.write({ server_id: id, server_name: process.argv[3], status: equipmentDetails })

    call.on('cancelled', () => {
        console.log("Client disconnected ", id, name);
        delete clients[id];
        clearInterval(intervalId)
    });

    // callback(null, { server_id: id, server_name: process.argv[3], port: process.argv[2], status: equipmentDetails })
}

function shutDown() {
    console.log(`Shutting down the server ${process.argv[3]}`);
    isServerOnline = false;
    isServerOperational = false;
    server.tryShutDown(() => {
        console.log("Server is down....");
        process.exit(0);

    })

}

function getEquipmentList(){
    
}

// function publishEquipmentStatus(region) {

//     equipmentInfo.filter(item => {
//         if (item.region === region) {
//             item.equipmentname.filter(equipment => {
//                 const status = (Math.random() * 10) > 5 ? "online" : "offline";

//                 console.log(status, { name: equipment.name, status, type: equipment.type });

//                 const message = JSON.stringify({
//                     status: status,
//                     name: equipment.name,
//                     type: equipment.type
//                 })
//                 console.log("Message sent to subscriber : ", JSON.parse(message));

//                 mqttClient.publish("equipment/status", JSON.stringify(message));

//             })
//         }

//     })
// }

// function grpcEquipmentStatus(call) {
//     const clientId = call.request.id;
//     const stream = call;

//     clients[clientId] = stream;

//     // Simulate sending status updates
//     setInterval(() => {

//         equipmentInfo.filter(item => {
//             if (item.region === process.argv[3]) {
//                 item.equipmentname.filter(equipment => {
//                     const status = (Math.random() * 10) > 5 ? "online" : "offline";

//                     console.log((Math.random() * 10), { name: equipment.name, status, type: equipment.type });

//                     stream.write({ name: equipment.name, status, type: equipment.type });

//                 })
//             }

//         })
//     }, 60000);

//     stream.on('end', () => {
//         delete clients[clientId];
//         stream.end();
//     });
// }

function main(argv) {

    const server = new grpc.Server();
    // let displayMethod;
    console.log(argv);


    server.addService(cip.EquipmentService.service, {
        GetStatusStream: getStatusStream,
        GetEquipmentListStream: getEquipmentList
    });

    // mqttClient.subscribe('getmethod/status', (err) => {
    //     if (err) {
    //         console.log("Error in subscription: " + err);

    //     } else {
    //         console.log("106 Subscription successfully");

    //     }
    // });

    // mqttClient.on("message", (topic, message) => {
    //     console.log("Message: ", message.toString());
    //     displayMethod = message.toString();
    // })
    // console.log(displayMethod);

    // mqttClient.on('connect', () => {
    //     console.log(argv);
    //     console.log("client connected");
    //     setInterval(() => {
    //         if (displayMethod === "MQTT") {
    //             publishEquipmentStatus(process.argv[3]);
    //         }
    //     }, 30000);
    // });

    // mqttClient.on('error', () => {
    //     console.log("Error with mqtt connection", error);

    // })

    server.bindAsync(`0.0.0.0:${process.argv[2]}`, grpc.ServerCredentials.createInsecure(), () => {
        console.log(`Starting server ${process.argv[3]}`)
        server.start();
    });

    process.on('SIGINT', shutDown);
    process.on("SIGTERM", shutDown)

}

main(process.argv);

