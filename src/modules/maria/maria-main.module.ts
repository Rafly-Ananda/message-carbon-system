import { Module } from "@nestjs/common";
import { MariaMainController } from "src/controllers/maria/maria-main.controller";
import { TypeOrmModule } from "@nestjs/typeorm";

import { BusinessChatAnalytics } from "src/models/maria-typeorm-entities/business-chat-analytics.entity";
import { BusinessChatAnalyticsModule } from "./business-chat-analytics.module";
import { BusinessChatAnalyticsService } from "src/services/maria/owner-insight-analytics/business-chat-analytics.service";

import { BusinessChatAnalyticsNewCustomer } from "src/models/maria-typeorm-entities/business-chat-analytics-new-customer.entity";
import { BusinessChatAnalyticsNewCustomerModule } from "./business-chat-analytics-new-customer.module";
import { BusinessChatAnalyticsNewCustomerService } from "src/services/maria/owner-insight-analytics/business-chat-analytics-new-customer.service";

import { BusinessChatAnalyticsLandingPage } from "src/models/maria-typeorm-entities/business-chat-analytics-landing-page.entity";
import { BusinessChatAnalyticsLandingPageModule } from "./business-chat-analytics-landing-page.module";
import { BusinessChatAnalyticsLandingPageService } from "src/services/maria/owner-insight-analytics/business-chat-analytics-landing-page.service";

const entities = [BusinessChatAnalytics, BusinessChatAnalyticsNewCustomer, BusinessChatAnalyticsLandingPage]
const modules = [BusinessChatAnalyticsModule, BusinessChatAnalyticsNewCustomerModule, BusinessChatAnalyticsLandingPageModule];
const providers = [BusinessChatAnalyticsService, BusinessChatAnalyticsNewCustomerService, BusinessChatAnalyticsLandingPageService];

@Module({
  imports: [
    ...modules,
    TypeOrmModule.forRoot({
    type: 'mysql',
      host: process.env.MRYDB_HOST,
      port: process.env.MRYDB_PORT as unknown as number,
      username: process.env.MRYDB_USR,
      password: process.env.MRYDB_PSS,
      database: process.env.MRYDB_DATABASE,
      entities: [...entities],
      synchronize: false,
      autoLoadEntities: true
  })],
  providers: [...providers],
  controllers: [MariaMainController],
  exports: [TypeOrmModule, ...modules, ...providers]
})
export class MariaMainModule {}
