// const equipmentInfo = require("./equipment.json");
const mqtt = require('mqtt');

const brokerUrl = "mqtt://broker.hivemq.com:1883"
const mqttClient = mqtt.connect(brokerUrl);

// const sendArgv = JSON.stringify(
//     {
//         id: process.argv[2],
//         name: process.argv[3],
//         status: process.argv[4],
//         type: process.argv[5],
//         ipaddress: process.argv[6],
//         port: process.argv[7],
//         lastUpdated: process.argv[8],
//     }
// );

mqttClient.on("connect", () => {
    console.log("Subscribing to topic...");

    mqttClient.subscribe("bootup", (err) => {
        if (err) {
            console.log(`Error in subscribing to bootup`);
        }
        else {
            console.log(`Subscribed to bootup`);
        }
    });

    // setInterval(() => {

    //     mqttClient.publish("bootup", sendArgv, (err) => {
    //         if (err) {
    //             console.log(err);
    //         }
    //         else {
    //             console.log("In publishing : ", sendArgv)
    //         }
    //     });
    // }, 10000);

});

mqttClient.on('message', (topic, message) => {

    if (topic === 'bootup') {
        const cipStatus = JSON.stringify(JSON.parse(message.toString()));
        console.log(`Received message from bootup: ${cipStatus}`);
        mqttClient.publish('sendstatus', cipStatus, (err) => {
            if (err) console.error(err);
            else {
                console.log(`Published the CIP status: ${cipStatus}`);
                isCIPOnline = true
            }
        })
    }
})

function main(argv) {
    console.log(argv[2], argv[3], argv[4], argv[5], argv[6], argv[7], argv[8]);
}

main(process.argv);