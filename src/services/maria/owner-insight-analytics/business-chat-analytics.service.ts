import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BusinessChatAnalytics } from "src/models/maria-typeorm-entities/business-chat-analytics.entity";
import { avgVisitorPerPeriodType } from "src/interfaces/maria/owner-insight-analytics/calc-avg-visitor-request.interface";
import * as moment from "moment";

@Injectable()
export class BusinessChatAnalyticsService {
  constructor(
    @InjectRepository(BusinessChatAnalytics) private businessChatAnalyticsRepo:
      Repository<BusinessChatAnalytics>,
  ) {}

  async calculateAvgPerHour(
    startDate: string,
    endDate: string,
    totalDay: number,
    toId: string,
  ): Promise<any> {
    return await this.businessChatAnalyticsRepo.createQueryBuilder(
      "bca",
    ).select(`CEIL(COUNT(bca.id)/${totalDay})`, "avg_count")
      .addSelect("HOUR(bca.send_time)", "hour").where(
        `bca.send_time BETWEEN "${startDate} 00:00:00" AND "${endDate} 23:59:59"`,
      ).andWhere("bca.to_id = :toId", { toId }).groupBy(
        "HOUR(bca.send_time)",
      ).getRawMany();
  }

  async avgVisitorPerPeriod(queries: avgVisitorPerPeriodType): Promise<any> {
    return await this.businessChatAnalyticsRepo.query(`
      SELECT
        *
      FROM 
          (
          SELECT
            COUNT(*) AS curr
          FROM
            business_chat_analytics bca
          WHERE
            bca.send_time BETWEEN "${
              queries.startOfCurrPeriodDate.format('YYYY-MM-DD')
      } 00:00:00" AND "${queries.endOfCurrPeriodDate.format('YYYY-MM-DD')} 23:59:59"
            AND bca.to_id = "${queries.toId}" ) AS curr_period,
          (
          SELECT
            COUNT(*) AS prev
          FROM
            business_chat_analytics bca
          WHERE
            bca.send_time BETWEEN "${
        queries.startOfPrevPeriodDate.format('YYYY-MM-DD')
      } 00:00:00" AND "${queries.endOfPrevPeriodDate.format('YYYY-MM-DD')} 23:59:59"
            AND bca.to_id = "${queries.toId}" ) AS prev_period`)
  }

  async saveRecord(
    payload: BusinessChatAnalytics,
  ): Promise<BusinessChatAnalytics> {
    try {
      return this.businessChatAnalyticsRepo.save(payload);
    } catch (e) {
      throw new Error(e);
    }
  }

  findAll(): Promise<BusinessChatAnalytics[]> {
    return this.businessChatAnalyticsRepo.find();
  }

  async remove(id: string): Promise<void> {
    await this.businessChatAnalyticsRepo.delete(id);
  }

  async findDailyRecord(toId: string, date?: string, startDate?: string, endDate?: string): Promise<any> {
    let startOfPrevPeriodDate: any, endOfPrevPeriodDate: any;
    let currPeriodData: number, prevPeriodData: number;

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

    try {
      const prevPeriodVisitorCount = await this.avgVisitorPerPeriod({
        startOfCurrPeriodDate: startDate && endDate ? startOfCurrPeriodDate : endOfCurrPeriodDate,
        endOfCurrPeriodDate: endOfCurrPeriodDate,
        startOfPrevPeriodDate:  startOfPrevPeriodDate,
        endOfPrevPeriodDate: endOfPrevPeriodDate,
        toId: toId
      });
      
      const avgAcvityPerHourQuery = await this.calculateAvgPerHour(
        startOfCurrPeriodDate.format("YYYY-MM-DD"),
        endOfCurrPeriodDate.format("YYYY-MM-DD"),
        dateDiff,
        toId,
      );

      const result = {
        total_visitor: +prevPeriodVisitorCount[0]['curr'],
        avg_hourly_visitor: avgAcvityPerHourQuery.reduce(
          (acc: any, curr: any) => ({
            ...acc,
            [`${curr.hour}`]: +curr.avg_count,
          }),
          {},
        ),
      };

      currPeriodData = +prevPeriodVisitorCount[0]['curr'];
      prevPeriodData = +prevPeriodVisitorCount[0]['prev'];

      if (currPeriodData === 0 && prevPeriodData === 0) {
        result['visitor_growth'] = {
          growth_percentage: "Data not available.",
          compared_againts: "Data in previous date or period is not available.",
        };
      } else if (currPeriodData !== 0 && prevPeriodData === 0) {
        result['visitor_growth'] = {
          growth_percentage : 100,
          compared_againts: startDate && endDate ? `${startOfPrevPeriodDate.format("YYYY-MM-DD")} - ${endOfPrevPeriodDate.format('YYYY-MM-DD')}` : startOfCurrPeriodDate.format("YYYY-MM-DD"),
        }
      } else {
        const growthPercentage = ((currPeriodData - prevPeriodData) /
        prevPeriodData) * 100;

        result["visitor_growth"] = {
          growth_percentage: Math.ceil(growthPercentage),
          compared_againts: startDate && endDate ? `${startOfPrevPeriodDate.format("YYYY-MM-DD")} - ${endOfPrevPeriodDate.format('YYYY-MM-DD')}` : startOfCurrPeriodDate.format("YYYY-MM-DD"),
        };
      }

      return result;
    } catch (e) {
      throw new Error(e);
    }
  }

  async findWeeklyReport(toId: string, date?: string, startDate?: string, endDate?: string): Promise<any> {
    let startOfPrevPeriodDate: any, endOfPrevPeriodDate: any;
    let currPeriodData: number, prevPeriodData: number;

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

    try {
      const prevPeriodVisitorCount = await this.avgVisitorPerPeriod({
        startOfCurrPeriodDate: startOfCurrPeriodDate,
        endOfCurrPeriodDate: endOfCurrPeriodDate,
        startOfPrevPeriodDate:  startOfPrevPeriodDate,
        endOfPrevPeriodDate: endOfPrevPeriodDate,
        toId: toId
      });

      const activityPerDayQuery = await this.businessChatAnalyticsRepo
        .createQueryBuilder("bca").select(
          "COUNT(id)",
          "visitor_per_day",
        ).addSelect(
          "TO_CHAR(bca.send_time,  'YYYY-MM-dd')",
          "date",
        ).where(
          `bca.send_time BETWEEN "${
            startOfCurrPeriodDate.format("YYYY-MM-DD")
          } 00:00:00" AND "${endOfCurrPeriodDate.format("YYYY-MM-DD")} 23:59:59"`,
        ).andWhere("bca.to_id = :toId", { toId }).groupBy(
          "bca.date",
        ).orderBy('bca.send_time').getRawMany();

      const avgAcvityPerHourQuery = await this.calculateAvgPerHour(
        startOfCurrPeriodDate.format("YYYY-MM-DD"),
        endOfCurrPeriodDate.format("YYYY-MM-DD"),
        dateDiff,
        toId,
      );

      const result = {
        total_visitor: +prevPeriodVisitorCount[0]['curr'],
        daily_activity: activityPerDayQuery.reduce(
          (acc: any, curr: any) => ({
            ...acc,
            [curr.date]: +curr.visitor_per_day,
          }),
          {},
        ),
        avg_hourly_visitor: avgAcvityPerHourQuery.reduce(
          (acc: any, curr: any) => ({
            ...acc,
            [`${curr.hour}`]: +curr.avg_count,
          }),
          {},
        ),
      };

      currPeriodData = +prevPeriodVisitorCount[0]['curr'];
      prevPeriodData = +prevPeriodVisitorCount[0]['prev'];

      if (currPeriodData === 0 && prevPeriodData === 0) {
        result['visitor_growth'] = {
          growth_percentage: "Data not available.",
          compared_againts: "Data in previous date or period is not available.",
        };
      } else if (currPeriodData !== 0 && prevPeriodData === 0) {
        result['visitor_growth'] = {
          growth_percentage : 100,
          compared_againts: `${startOfPrevPeriodDate.format("YYYY-MM-DD")} - ${endOfPrevPeriodDate.format("YYYY-MM-DD")}`,
        }
      } else {
        const growthPercentage = ((currPeriodData - prevPeriodData) /
        prevPeriodData) * 100;

        result["visitor_growth"] = {
          growth_percentage: Math.ceil(growthPercentage),
          compared_againts: `${startOfPrevPeriodDate.format("YYYY-MM-DD")} - ${endOfPrevPeriodDate.format("YYYY-MM-DD")}`,
        };
      }

      return result;
    } catch (e) {
      throw new Error(e);
    }
  }

  async findMonthlyReport(toId: string, date?: string, startDate?: string, endDate?: string): Promise<any> {
    let startOfPrevPeriodDate: any, endOfPrevPeriodDate: any;
    let currPeriodData: number, prevPeriodData: number;
    let avgWeeklyVisitor: any;
    let activityPerMonth: any;

    const startOfCurrPeriodDate  = startDate && endDate ? moment.utc(startDate, 'YYYY-MM-DD') : moment.utc(date, "YYYY-MM-DD").subtract(1, "month")
    .startOf("month");
    const endOfCurrPeriodDate = startDate && endDate ? moment.utc(endDate, 'YYYY-MM-DD') : moment.utc(date, "YYYY-MM-DD").subtract(1, "month")
    .endOf("month");
    const dateDiff = endOfCurrPeriodDate.diff(startOfCurrPeriodDate, "days");
    const dateDiffWeek = endOfCurrPeriodDate.diff(startOfCurrPeriodDate, "week");

    if (startDate && endDate) {
      startOfPrevPeriodDate = moment(startOfCurrPeriodDate).subtract(dateDiff + 1, 'days');
      endOfPrevPeriodDate = moment(startOfCurrPeriodDate).subtract(1, 'day');
    } else {
      startOfPrevPeriodDate = moment(startOfCurrPeriodDate).subtract(1, "month").startOf('month');
      endOfPrevPeriodDate = moment(startOfCurrPeriodDate).subtract(1, "month").endOf('month');
    }

    try {
      const prevPeriodVisitorCount = await this.avgVisitorPerPeriod({
        startOfCurrPeriodDate: startOfCurrPeriodDate ,
        endOfCurrPeriodDate: endOfCurrPeriodDate,
        startOfPrevPeriodDate:  startOfPrevPeriodDate,
        endOfPrevPeriodDate: endOfPrevPeriodDate,
        toId: toId
      });

      const activityPerWeek = await this.businessChatAnalyticsRepo
        .createQueryBuilder("bca").select(
          "bca.week_of_month",
          "week_of_month",
        ).addSelect("COUNT(bca.id)", "visitor_per_week")
        .where(
          `bca.send_time BETWEEN "${
            startOfCurrPeriodDate.format("YYYY-MM-DD")
          } 00:00:00" AND "${endOfCurrPeriodDate.format("YYYY-MM-DD")} 23:59:59"`,
        ).andWhere("bca.to_id = :toId", { toId }).groupBy(
          "bca.week_of_month",
        ).getRawMany();

      // ? to get daily avg, we divide by how many weeks occur in the selected period dataset, the number of weeks is from the result of activityPerWeekQuery
      const avgDailyVisitor = await this.businessChatAnalyticsRepo
        .createQueryBuilder("bca").select(
          "DAYOFWEEK(bca.send_time)",
          "day",
        ).addSelect(`CEIL(COUNT(*)/${dateDiffWeek})`, "avg_daily_visitor").where(
          `bca.send_time BETWEEN "${
            startOfCurrPeriodDate.format("YYYY-MM-DD")
          } 00:00:00" AND "${endOfCurrPeriodDate.format("YYYY-MM-DD")} 23:59:59"`,
        ).andWhere("bca.to_id = :toId", { toId }).groupBy(
          "DAYOFWEEK(bca.send_time)",
        ).getRawMany();

      const avgAcvityPerHour = await this.calculateAvgPerHour(
        startOfCurrPeriodDate.format("YYYY-MM-DD"),
        endOfCurrPeriodDate.format("YYYY-MM-DD"),
        dateDiff,
        toId,
      );

      if (dateDiff > 60) {
        const monthDateDiff = endOfCurrPeriodDate.diff(startOfCurrPeriodDate, "months");

        activityPerMonth = await this.businessChatAnalyticsRepo
          .createQueryBuilder("business_chat_analytics").select(
            "MONTHNAME(business_chat_analytics.send_time)",
            "month_in_year",
          ).addSelect("COUNT(*)", "monthly_visitor").where(
            `business_chat_analytics.send_time BETWEEN "${
              startOfCurrPeriodDate.format("YYYY-MM-DD")
            } 00:00:00" AND "${endOfCurrPeriodDate.format("YYYY-MM-DD")} 23:59:59"`,
          ).andWhere("business_chat_analytics.to_id = :toId", { toId }).groupBy(
            "MONTH(business_chat_analytics.send_time)",
          ).getRawMany();

        // ? divide by 3 because the data is in the span of 3 months and the weeks is inside these 3 months
        avgWeeklyVisitor = await this.businessChatAnalyticsRepo
          .createQueryBuilder("business_chat_analytics").select(
            `CEIL(COUNT(*)/${monthDateDiff + 1})`,
            "avg_weekly_visitor",
          ).addSelect("business_chat_analytics.week_of_month", "week").where(
            `business_chat_analytics.send_time BETWEEN "${
              startOfCurrPeriodDate.format("YYYY-MM-DD")
            } 00:00:00" AND "${endOfCurrPeriodDate.format("YYYY-MM-DD")} 23:59:59"`,
          ).andWhere("business_chat_analytics.to_id = :toId", { toId }).groupBy(
            "business_chat_analytics.week_of_month",
          ).getRawMany();
      }

      const result = {
        total_visitor: +prevPeriodVisitorCount[0]['curr'],
        ...(dateDiff > 60 && {
            monthly_activity: activityPerMonth.reduce(
              (acc: any, curr: any) => ({
                ...acc,
                [curr.month_in_year]: +curr.monthly_visitor,
              }),
              {},
            )
          }
        ),
        ...(dateDiff > 60 && {
            avg_weekly_visitor: avgWeeklyVisitor.reduce(
              (acc: any, curr: any) => ({
                ...acc,
                [curr.week]: +curr.avg_weekly_visitor,
              }),
              {},
            )
          }
        ),
        ...(dateDiff <= 60 && {
            weekly_activity: activityPerWeek.reduce(
              (acc: any, curr: any) => ({
                ...acc,
                [curr.week_of_month]: +curr.visitor_per_week,
              }),
              {},
            )
          }
        ),
        avg_daily_visitor: avgDailyVisitor.reduce(
          (acc: any, curr: any) => ({
            ...acc,
            [`${curr.day}`]: +curr.avg_daily_visitor,
          }),
          {},
        ),
        avg_hourly_visitor: avgAcvityPerHour.reduce(
          (acc: any, curr: any) => ({
            ...acc,
            [`${curr.hour}`]: +curr.avg_count,
          }),
          {},
        ),
      };

      currPeriodData = +prevPeriodVisitorCount[0]['curr'];
      prevPeriodData = +prevPeriodVisitorCount[0]['prev'];

      if (currPeriodData === 0 && prevPeriodData === 0) {
        result['visitor_growth'] = {
          growth_percentage: "Data not available.",
          compared_againts: "Data in previous date or period is not available.",
        };
      } else if (currPeriodData !== 0 && prevPeriodData === 0) {
        result['visitor_growth'] = {
          growth_percentage : 100,
          compared_againts: `${startOfPrevPeriodDate.format("YYYY-MM-DD")} - ${endOfPrevPeriodDate.format("YYYY-MM-DD")}`,
        }
      } else {
        const growthPercentage = ((currPeriodData - prevPeriodData) /
        prevPeriodData) * 100;

        result["visitor_growth"] = {
          growth_percentage: Math.ceil(growthPercentage),
          compared_againts: `${startOfPrevPeriodDate.format("YYYY-MM-DD")} - ${endOfPrevPeriodDate.format("YYYY-MM-DD")}`,
        };
      }
      return result;
    } catch (e) {
      throw new Error(e);
    }
  }

  async findLast3MonthReport(date: string, toId: string): Promise<any> {
    let currPeriodData: number, prevPeriodData: number;

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

    const dateDiff = endOfCurrPeriodDate.diff(startOfCurrPeriodDate, "days");
    const dateDiffWeek = endOfCurrPeriodDate.diff(startOfCurrPeriodDate, "week");
    const monthDateDiff = endOfCurrPeriodDate.diff(startOfCurrPeriodDate, "months");


    try {
      const prevPeriodVisitorCount = await this.avgVisitorPerPeriod({
        startOfCurrPeriodDate: startOfCurrPeriodDate,
        endOfCurrPeriodDate: endOfCurrPeriodDate,
        startOfPrevPeriodDate:  startOfPrevPeriodDate,
        endOfPrevPeriodDate: endOfPrevPeriodDate,
        toId: toId
      });
  
      const activityPerMonth = await this.businessChatAnalyticsRepo
        .createQueryBuilder("business_chat_analytics").select(
          "MONTHNAME(business_chat_analytics.send_time)",
          "month_in_year",
        ).addSelect("COUNT(*)", "monthly_visitor").where(
          `business_chat_analytics.send_time BETWEEN "${
            startOfCurrPeriodDate.format("YYYY-MM-DD")
          } 00:00:00" AND "${endOfCurrPeriodDate.format("YYYY-MM-DD")} 23:59:59"`,
        ).andWhere("business_chat_analytics.to_id = :toId", { toId }).groupBy(
          "MONTH(business_chat_analytics.send_time)",
        ).getRawMany();

      // ? divide by 3 because the data is in the span of 3 months and the weeks is inside these 3 months
      const avgWeeklyVisitor = await this.businessChatAnalyticsRepo
        .createQueryBuilder("business_chat_analytics").select(
          `CEIL(COUNT(*)/${monthDateDiff + 1})`,
          "avg_weekly_visitor",
        ).addSelect("business_chat_analytics.week_of_month", "week").where(
          `business_chat_analytics.send_time BETWEEN "${
            startOfCurrPeriodDate.format("YYYY-MM-DD")
          } 00:00:00" AND "${endOfCurrPeriodDate.format("YYYY-MM-DD")} 23:59:59"`,
        ).andWhere("business_chat_analytics.to_id = :toId", { toId }).groupBy(
          "business_chat_analytics.week_of_month",
        ).getRawMany();

      // ? divide by 12 because there are 12 weeks in 3 months period
      const avgDailyVisitor = await this.businessChatAnalyticsRepo
        .createQueryBuilder("business_chat_analytics").select(
          "DAYOFWEEK(business_chat_analytics.send_time)",
          "day",
        ).addSelect(`CEIL(COUNT(*)/${dateDiffWeek})`, "avg_daily_visitor").where(
          `business_chat_analytics.send_time BETWEEN "${
            startOfCurrPeriodDate.format("YYYY-MM-DD")
          } 00:00:00" AND "${endOfCurrPeriodDate.format("YYYY-MM-DD")} 23:59:59"`,
        ).andWhere("business_chat_analytics.to_id = :toId", { toId }).groupBy(
          "DAYOFWEEK(business_chat_analytics.send_time)",
        ).getRawMany();

      // ? divide by 90 because roughly there are 90 days in the span of 3 months
      const avgHourlyVisitor = await this.calculateAvgPerHour(
        startOfCurrPeriodDate.format("YYYY-MM-DD"),
        endOfCurrPeriodDate.format("YYYY-MM-DD"),
        dateDiff - 1, // moment datediff is counting today, so the diff is 91
        toId,
      );

      const result = {
        total_visitor: +prevPeriodVisitorCount[0]['curr'],
        monthly_activity: activityPerMonth.reduce(
          (acc: any, curr: any) => ({
            ...acc,
            [curr.month_in_year]: +curr.monthly_visitor,
          }),
          {},
        ),
        avg_weekly_visitor: avgWeeklyVisitor.reduce(
          (acc: any, curr: any) => ({
            ...acc,
            [curr.week]: +curr.avg_weekly_visitor,
          }),
          {},
        ),
        avg_daily_visitor: avgDailyVisitor.reduce(
          (acc: any, curr: any) => ({
            ...acc,
            [curr.day]: +curr.avg_daily_visitor,
          }),
          {},
        ),
        avg_hourly_visitor: avgHourlyVisitor.reduce(
          (acc: any, curr: any) => ({ ...acc, [curr.hour]: +curr.avg_count }),
          {},
        ),
      };

      currPeriodData = +prevPeriodVisitorCount[0]['curr'];
      prevPeriodData = +prevPeriodVisitorCount[0]['prev'];

      if (currPeriodData === 0 && prevPeriodData === 0) {
        result['visitor_growth'] = {
          growth_percentage: "Data not available.",
          compared_againts: "Data in previous date or period is not available.",
        };
      } else if (currPeriodData !== 0 && prevPeriodData === 0) {
        result['visitor_growth'] = {
          growth_percentage : 100,
          compared_againts: `${startOfPrevPeriodDate.format("YYYY-MM-DD")} - ${endOfPrevPeriodDate.format("YYYY-MM-DD")}`,
        }
      } else {
        const growthPercentage = ((currPeriodData - prevPeriodData) /
        prevPeriodData) * 100;

        result["visitor_growth"] = {
          growth_percentage: Math.ceil(growthPercentage),
          compared_againts: `${startOfPrevPeriodDate.format("YYYY-MM-DD")} - ${endOfPrevPeriodDate.format("YYYY-MM-DD")}`,
        };
      }

      return result;
    } catch (e) {
      throw new Error(e)
    }
  }

  async findyearlyReport(toId: string, date?: string, startDate?: string, endDate?: string): Promise<any> {
    let startOfPrevPeriodDate: any, endOfPrevPeriodDate: any;
    let currPeriodData: number, prevPeriodData: number;

    const startOfCurrPeriodDate  = startDate && endDate ? moment.utc(startDate, 'YYYY-MM-DD') : moment.utc(date, "YYYY-MM-DD").subtract(1, "year")
    .startOf("year");
    const endOfCurrPeriodDate = startDate && endDate ? moment.utc(endDate, 'YYYY-MM-DD') : moment.utc(date, "YYYY-MM-DD").subtract(1, "year")
    .endOf("year");
    const dateDiff = endOfCurrPeriodDate.diff(startOfCurrPeriodDate, "days");
    const dateDiffWeek = endOfCurrPeriodDate.diff(startOfCurrPeriodDate, "week");
    const monthDateDiff = endOfCurrPeriodDate.diff(startOfCurrPeriodDate, "months");

    if (startDate && endDate) {
      startOfPrevPeriodDate = moment(startOfCurrPeriodDate).subtract(dateDiff + 1, 'days');
      endOfPrevPeriodDate = moment(startOfCurrPeriodDate).subtract(1, 'day');
    } else {
      startOfPrevPeriodDate = moment(startOfCurrPeriodDate).subtract(1, "year").startOf('year');
      endOfPrevPeriodDate = moment(startOfCurrPeriodDate).subtract(1, "year").endOf('year');
    }

    try {
      const prevPeriodVisitorCount = await this.avgVisitorPerPeriod({
        startOfCurrPeriodDate: startOfCurrPeriodDate,
        endOfCurrPeriodDate: endOfCurrPeriodDate,
        startOfPrevPeriodDate:  startOfPrevPeriodDate,
        endOfPrevPeriodDate: endOfPrevPeriodDate,
        toId: toId
      });
  
      const activityPerMonth = await this.businessChatAnalyticsRepo
        .createQueryBuilder("bca").select(
          "MONTHNAME(bca.send_time)",
          "month_in_year",
        ).addSelect("COUNT(*)", "monthly_visitor").where(
          `bca.send_time BETWEEN "${
            startOfCurrPeriodDate.format("YYYY-MM-DD")
          } 00:00:00" AND "${endOfCurrPeriodDate.format("YYYY-MM-DD")} 23:59:59"`,
        ).andWhere("bca.to_id = :toId", { toId }).groupBy("MONTH(bca.send_time)")
        .getRawMany();
      
      console.log(activityPerMonth);
  
        // ? to get weekly avg, we divide by how many months occur in the selected period dataset, the number of months is from the result of activityPerMonth
      const avgWeeklyVisitor = await this.businessChatAnalyticsRepo
        .createQueryBuilder("bca").select(
          `CEIL(COUNT(*)/${date ? 12 : monthDateDiff + 1})`,
          "avg_weekly_visitor",
        ).addSelect("bca.week_of_month", "week").where(
          `bca.send_time BETWEEN "${
            startOfCurrPeriodDate.format("YYYY-MM-DD")
          } 00:00:00" AND "${endOfCurrPeriodDate.format("YYYY-MM-DD")} 23:59:59"`,
        ).andWhere("bca.to_id = :toId", { toId }).groupBy("bca.week_of_month")
        .getRawMany();
  
      // ? to get daily avg, we divide by how many weeks occur in the selected period dataset
      const avgDailyVisitor = await this.businessChatAnalyticsRepo
        .createQueryBuilder("bca").select("DAYOFWEEK(bca.send_time)", "day")
        .addSelect(`CEIL(COUNT(*)/${date ? 48 : dateDiffWeek})`, "avg_daily_visitor").where(
          `bca.send_time BETWEEN "${
            startOfCurrPeriodDate.format("YYYY-MM-DD")
          } 00:00:00" AND "${endOfCurrPeriodDate.format("YYYY-MM-DD")} 23:59:59"`,
        ).andWhere("bca.to_id = :toId", { toId }).groupBy(
          "DAYOFWEEK(bca.send_time)",
        ).getRawMany();
  
      const avgAcvityPerHour = await this.calculateAvgPerHour(
        startOfCurrPeriodDate.format("YYYY-MM-DD"),
        endOfCurrPeriodDate.format("YYYY-MM-DD"),
        dateDiff,
        toId,
      );
  
      const result = {
        total_visitor: +prevPeriodVisitorCount[0]['curr'],
        monthly_activity: activityPerMonth.reduce(
          (acc: any, curr: any) => ({
            ...acc,
            [curr.month_in_year]: +curr.monthly_visitor,
          }),
          {},
        ),
        avg_weekly_visitor: avgWeeklyVisitor.reduce(
          (acc: any, curr: any) => ({
            ...acc,
            [curr.week]: +curr.avg_weekly_visitor,
          }),
          {},
        ),
        avg_daily_visitor: avgDailyVisitor.reduce(
          (acc: any, curr: any) => ({
            ...acc,
            [curr.day]: +curr.avg_daily_visitor,
          }),
          {},
        ),
        avg_hourly_visitor: avgAcvityPerHour.reduce(
          (acc: any, curr: any) => ({ ...acc, [curr.hour]: +curr.avg_count }),
          {},
        ),
      };

      currPeriodData = +prevPeriodVisitorCount[0]['curr'];
      prevPeriodData = +prevPeriodVisitorCount[0]['prev'];

      if (currPeriodData === 0 && prevPeriodData === 0) {
        result['visitor_growth'] = {
          growth_percentage: "Data not available.",
          compared_againts: "Data in previous date or period is not available.",
        };
      } else if (currPeriodData !== 0 && prevPeriodData === 0) {
        result['visitor_growth'] = {
          growth_percentage : 100,
          compared_againts: `${startOfPrevPeriodDate.format("YYYY-MM-DD")} - ${endOfPrevPeriodDate.format("YYYY-MM-DD")}`,
        }
      } else {
        const growthPercentage = ((currPeriodData - prevPeriodData) /
        prevPeriodData) * 100;

        result["visitor_growth"] = {
          growth_percentage: Math.ceil(growthPercentage),
          compared_againts: `${startOfPrevPeriodDate.format("YYYY-MM-DD")} - ${endOfPrevPeriodDate.format("YYYY-MM-DD")}`,
        };
      }

      return result;
    } catch (e) {
      throw new Error(e);
    }
  }
}
