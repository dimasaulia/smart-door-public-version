const amqp = require("amqplib");

const RabbitSettings = {
    protocol: "amqp",
    hostname: "localhost",
    port: 5672,
    username: "guest",
    password: "guest",
    authMechanism: "AMQPLAIN",
    vhost: "/",
    exchange: "smartdoor",
    loggerQueue: "smartdoorlogger",
};

class RabbitConnection {
    constructor() {
        RabbitConnection.createConnection();
        this.connection = null;
        this.channel = null;
    }

    static getInstance() {
        if (!RabbitConnection.instance) {
            RabbitConnection.instance = new RabbitConnection();
        }
        return RabbitConnection.instance;
    }
    //create connection to rabbitmq
    static async createConnection() {
        try {
            this.connection = await amqp.connect(
                // `${RabbitSettings.protocol}://${RabbitSettings.username}:${RabbitSettings.password}@${RabbitSettings.hostname}:${RabbitSettings.port}${RabbitSettings.vhost}`
                `${RabbitSettings.protocol}://${RabbitSettings.hostname}`
            );
            this.channel = await this.connection.createChannel();
            this.channel.assertExchange(RabbitSettings.exchange, "direct", {
                durable: false,
            });
            this.channel.assertQueue(
                RabbitSettings.loggerQueue,
                RabbitSettings.exchange,
                ""
            );
            console.log(" [i]: Connection to RabbitMQ established");
        } catch (error) {
            console.log(error);
        }
    }

    // send message to rabbitmq queue
    static async sendMessage(message, bindingKey) {
        try {
            let msg = await this.channel.publish(
                RabbitSettings.exchange,
                bindingKey,
                Buffer.from(message)
            );
            // console.log(` [x]: "${message}" has been send to "${key}" exhange`);
            return msg;
        } catch (error) {
            console.log(error);
        }
    }

    // consume
    static async consumeMessage({ channel, queue, key, callbackFn }) {
        console.log(` [i]: Listening to "${key}" event`);
        channel.bindQueue(queue, RabbitSettings.exchange, key);
        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                console.log(" [d]: Recieved", msg.content.toString());
                channel.ack(msg);

                // EXECUTE Callback Function To Do Something
                callbackFn(msg.content.toString());
            } else {
                console.log("Consumer cancelled by server");
            }
        });
    }
}

module.exports = { RabbitConnection };
