const express = require('express');
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const cipProto = protoLoader.loadSync("cip.proto", {});
const gRPCObject = grpc.loadPackageDefinition(cipProto);
const cips = gRPCObject.cips;

let cipList = [];
function startStreaming() {

    cipList.forEach(client => {
        console.log(JSON.stringify(client));
        const id = client.id;

        client.client.GetEquipmentStatus({ id: id })
            .on("data", (status) => {
                console.log(JSON.stringify(status));

                console.log(`Received status update - Equipment name: ${status.name}, Status: ${status.status}, ${id}`);
            })
            .on("end", () => {
                console.log("Server has ended the stream.");
            });
    })

}


app.get('/test', (req, res) => {
    const id = req.query.id;

    const cip = cipList.find(cip => cip.id === id);
    startStreaming();

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

app.listen(3001, () => {
    console.log("Server running on port 3000");

});
