const express = require('express');
const bodyParser = require('body-parser');
const amqp = require('amqplib/callback_api');
const cors = require('cors'); 

const app = express();
const port = 3001;

const amqpUrl = 'amqp://localhost';
const queueName = 'attendease-queue';

app.use(bodyParser.json());
app.use(cors()); 

function publishData(channel, queueName, data) {
    const message = `Brand: ${data.brand}, Model: ${data.model}, OS Name: ${data.osName}, OS Version: ${data.osVersion}, Manufacturer: ${data.manufacturer}, Latitude: ${data.latitude}, Longitude: ${data.longitude}`;
    channel.sendToQueue(queueName, Buffer.from(message));
    console.log("Sent message:", message);
}

amqp.connect(amqpUrl, (err, connection) => {
    if (err) {
        throw err;
    }
    connection.createChannel((err, channel) => {
        if (err) {
            throw err;
        }
        channel.assertQueue(queueName, { durable: false });

        app.post('/senddata', (req, res) => {
            try {
                const data = req.body;
                publishData(channel, queueName, data);
                res.json({ status: 'Success', message: 'Data sent' });
            } catch (error) {
                console.error('Error publishing data:', error);
                res.status(500).json({ status: 'error', message: 'Failed to publish data' });
            }
        });

        app.listen(port, () => {
            console.log(`Server is listening at http://localhost:${port}`);
        });
    });
});
