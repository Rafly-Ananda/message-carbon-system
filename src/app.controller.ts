import { Body, Controller, Get, Inject, Post, Res, Req } from "@nestjs/common";
import { AppService } from "./app.service";
import { Response, Request } from "express";
import {
  ClientProxy,
  MessagePattern,
  MqttRecordBuilder,
  Payload,
} from "@nestjs/microservices";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { MongoChatService } from "src/services/mongo/mongoose-chat/mongo-chat.service";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly mongoChatService: MongoChatService,
    @Inject("MQTT_SERVICE") private client: ClientProxy,
    private readonly amqpConnection: AmqpConnection,
  ) {}
  
  // Publish mesasge to MQTT Topic
  @Get("pub-mqtt")
  publishMqtt() {
    const userProperties = { "x-version": "1.0.0" };
    const record = new MqttRecordBuilder(JSON.parse(JSON.stringify({
      "id": "1665371145316",
      "type": "ChatText",
      "fromId": "1663228971265943",
      "fromName": "user-test-postman",
      "sendTime": "2022-10-10T03:05:50.316255Z",
      "toId": "1662965657069591",
      "toName": "1",
      "text": "dGVzdA==",
      "caption": "",
      "roomId": "2c27a417-b056-4512-826e-22638b313a0c",
      "originality": "Original",
      "attachment": null,
      "thumbnail": null,
      "originalId": null,
      "originalMessage": null,
      "size": null,
      "mime": null,
      "longitude": null,
      "latitude": null,
      "participant": "[]",
      "isGroup": 0,
      "jojo": "jotaro kujo",
      "jake": "baldino",
    })))
      .setProperties({ userProperties })
      .setQoS(2)
      .build();
    this.client.send(process.env.MQTT_TOPIC, record)
      .subscribe();
  }

  // Publish mesasge to RMQ Queue
  @Get("pub-rmq")
  publishRmq() {
    this.amqpConnection.publish(
      process.env.RMQ_EXCHANGE,
      process.env.RMQ_ROUTINGKEY_EMAIL,
      { message: "Hello rmq from sender" },
    );
  }

  // Receiving message from MQTT Topic
  @MessagePattern("business/+/messages")
  async getMQTTNotifications(
    @Payload() data: any,
  ) {
    this.amqpConnection.publish(
      process.env.RMQ_EXCHANGE,
      process.env.RMQ_ROUTINGKEY_EMAIL,
      { data },
    );
  }
}
