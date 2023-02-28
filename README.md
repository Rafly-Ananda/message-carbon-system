# Message Carbon Backend Service 

## Data Flow

- Capture business chat data from listening to business chat MQTT service.
- Forward and publish the business chat data to Hi App RabbitMQ service.
- Listen to specific exchange and queue from RabbitMQ service.
- Save hisotrical chat data to MongoDB.
- Save customer interaction ( data from business chat ) to analytics database in MariaDB.

## Tech Used

- [MQTT] - To listen incoming business chat messages.
- [RabbitMQ] - Queue payload, to make sure no data lost in the process.
- [Moment] - Date parser.
- [MongoDB] - Store business chat messages.
- [MariaDB] - Store business chat insight analytics ( Data from business chat )
- [Express] - fast node.js network app framework

## Installation

Message Carbon Backend Service requires [Node.js](https://nodejs.org/) v.14 to run.

- Install the dependencies, devDependencies
- Assign MQTT Broker, RabbitMQ broker
- Connect MongoDB and RDMS ( This project use MariaDB )
