import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BusinessChatAnalyticsService } from 'src/services/maria/owner-insight-analytics/business-chat-analytics.service';
import { BusinessChatAnalytics } from 'src/models/maria-typeorm-entities/business-chat-analytics.entity';

import { BusinessChatAnalyticsNewCustomerService } from 'src/services/maria/owner-insight-analytics/business-chat-analytics-new-customer.service';
import { BusinessChatAnalyticsNewCustomer } from 'src/models/maria-typeorm-entities/business-chat-analytics-new-customer.entity';


import { BusinessChatAnalyticsLandingPageService } from 'src/services/maria/owner-insight-analytics/business-chat-analytics-landing-page.service';
import { BusinessChatAnalyticsLandingPage } from 'src/models/maria-typeorm-entities/business-chat-analytics-landing-page.entity';

const providers = [BusinessChatAnalyticsService, BusinessChatAnalyticsNewCustomerService, BusinessChatAnalyticsLandingPageService];

@Module({
    imports: [TypeOrmModule.forFeature([BusinessChatAnalytics, BusinessChatAnalyticsNewCustomer, BusinessChatAnalyticsLandingPage])],
    providers: [...providers],
    controllers: [],
    exports: [TypeOrmModule, ...providers]
})
export class MariaSharedModule {}