const mqtt = require('mqtt');

const brokerUrl = "mqtt://broker.hivemq.com"
const mqttClient = mqtt.connect(brokerUrl);

const equipmentInfo = require('./equipment.json');

// function getName(call, callback) {
//     console.log(call.request.id);
//     const id = call.request.id;
//     const equipmentDetails = equipmentInfo.find(equipment => {
//         if (equipment.region === process.argv[3])
//         {
//             let obj=equipment;
//         function randomizeStatus(equipmentList) {
//             equipmentList.forEach(equipment => {
//               equipment.status = Math.random() > 0.5 ? 'online' : 'offline';
//             });
//           }
//           randomizeStatus(obj.equipmentname);
//             console.log("obj",obj)
//             return obj;
//         }

//     })

//     callback(null, { id, name: process.argv[3], port: process.argv[2], equipment: equipmentDetails })
// }

function main(argv) {
    mqttClient.on('connect', () => {
        console.log(argv);
        console.log("client connected");

        setInterval(() => {
            const equipmentDetails = equipmentInfo.find(equipment => {
                if (equipment.region === process.argv[3]) {
                    let obj = equipment;
                    function randomizeStatus(equipmentList) {
                        equipmentList.forEach(equipment => {
                            equipment.status = ((Math.random() * 10) > 5) ? 'online' : 'offline';
                        });
                    }
                    randomizeStatus(obj.equipmentname);
                    console.log("object equipment ", obj);
                    return obj;
                }
            });
        }, 60000);

    })

    mqttClient.on('close', () => { console.log("connection closed") });

    //     const server = new grpc.Server();

    //     server.addService(cip.Cips.service, {
    //         Getname: getName,
    //         GetEquipmentStatus: (call) => {

    //             const clientId = call.request.id;
    //             const stream = call;

    //             clients[clientId] = stream;

    //             // Simulate sending status updates
    //             setInterval(() => {

    //                 equipmentInfo.filter(item => {
    //                     if (item.region === process.argv[3]) {
    //                         item.equipmentname.filter(equipment => {
    //                             const status = (Math.random()*10) >5? "online" : "offline";

    //                             console.log((Math.random()*10),{ name: equipment.name, status, type: equipment.type });

    //                             stream.write({ name: equipment.name, status,type: equipment.type });

    //                         })
    //                     }

    //                 })
    //             }, 60000);

    //             stream.on('end', () => {
    //                 delete clients[clientId];
    //                 stream.end();
    //             });
    //         }
    //     });

    //     server.bindAsync(`0.0.0.0:${process.argv[2]}`, grpc.ServerCredentials.createInsecure(), () => {
    //         console.log(`Starting server ${process.argv[3]}`)
    //         server.start();
    //     });

}


main(process.argv);

///need to run loop in both cen cip and first connect then server should send data continuosly