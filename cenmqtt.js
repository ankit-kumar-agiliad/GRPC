const express = require('express');
const app = express();
const cors = require('cors');
const mqtt = require('mqtt');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


let cipList = [];


app.listen(3001, () => {
    console.log("Server running on port 3000");

});