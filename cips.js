const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const equipmentInfo = require('./equipment.json');

const packageDef = protoLoader.loadSync("cip.proto", {});
const gRPCObject = grpc.loadPackageDefinition(packageDef);
const cip = gRPCObject.cips;

function getName(call, callback) {
    console.log(call.request.id);
    const id = call.request.id;
    const equipmentDetails = equipmentInfo.find(equipment => {
        return equipment.id === id;
    })
    console.log(equipmentDetails);

    callback(null, { id, name: process.argv[3], port: process.argv[2], equipment: equipmentDetails })
}

function main(argv) {
    const server = new grpc.Server();
    console.log(argv);

    server.addService(cip.Cips.service, {
        Getname: getName
    });

    server.bindAsync(`0.0.0.0:${process.argv[2]}`, grpc.ServerCredentials.createInsecure(), () => {
        console.log(`Starting server ${process.argv[3]}`)
        server.start();
    });
}



main(process.argv);