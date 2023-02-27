import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  Chat,
  ChatSchema,
} from "../../models/mongo-mongoose-schemas/mongoose-chat.schema";

import { MongoChatService } from "src/services/mongo/mongoose-chat/mongo-chat.service";

const providers = [MongoChatService]
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
  ],
  providers: [...providers],
  controllers: [],
  exports: [
    MongooseModule, ...providers
  ],
})
export class MongoSharedModule {}
