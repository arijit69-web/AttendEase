const express = require('express');
const amqp = require('amqplib/callback_api');
const cors = require('cors');

const app = express();
const port = 3000;
const messages = [];

const rabbitMqUrl = 'amqp://localhost'; 

app.use(cors());

amqp.connect(rabbitMqUrl, (err, connection) => {
    if (err) {
        throw err;
    }

    connection.createChannel((err, channel) => {
        if (err) {
            throw err;
        }

        const queueName = 'attendease-queue';
        channel.assertQueue(queueName, { durable: false });

        channel.consume(queueName, (msg) => {
            const messageContent = msg.content.toString();
            console.log(`Message: ${messageContent}`);
            messages.push(messageContent);
            channel.ack(msg);
        }, {
            noAck: false
        });

        console.log(`Waiting for messages in ${queueName}. To exit press CTRL+C`);
    });
});





app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
