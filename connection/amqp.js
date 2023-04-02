const amqp = require("amqplib");

const RabbitSettings = {
    protocol: "amqp",
    hostname: "localhost",
    port: 5672,
    username: "guest",
    password: "guest",
    authMechanism: "AMQPLAIN",
    vhost: "/",
    queue: "smartdoorlogger",
    exchange: "logger",
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
            this.channel.assertQueue(
                RabbitSettings.queue,
                RabbitSettings.exchange,
                ""
            );
            this.channel.assertExchange(RabbitSettings.exchange, "topic", {
                durable: false,
            });
            console.log(" [i]: Connection to RabbitMQ established");
        } catch (error) {
            console.log(error);
        }
    }
    //send message to rabbitmq queue
    static async sendMessage(message, key) {
        try {
            let msg = await this.channel.publish(
                RabbitSettings.exchange,
                key,
                Buffer.from(message)
            );
            // console.log(` [x]: "${message}" has been send to "${key}" exhange`);
            return msg;
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = { RabbitConnection };
