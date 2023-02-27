import { Module } from "@nestjs/common";
import { MongoMainController } from "src/controllers/mongo/mongo-main.controller";
import { MongoChatService } from "src/services/mongo/mongoose-chat/mongo-chat.service";
import { MongooseModule } from "@nestjs/mongoose";

import { MongoChatModule } from "./mongo-chat.module";


const modules = [MongoChatModule]
const providers = [MongoChatService]

@Module({
  imports: [
    ...modules,
    MongooseModule.forRoot(process.env.MONGODB_URI)
  ],
  providers: [...providers],
  controllers: [MongoMainController],
  exports: [MongooseModule, ...modules, ...providers]
})
export class MongoMainModule {}
