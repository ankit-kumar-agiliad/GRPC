const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDef = protoLoader.loadSync("cip.proto", {});
const gRPCObject = grpc.loadPackageDefinition(packageDef);
const cip = gRPCObject.cips;




function getName(call,callback) {
    callback(null, {message: `my name is ${process.argv[3]} `})
}

function main(argv) {
    const server = new grpc.Server();
    console.log(argv)
    server.addService(cip.Cips.service, {
        getName
    });

    server.bindAsync(`0.0.0.0:${ process.argv[2] }`, grpc.ServerCredentials.createInsecure(), () => {
        console.log(`Starting server ${ process.argv[3] }`)
        server.start();
    });
}

main(process.argv);