const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const cipProto = protoLoader.loadSync("cip.proto", {});
const gRPCObject = grpc.loadPackageDefinition(cipProto);
const cips = gRPCObject.cips;

let cipList = [];

cipList.map(client => {
    const call = client.client.MessageFromcen();
    call.write({ message: "Message from cen to cip" })
    call.on('data', (data) => {
        console.log("Hello world: from server", data);
    });
    call.on('end', () => {
        console.log("the server responded disconnect");

    })
    call.end()
})


app.get('/test', (req, res) => {
    const id = req.query.id;
    console.log(req.query);

    console.log(cipList, id)
    const cip = cipList.find(cip => cip.id === id);
    console.log(cip);
    cip.client.Getname({ id: cip.id, name: "", port: "" }, (err, response) => {
        if (err) {
            console.log("IN ERROR CEN")
            console.log(err.message);
            res.send(err.message)
        } else {
            console.log
                (`CIP client added: ${JSON.stringify(response)}`);
            res.send(JSON.stringify(response));

        }

    })

})

app.post("/cips", (req, res) => {

    const { id, name, port } = req.body;
    const clientInfo = { name, id, port, ip: `0.0.0.1:${port}`, client: new cips.Cips(`127.0.0.1:${port}`, grpc.credentials.createInsecure()) }

    cipList.push(clientInfo);


    res.send(cipList)
})

// function main() {
//     const server = new grpc.Server();
//     server.addService(cen.CenBackend.service, { GotFromCip: getMessageFromCip })
//     server.bindAsync('127.0.0.1:50055', grpc.ServerCredentials.createInsecure(), (err, port) => {
//         if (err)
//             console.log("JMMMMMM   ", err.message)
//         console.log(`Cen server starting on port ${port}`);
//         server.start();

//     })
// }
// main();

app.listen(3000, () => {
    console.log("Server running on port 3000");

});
