import { Module } from '@nestjs/common';
import { BusinessChatAnalyticsLandingPageService } from 'src/services/maria/owner-insight-analytics/business-chat-analytics-landing-page.service';
import { BusinessChatAnalyticsLandingPageController } from 'src/controllers/maria/business-chat-analytics-landing-page.controller';
import { MariaSharedModule } from './maria-shared.module';

@Module({
    imports: [MariaSharedModule],
    providers: [BusinessChatAnalyticsLandingPageService],
    controllers: [BusinessChatAnalyticsLandingPageController],
    exports: [MariaSharedModule]
})
export class BusinessChatAnalyticsLandingPageModule {}