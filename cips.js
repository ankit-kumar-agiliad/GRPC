const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const equipmentInfo = require("./equipment.json");
const mqtt = require('mqtt');

const brokerUrl = "mqtt://broker.hivemq.com:1883"
const mqttClient = mqtt.connect(brokerUrl);

const packageDef = protoLoader.loadSync("cip.proto", {});
const gRPCObject = grpc.loadPackageDefinition(packageDef);
const cip = gRPCObject.cips;

function getName(call, callback) {
    console.log(call.request.id);
    const id = call.request.id;
    const equipmentDetails = equipmentInfo.find(equipment => {
        if (equipment.region === process.argv[3]) {

            let obj = equipment;

            function randomizeStatus(equipmentList) {
                equipmentList.forEach(equipment => {
                    equipment.status = Math.random() > 0.5 ? 'online' : 'offline';
                });
            }
            randomizeStatus(obj.equipmentname);
            console.log("obj", obj)
            return obj;
        }

    })

    callback(null, { id, name: process.argv[3], port: process.argv[2], equipment: equipmentDetails })
}

function publishEquipmentStatus(region) {

    equipmentInfo.filter(item => {
        if (item.region === region) {
            item.equipmentname.filter(equipment => {
                const status = (Math.random() * 10) > 5 ? "online" : "offline";

                console.log(status, { name: equipment.name, status, type: equipment.type });

                const message = JSON.stringify({
                    status: status,
                    name: equipment.name,
                    type: equipment.type
                })
                console.log("Message sent to subscriber : ", JSON.parse(message));

                mqttClient.publish("equipment/status", JSON.stringify(message));

            })
        }

    })
}

function main(argv) {
    const server = new grpc.Server();

    server.addService(cip.Cips.service, {
        Getname: getName,
    });

    mqttClient.on('connect', () => {
        console.log(argv);
        console.log("client connected");
        setInterval(() => {
            publishEquipmentStatus(process.argv[3]);
        }, 30000);
    });

    mqttClient.on('error', () => {
        console.log("Error with mqtt connection", error);

    })

    server.bindAsync(`0.0.0.0:${process.argv[2]}`, grpc.ServerCredentials.createInsecure(), () => {
        console.log(`Starting server ${process.argv[3]}`)
        server.start();
    });

}

main(process.argv);