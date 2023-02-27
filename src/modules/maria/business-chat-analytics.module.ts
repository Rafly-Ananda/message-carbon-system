import { Module } from '@nestjs/common';
import { BusinessChatAnalyticsService } from 'src/services/maria/owner-insight-analytics/business-chat-analytics.service';
import { BusinessChatAnalyticsController } from 'src/controllers/maria/business-chat-analytics.controller';
import { MariaSharedModule } from './maria-shared.module';

@Module({
    imports: [MariaSharedModule],
    providers: [BusinessChatAnalyticsService],
    controllers: [BusinessChatAnalyticsController],
    exports: [MariaSharedModule]
})
export class BusinessChatAnalyticsModule {}