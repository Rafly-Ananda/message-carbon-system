import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Req,
  Res,
} from "@nestjs/common";
import { MongoChatService } from "../../services/mongo/mongoose-chat/mongo-chat.service";
import { Request, Response } from "express";
import {
  ClientProxy,
  MessagePattern,
  MqttRecordBuilder,
  Payload,
} from "@nestjs/microservices";
import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { RequestResponse } from "src/interfaces/response.interface";

@Controller()
export class ChatController {
  constructor(private readonly mongoChatService: MongoChatService) {}

  @Get()
  async findAllChats(@Req() req: Request, @Res() res: Response): Promise<any> {
    try {
      if (!req.query.room_id) {
        throw new Error("Please specify roomId.");
      }

      const result = await this.mongoChatService.findAll(req);
      return res.status(200).json({ result });
    } catch (e) {
      const response: RequestResponse = {
        status_code: 422,
        error: true,
        message: e.message,
      };
      return res.status(422).json(response);
    }
  }

  @Get("/:id")
  async findOneChat(@Req() req: Request, @Res() res: Response): Promise<void> {
    const result = await this.mongoChatService.findOne(req);
    res.status(200).json({ result });
  }

  @Post()
  async createChatRecord(
    @Res() res: Response,
    @Body() chatPayload: any,
  ): Promise<any> {
    try {
      const postResponse = await this.mongoChatService.create(chatPayload);
      return res.status(200).json({ postResponse });
    } catch (e) {
      const response: RequestResponse = {
        status_code: 422,
        error: true,
        message: e.message,
      };
      return res.status(422).json(response);
    }
  }

  @Delete()
  async deleteAllRecord(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<any> {
    try {
      if (Object.entries(req.query).length < 1) {
        throw new Error("Specify field target to delete.");
      } else {
        const deletedChats = await this.mongoChatService.deleteMany(req);
        return res.status(200).json({ deletedChats });
      }
    } catch (e) {
      const response: RequestResponse = {
        status_code: 422,
        error: true,
        message: e.message,
      };
      return res.status(422).json(response);
    }
  }
}
