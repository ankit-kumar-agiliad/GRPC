const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const equipmentInfo = require("./equipment.json")
const packageDef = protoLoader.loadSync("cip.proto", {});
const gRPCObject = grpc.loadPackageDefinition(packageDef);
const cip = gRPCObject.cips;
let clients = {};

function getName(call, callback) {
    console.log(call.request.id);
    const id = call.request.id;
    const equipmentDetails = equipmentInfo.find(equipment => {
        if (equipment.region === process.argv[3])
        {
            let obj=equipment;
        function randomizeStatus(equipmentList) {
            equipmentList.forEach(equipment => {
              equipment.status = Math.random() > 0.5 ? 'online' : 'offline';
            });
          }
          randomizeStatus(obj.equipmentname);
            console.log("obj",obj)
            return obj;
        }
       
    })

    callback(null, { id, name: process.argv[3], port: process.argv[2], equipment: equipmentDetails })
}

function main(argv) {
    const server = new grpc.Server();
    console.log(argv);

    server.addService(cip.Cips.service, {
        Getname: getName,
        GetEquipmentStatus: (call) => {

            const clientId = call.request.id;
            const stream = call;

            clients[clientId] = stream;

            // Simulate sending status updates
            setInterval(() => {

                equipmentInfo.filter(item => {
                    if (item.region === process.argv[3]) {
                        item.equipmentname.filter(equipment => {
                            const status = (Math.random()*10) >5? "online" : "offline";

                            console.log((Math.random()*10),{ name: equipment.name, status, type: equipment.type });

                            stream.write({ name: equipment.name, status,type: equipment.type });

                        })
                    }

                })
            }, 60000);

            stream.on('end', () => {
                delete clients[clientId];
                stream.end();
            });
        }
    });

    server.bindAsync(`0.0.0.0:${process.argv[2]}`, grpc.ServerCredentials.createInsecure(), () => {
        console.log(`Starting server ${process.argv[3]}`)
        server.start();
    });

}


main(process.argv);

///need to run loop in both cen cip and first connect then server should send data continuosly