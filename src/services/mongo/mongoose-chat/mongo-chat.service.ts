import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {
  Chat,
  chatDocument,
} from "../../../models/mongo-mongoose-schemas/mongoose-chat.schema";
import { Request } from "express";
import * as constants from "src/constants";
import * as paginateHelper from "src/helpers/mongo/paginate-response";
import { TypeormMongoPaginate } from "src/interfaces/mongo/paginate-response.interface";

@Injectable()
export class MongoChatService {
  constructor(
    @InjectModel(Chat.name) private readonly chatModel: Model<chatDocument>,
  ) {}

  async create(chatDto: any): Promise<any> {
    try {
      if (isNaN(Date.parse(chatDto.sendTime))) {
        throw new Error("Sendtime is not in Date format");
      }
      const newChatRecord = new this.chatModel(chatDto);
      return newChatRecord.save();
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async findAll(req: any): Promise<TypeormMongoPaginate> {
    const size = +req.query.size || constants.pagination.default_page_zie;
    const page = +req.query.page ||
      constants.pagination.default_page_no_callback;
    const sort = req.query.sort === "asc" ? "asc" : "desc";
    const roomId = req.query.room_id;
    const dateParam = req.query.date && new Date(req.query.date);
    const filterSet = req.query.filter === "lt" ? "lt " : "gt";

    if (page < 0 || page === 0) {
      throw new Error("invalid page number, should start with at least 1");
    }

    try {
      const result = await this.chatModel.find({
        roomId,
        ...(dateParam && {
          sendTime: {
            ...(filterSet === "lt " ? { $lt: dateParam } : { $gt: dateParam }),
          },
        }),
      }).limit(size).skip(size * (page - 1)).sort({ sendTime: sort }).exec();

      const total = await this.chatModel.countDocuments({
        roomId,
        ...(dateParam && {
          sendTime: {
            ...(filterSet === "lt " ? { $lt: dateParam } : { $gt: dateParam }),
          },
        }),
      });

      return paginateHelper.paginateResponse(result, page, size, total);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async findOne(req: Request): Promise<Chat> {
    return this.chatModel.findOne({
      sendTime: new Date(JSON.parse(JSON.stringify(req.query.date))),
    }).exec();
  }

  async findOneAndUpdate(
    id: string,
    fromId: string,
    payload: Chat,
  ): Promise<Chat> {
    return this.chatModel.findOneAndUpdate({
      id: id,
      fromId: fromId,
    }, payload);
  }

  async deleteMany(req: Request): Promise<any> {
    const deleteParam = { ...req.query };
    try {
      return this.chatModel.deleteMany({
        ...deleteParam,
      });
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
