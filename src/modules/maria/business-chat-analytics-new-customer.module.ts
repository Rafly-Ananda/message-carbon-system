import { Module } from '@nestjs/common';
import { BusinessChatAnalyticsNewCustomerService } from 'src/services/maria/owner-insight-analytics/business-chat-analytics-new-customer.service';
import { BusinessChatAnalyticsNewCustomerController } from 'src/controllers/maria/business-chat-analytics-new-customer.controller';
import { MariaSharedModule } from './maria-shared.module';

@Module({
    imports: [MariaSharedModule],
    providers: [BusinessChatAnalyticsNewCustomerService],
    controllers: [BusinessChatAnalyticsNewCustomerController],
    exports: [MariaSharedModule]
})
export class BusinessChatAnalyticsNewCustomerModule {}