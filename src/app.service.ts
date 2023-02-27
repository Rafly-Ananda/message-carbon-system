import { Injectable } from "@nestjs/common";
import { Nack, RabbitSubscribe } from "@golevelup/nestjs-rabbitmq";
import { ConsumeMessage } from "amqplib";
import { MongoChatService } from "src/services/mongo/mongoose-chat/mongo-chat.service";
import * as moment from "moment";

// mariadb
import {BusinessChatAnalyticsService} from 'src/services/maria/owner-insight-analytics/business-chat-analytics.service'
import {BusinessChatAnalyticsNewCustomerService} from 'src/services/maria/owner-insight-analytics/business-chat-analytics-new-customer.service'

// Dotenv
require("dotenv").config();

@Injectable()
export class AppService {
  constructor(
    private readonly mongoChatService: MongoChatService, 
    private readonly businessChatAnalyticsService: BusinessChatAnalyticsService,
    private readonly BusinessChatAnalyticsNewCustomerService: BusinessChatAnalyticsNewCustomerService
    ) {
  }

  async saveBusinessAnalyticsrecord(dataset: any): Promise<void> {
    try {
      // data stored in utc format, need to convert it first to current locale for use, month, day start from 0 ( 0 based )
      const momentDate = moment(dataset.sendTime);
      const formattedDate  = momentDate.format("YYYY-MM-DD HH:00:00");
      const toUnix = moment(formattedDate).unix();

      const setWeekOfMonth = (date: number) => {
        if (date <= 7) {
          return 1;
        } else if (date <= 14) {
          return 2;
        } else if (date <= 21) {
          return 3;
        } else {
          return 4
        }
      }

      const record = {
        key_id: `${dataset.roomId}_${toUnix}`,
        from_id: dataset.fromId,
        to_id: dataset.toId,
        room_id: dataset.roomId,
        send_time: dataset.sendTime as unknown as Date,
        date_hours: toUnix,
        year: momentDate.year(),
        month:  momentDate.month(),
        week_of_year: momentDate.week(),
        week_of_month: setWeekOfMonth(Number(momentDate.format('DD'))),
        day_of_week: momentDate.day(),
        date: Number(momentDate.format('DD')),
        hour: momentDate.hour(),
      }

      const res =  await this.businessChatAnalyticsService.saveRecord(record);
      await this.BusinessChatAnalyticsNewCustomerService.saveRecord({
        business_analytics_id : res.id,
        from_id: res.from_id,
        to_id: res.to_id,
        send_time: res.send_time
      });
      
    } catch (e) {
      throw new Error(e);
    }
  }

  // Receiving message from RMQ Queue
  @RabbitSubscribe({
    exchange: process.env.RMQ_EXCHANGE,
    routingKey: process.env.RMQ_ROUTINGKEY_EMAIL,
    queue: process.env.RMQ_EMAIL_QUEUE,
    allowNonJsonMessages: true,
    createQueueIfNotExists: false,
    queueOptions: {
      durable: true,
    },
  })
  public async rmqSubHandler(msg: { data: any }, amqpMsg: ConsumeMessage) {
    try {
      const result = await Promise.allSettled([this.mongoChatService.create(msg.data), this.saveBusinessAnalyticsrecord(msg.data)])
      if (result[0].status === 'rejected') {
        if (result[0].reason.message.split(' ').includes('duplicate')) 
          throw new Error('mongo-duplicate')
      }
    } catch (e) {
      if (e.message === 'mongo-duplicate') {
        await this.mongoChatService.findOneAndUpdate(
          msg.data.id,
          msg.data.fromId,
          msg.data,
        );
      }
    }
  }
}
