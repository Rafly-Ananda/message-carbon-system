import { Module } from "@nestjs/common";
import { RouterModule } from "@nestjs/core";

// MongoDB Route
import { MongoMainModule } from "./mongo/mongo-main.module";
import { MongoChatModule } from "./mongo/mongo-chat.module";

// MariaDB Route
import { MariaMainModule } from "./maria/maria-main.module";
import { BusinessChatAnalyticsModule } from "./maria/business-chat-analytics.module";
import { BusinessChatAnalyticsNewCustomerModule } from "./maria/business-chat-analytics-new-customer.module";
import { BusinessChatAnalyticsLandingPageModule } from "./maria/business-chat-analytics-landing-page.module";

const routes = [
  {
    path: "mongo",
    module: MongoMainModule,
    children: [
      {
        path: "chat",
        module: MongoChatModule,
      },
    ],
  },
  {
    path: "maria",
    module: MariaMainModule,
    children: [
      {
        path: 'chat-analytics',
        module: BusinessChatAnalyticsModule
      }, 
      {
        path: 'chat-analytics-new-customer',
        module: BusinessChatAnalyticsNewCustomerModule
      },
      {
        path: 'chat-analytics-landing-page',
        module: BusinessChatAnalyticsLandingPageModule
      }
    ]
  }
];

@Module({
  imports: [
    // Mongo entry module
    MongoMainModule,
    MariaMainModule,
    MongoChatModule,
    // Routing
    RouterModule.register(routes),
  ],
  exports: [
    // Routing
    RouterModule.register(routes),
  ],
})
export class RoutingModule {}
