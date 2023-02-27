import { Injectable } from "@nestjs/common";
import { getDataSourceToken, InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BusinessChatAnalyticsNewCustomer } from "src/models/maria-typeorm-entities/business-chat-analytics-new-customer.entity";
import { BusinessChatAnalyticsLandingPageService } from "./business-chat-analytics-landing-page.service";
import { avgVisitorPerPeriodType } from "src/interfaces/maria/owner-insight-analytics/calc-avg-visitor-request.interface";
import { calculateGrowthType } from "src/interfaces/maria/owner-insight-analytics/calc-growth-request.interface";
import * as moment from "moment";

@Injectable()
export class BusinessChatAnalyticsNewCustomerService {
  constructor(
    @InjectRepository(
      BusinessChatAnalyticsNewCustomer,
    ) private businessChatAnalyticsNewCustomerRepo: Repository<
      BusinessChatAnalyticsNewCustomer
    >,
    private businessChatAnalyticsLandingPageService: BusinessChatAnalyticsLandingPageService
  ) {}

  findAll(): Promise<BusinessChatAnalyticsNewCustomer[]> {
    return this.businessChatAnalyticsNewCustomerRepo.find();
  }

  async getVisitorPerPeriod(queries: avgVisitorPerPeriodType): Promise<any> {
    return this.businessChatAnalyticsNewCustomerRepo.query(`SELECT
        *
      FROM 
          (
          SELECT
            COUNT(*) AS curr
          FROM
            new_customer nc
          WHERE
            nc.send_time BETWEEN "${
              queries.startOfCurrPeriodDate.format('YYYY-MM-DD')
      } 00:00:00" AND "${queries.endOfCurrPeriodDate.format('YYYY-MM-DD')} 23:59:59"
            AND nc.to_id = "${queries.toId}" ) AS curr_period,
          (
          SELECT
            COUNT(*) AS prev
          FROM
            new_customer nc
          WHERE
            nc.send_time BETWEEN "${
            queries.startOfPrevPeriodDate.format('YYYY-MM-DD')
      } 00:00:00" AND "${queries.endOfPrevPeriodDate.format('YYYY-MM-DD')} 23:59:59"
            AND nc.to_id = "${queries.toId}" ) AS prev_period`)
  }

  calculateGrowth(visitorPerPeriod: calculateGrowthType): any {
    let result: any = {};
    const currPeriodData: number = +visitorPerPeriod[0]['curr'];
    const prevPeriodData: number = +visitorPerPeriod[0]['prev'];

    if (currPeriodData === 0 && prevPeriodData === 0) {
      result = {
        count: 0,
        growth_percentage: 0,
      };
    } else if (currPeriodData !== 0 && prevPeriodData === 0) {
      result = {
        count : Math.abs(currPeriodData),
        growth_percentage: 100,
      };
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
  }

  async saveRecord(
    payload: BusinessChatAnalyticsNewCustomer,
  ): Promise<BusinessChatAnalyticsNewCustomer> {
    try {
      return this.businessChatAnalyticsNewCustomerRepo.save(payload);
    } catch (e) {
      throw new Error(e);
    }
  }

  async findDailyRecord(toId: string, date?: string, startDate?: string, endDate?: string): Promise<any> {
    let startOfPrevPeriodDate: any, endOfPrevPeriodDate: any;

    const startOfCurrPeriodDate = startDate && endDate ? moment.utc(startDate, 'YYYY-MM-DD') : moment.utc(date, "YYYY-MM-DD").subtract(1, "day");
    const endOfCurrPeriodDate = startDate && endDate ? moment.utc(endDate, 'YYYY-MM-DD') : moment.utc(date, "YYYY-MM-DD");
    const dateDiff = endOfCurrPeriodDate.diff(startOfCurrPeriodDate, "days");

    if (startDate && endDate) {
      startOfPrevPeriodDate = moment(startOfCurrPeriodDate).subtract(dateDiff + 1, 'day')
      endOfPrevPeriodDate = moment(startOfCurrPeriodDate).subtract(1, 'day')
    } else {
      startOfPrevPeriodDate = startOfCurrPeriodDate
      endOfPrevPeriodDate = startOfCurrPeriodDate
    }

    const dateParams = {
      startOfCurrPeriodDate: startDate && endDate ? startOfCurrPeriodDate : endOfCurrPeriodDate,
      endOfCurrPeriodDate: endOfCurrPeriodDate,
      startOfPrevPeriodDate:  startOfPrevPeriodDate,
      endOfPrevPeriodDate: endOfPrevPeriodDate,
      toId: toId
    }

    try {
      const visitorPerPeriod = await this.getVisitorPerPeriod(dateParams);
      const sharedGrowth = await this.businessChatAnalyticsLandingPageService.calculateSharedGrowth(dateParams);
      const visitorGrowth = this.calculateGrowth(visitorPerPeriod);

      return {
        shared: {...sharedGrowth },
        new_customer: {...visitorGrowth}
      };
    } catch (e) {
      throw new Error(e)
    }
  }

  async findWeeklyRecord(toId: string, date?: string, startDate?: string, endDate?: string): Promise<any> {
    let startOfPrevPeriodDate: any, endOfPrevPeriodDate: any;

    const startOfCurrPeriodDate  = startDate && endDate ? moment.utc(startDate, 'YYYY-MM-DD') : moment.utc(date, "YYYY-MM-DD").subtract(7, "days");
    const endOfCurrPeriodDate = startDate && endDate ? moment.utc(endDate, 'YYYY-MM-DD') : moment.utc(date, "YYYY-MM-DD").subtract(1, "day");
    const dateDiff = endOfCurrPeriodDate.diff(startOfCurrPeriodDate, "days");

    if (startDate && endDate) {
      startOfPrevPeriodDate = moment(startOfCurrPeriodDate).subtract(dateDiff + 1, 'day')
      endOfPrevPeriodDate = moment(startOfCurrPeriodDate).subtract(1, 'day')
    } else {
      startOfPrevPeriodDate = moment(startOfCurrPeriodDate).subtract(7, "days");
      endOfPrevPeriodDate = moment(startOfCurrPeriodDate).subtract(1, "day");
    }

    const dateParams = {
      startOfCurrPeriodDate: startOfCurrPeriodDate,
      endOfCurrPeriodDate: endOfCurrPeriodDate,
      startOfPrevPeriodDate:  startOfPrevPeriodDate,
      endOfPrevPeriodDate: endOfPrevPeriodDate,
      toId: toId
    }

    try {
      const visitorPerPeriod = await this.getVisitorPerPeriod(dateParams);
      const sharedGrowth = await this.businessChatAnalyticsLandingPageService.calculateSharedGrowth(dateParams);
      const visitorGrowth = this.calculateGrowth(visitorPerPeriod);

      return {
        shared: {...sharedGrowth },
        new_customer: {...visitorGrowth}
      };
    } catch (e) {
      throw new Error(e)
    }
  }

  async findMonthlyRecord(toId: string, date?: string, startDate?: string, endDate?: string): Promise<any> {
    let startOfPrevPeriodDate: any, endOfPrevPeriodDate: any;

    const startOfCurrPeriodDate  = startDate && endDate ? moment.utc(startDate, 'YYYY-MM-DD') : moment.utc(date, "YYYY-MM-DD").subtract(1, "month")
    .startOf("month");
    const endOfCurrPeriodDate = startDate && endDate ? moment.utc(endDate, 'YYYY-MM-DD') : moment.utc(date, "YYYY-MM-DD").subtract(1, "month")
    .endOf("month");
    const dateDiff = endOfCurrPeriodDate.diff(startOfCurrPeriodDate, "days");

    if (startDate && endDate) {
      startOfPrevPeriodDate = moment(startOfCurrPeriodDate).subtract(dateDiff + 1, 'days');
      endOfPrevPeriodDate = moment(startOfCurrPeriodDate).subtract(1, 'day');
    } else {
      startOfPrevPeriodDate = moment(startOfCurrPeriodDate).subtract(1, "month").startOf('month');
      endOfPrevPeriodDate = moment(startOfCurrPeriodDate).subtract(1, "month").endOf('month');
    }

    const dateParams = {
      startOfCurrPeriodDate: startOfCurrPeriodDate,
      endOfCurrPeriodDate: endOfCurrPeriodDate,
      startOfPrevPeriodDate:  startOfPrevPeriodDate,
      endOfPrevPeriodDate: endOfPrevPeriodDate,
      toId: toId
    }

    try {
      const visitorPerPeriod = await this.getVisitorPerPeriod(dateParams);
      const sharedGrowth = await this.businessChatAnalyticsLandingPageService.calculateSharedGrowth(dateParams);
      const visitorGrowth = this.calculateGrowth(visitorPerPeriod);

      return {
        shared: {...sharedGrowth },
        new_customer: {...visitorGrowth}
      };
    } catch (e) {
      throw new Error(e)
    }
  }

  async findLast3MonthlyRecord(date: string, toId: string): Promise<any> {
    const startOfCurrPeriodDate = moment.utc(date, "YYYY-MM-DD").subtract(
      3,
      "months",
    ).startOf("month");
    const endOfCurrPeriodDate = moment.utc(date, "YYYY-MM-DD").subtract(1, "months")
      .endOf("month");

    const startOfPrevPeriodDate = moment.utc(startOfCurrPeriodDate, "YYYY-MM-DD").subtract(
      3,
      "months",
    ).startOf("month");
    const endOfPrevPeriodDate = moment.utc(startOfCurrPeriodDate, "YYYY-MM-DD").subtract(1, "months")
    .endOf("month");

    const dateParams = {
      startOfCurrPeriodDate: startOfCurrPeriodDate,
      endOfCurrPeriodDate: endOfCurrPeriodDate,
      startOfPrevPeriodDate:  startOfPrevPeriodDate,
      endOfPrevPeriodDate: endOfPrevPeriodDate,
      toId: toId
    }

    try {
      const visitorPerPeriod = await this.getVisitorPerPeriod(dateParams);
      const sharedGrowth = await this.businessChatAnalyticsLandingPageService.calculateSharedGrowth(dateParams);
      const visitorGrowth = this.calculateGrowth(visitorPerPeriod);

      return {
        shared: {...sharedGrowth },
        new_customer: {...visitorGrowth}
      };
    } catch (e) {
      throw new Error(e);
    }
  }

  async findYearlyRecord(toId: string, date?: string, startDate?: string, endDate?: string): Promise<any> {
    let startOfPrevPeriodDate: any, endOfPrevPeriodDate: any;

    const startOfCurrPeriodDate  = startDate && endDate ? moment.utc(startDate, 'YYYY-MM-DD') : moment.utc(date, "YYYY-MM-DD").subtract(1, "year")
    .startOf("year");
    const endOfCurrPeriodDate = startDate && endDate ? moment.utc(endDate, 'YYYY-MM-DD') : moment.utc(date, "YYYY-MM-DD").subtract(1, "year")
    .endOf("year");
    const dateDiff = endOfCurrPeriodDate.diff(startOfCurrPeriodDate, "days");

    if (startDate && endDate) {
      startOfPrevPeriodDate = moment(startOfCurrPeriodDate).subtract(dateDiff + 1, 'days');
      endOfPrevPeriodDate = moment(startOfCurrPeriodDate).subtract(1, 'day');
    } else {
      startOfPrevPeriodDate = moment(startOfCurrPeriodDate).subtract(1, "year").startOf('year');
      endOfPrevPeriodDate = moment(startOfCurrPeriodDate).subtract(1, "year").endOf('year');
    }

    const dateParams = {
      startOfCurrPeriodDate: startOfCurrPeriodDate,
      endOfCurrPeriodDate: endOfCurrPeriodDate,
      startOfPrevPeriodDate:  startOfPrevPeriodDate,
      endOfPrevPeriodDate: endOfPrevPeriodDate,
      toId: toId
    }
  
    try {
      const visitorPerPeriod = await this.getVisitorPerPeriod(dateParams);
      const sharedGrowth = await this.businessChatAnalyticsLandingPageService.calculateSharedGrowth(dateParams);
      const visitorGrowth = this.calculateGrowth(visitorPerPeriod);

      return {
        shared: {...sharedGrowth },
        new_customer: {...visitorGrowth}
      };
    } catch (e) {
      throw new Error(e)
    }
  }
}
