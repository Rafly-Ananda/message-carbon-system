import { Injectable } from "@nestjs/common";
import { getDataSourceToken, InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BusinessChatAnalyticsLandingPage } from "src/models/maria-typeorm-entities/business-chat-analytics-landing-page.entity";
import { avgVisitorPerPeriodType } from "src/interfaces/maria/owner-insight-analytics/calc-avg-visitor-request.interface";
import * as moment from "moment";

interface calculateSharedGrowthType extends avgVisitorPerPeriodType {
}

@Injectable()
export class BusinessChatAnalyticsLandingPageService {
    constructor(
        @InjectRepository(BusinessChatAnalyticsLandingPage) private businessChatAnalyticsLandingPageRepo: Repository<BusinessChatAnalyticsLandingPage>
    ) {}

    async getInteractionPerPeriod(queries: avgVisitorPerPeriodType): Promise<any> {
      return this.businessChatAnalyticsLandingPageRepo.query(`SELECT
          *
        FROM 
            (
            SELECT
              COUNT(*) AS curr
            FROM
            business_landing_page_analytics blpa
            WHERE
              blpa.created_at BETWEEN "${
                queries.startOfCurrPeriodDate.format('YYYY-MM-DD')
        } 00:00:00" AND "${queries.endOfCurrPeriodDate.format('YYYY-MM-DD')} 23:59:59"
              AND blpa.business_jabberid = "${queries.toId}" ) AS curr_period,
            (
            SELECT
              COUNT(*) AS prev
            FROM
            business_landing_page_analytics blpa
            WHERE
              blpa.created_at BETWEEN "${
              queries.startOfPrevPeriodDate.format('YYYY-MM-DD')
        } 00:00:00" AND "${queries.endOfPrevPeriodDate.format('YYYY-MM-DD')} 23:59:59"
              AND blpa.business_jabberid = "${queries.toId}" ) AS prev_period`)
      }

    findAll(): Promise<BusinessChatAnalyticsLandingPage[]> {
        return this.businessChatAnalyticsLandingPageRepo.find()
    }

    async saveRecord(payload: BusinessChatAnalyticsLandingPage): Promise<BusinessChatAnalyticsLandingPage> {
        try {
            return this.businessChatAnalyticsLandingPageRepo.save(payload)
        } catch (e) {
            throw new Error(e)
        }
    }

    async calculateSharedGrowth(queries: calculateSharedGrowthType): Promise<any> {
        let result: any;
        
        try {
            const sharedPerPeriod = await this.getInteractionPerPeriod({...queries});
            const currPeriodData = +sharedPerPeriod[0]['curr'];
            const prevPeriodData = +sharedPerPeriod[0]['prev'];

            if (currPeriodData === 0 && prevPeriodData === 0) {
                result = {
                  count: 0,
                  growth_percentage: 0,
                };
              } else if (currPeriodData !== 0 && prevPeriodData === 0) {
                result = {
                  count : Math.abs(currPeriodData),
                  growth_percentage: 100,
                }
              } else {
                const custDiff = currPeriodData - prevPeriodData;
                const growthPercentage = ((currPeriodData - prevPeriodData) /
                prevPeriodData) * 100;
        
                result = {
                  count: Math.abs(custDiff),
                  growth_percentage: Math.ceil(growthPercentage),
                };
              }
              return result;
        } catch (e) {
            throw new Error(e)
        }
    }
}