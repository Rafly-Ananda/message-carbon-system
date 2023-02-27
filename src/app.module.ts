import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { RabbitMQModule } from "@golevelup/nestjs-rabbitmq";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { MongooseModule } from "@nestjs/mongoose";
import { RoutingModule } from "./modules/routing.module";
import { SharedModule } from "./modules/shared.module";

@Module({
  imports: [
    SharedModule,
    RoutingModule,
    // ENV
    ConfigModule.forRoot({ isGlobal: true }),
    // MQTT as Client
    ClientsModule.register([
      {
        name: "MQTT_SERVICE",
        transport: Transport.MQTT,
        options: {
          url: process.env.MQTT_HOST,
          username: process.env.MQTT_USR,
          password: process.env.MQTT_PSS,
        },
      },
    ]),
    // RMQ
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: process.env.RMQ_EXCHANGE,
          type: "x-delayed-message",
        },
      ],
      uri: process.env.RMQ_HOST,
      connectionInitOptions: { wait: false },
    }),
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
