import { Module } from "@nestjs/common";
import { ChatController } from "../../controllers/mongo/chat.controller";
import { MongoChatService } from "../../services/mongo/mongoose-chat/mongo-chat.service";
import { MongoSharedModule } from "./mongo-shared.module";

@Module({
  imports: [MongoSharedModule],
  providers: [MongoChatService],
  controllers: [ChatController],
  exports: [MongoSharedModule]
})
export class MongoChatModule {}
