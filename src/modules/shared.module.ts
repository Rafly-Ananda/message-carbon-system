import { Module } from "@nestjs/common";
import { MongoChatService } from "src/services/mongo/mongoose-chat/mongo-chat.service";
import { MongoMainModule } from "./mongo/mongo-main.module";
import { MariaMainModule } from "./maria/maria-main.module";
@Module({
  imports: [
    MongoMainModule,
    MariaMainModule,
  ],
  providers: [MongoChatService],
  controllers: [],
  exports: [
    MongoMainModule,
    MariaMainModule,
    MongoChatService,
  ],
})
export class SharedModule {}
