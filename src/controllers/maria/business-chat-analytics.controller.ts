import { Body, Controller, Get, Inject, Post, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { BusinessChatAnalyticsService } from "src/services/maria/owner-insight-analytics/business-chat-analytics.service";
import { BusinessChatAnalyticsNewCustomerService } from "src/services/maria/owner-insight-analytics/business-chat-analytics-new-customer.service";
import { RequestResponse } from "src/interfaces/response.interface";
import * as moment from "moment";

@Controller()
export class BusinessChatAnalyticsController {
  constructor(private businessChatAnalyticsService: BusinessChatAnalyticsService, private businessChatAnalyticsNewCustomerService: BusinessChatAnalyticsNewCustomerService) {}

  @Get()
  async getAllData(@Req() req: Request, @Res() res: Response): Promise<void> {
    const result = await this.businessChatAnalyticsService.findAll();
    res.status(200).json(result);
  }

  @Get('daily')
  async getDailyData(@Req() req: Request, @Res() res: Response): Promise<any> {
    const date = moment.utc(req.query.date as string);

    try {
      if (req.query.start_date && req.query.end_date) throw new Error('Error occurred, can not pass range date directly to this API call.')

      if (!date.isValid()) throw new Error('Error occurred, date format is not valid.')

      const dailyRecord = await this.businessChatAnalyticsService.findDailyRecord(req.query.to_id as string, req.query.date as string);

      const newCustomerCalc = await this.businessChatAnalyticsNewCustomerService.findDailyRecord(req.query.to_id as string, req.query.date as string);

      const response: RequestResponse = {
        status_code: 200,
        error: false,
        result: {
          ...dailyRecord,
          ...newCustomerCalc
        },
      };
      return res.status(200).json(response);
    } catch (e) {
      const response: RequestResponse = {
        status_code: 422,
        error: true,
        message: e.message,
      };
      return res.status(422).json(response);
    }
  }

  @Get('weekly')
  async getWeeklyData(@Req() req: Request, @Res() res: Response): Promise<any> {
    const date = moment.utc(req.query.date as string);

    try {
      if (req.query.start_date && req.query.end_date) throw new Error('Error occurred, can not pass range date directly to this API call.')

      if (!date.isValid()) throw new Error('Error occurred, date format is not valid.');

      const weeklyRecord = await this.businessChatAnalyticsService.findWeeklyReport(req.query.to_id as string, req.query.date as string);
      const newCustomerCalc = await this.businessChatAnalyticsNewCustomerService.findWeeklyRecord(req.query.to_id as string, req.query.date as string);

      const response: RequestResponse = {
        status_code: 200,
        error: false,
        result: {
          ...weeklyRecord,
          ...newCustomerCalc
        },
      };
      return res.status(200).json(response);
    } catch (e) {
      const response: RequestResponse = {
        status_code: 422,
        error: true,
        message: e.message,
      };
      return res.status(422).json(response);
    }
  }

  @Get('monthly')
  async getMonthlyData(@Req() req: Request, @Res() res: Response): Promise<any> {
    const date = moment.utc(req.query.date as string);

    try {
      if (req.query.start_date && req.query.end_date) throw new Error('Error occurred, can not pass range date directly to this API call.')

      if (!date.isValid()) throw new Error('Error occurred, date format is not valid.')

      const monthlyRecord = await this.businessChatAnalyticsService.findMonthlyReport(req.query.to_id as string, req.query.date as string);
      const newCustomerCalc = await this.businessChatAnalyticsNewCustomerService.findMonthlyRecord(req.query.to_id as string, req.query.date as string);

      const response: RequestResponse = {
        status_code: 200,
        error: false,
        result: {
          ...monthlyRecord,
          ...newCustomerCalc
        },
      };
      return res.status(200).json(response);
    } catch (e) {
      const response: RequestResponse = {
        status_code: 422,
        error: true,
        message: e.message,
      };
      return res.status(422).json(response);
    }
  }

  @Get('last-3-month')
  async getLast3MonthData(@Req() req: Request, @Res() res: Response): Promise<any> {
    const date = moment.utc(req.query.date as string);

    try {
      if (!date.isValid()) throw new Error('Error occurred, date format is not valid.')

      const last3MonthRecord = await this.businessChatAnalyticsService.findLast3MonthReport(req.query.date as string, req.query.to_id as string);
      const newCustomerCalc = await this.businessChatAnalyticsNewCustomerService.findLast3MonthlyRecord(date.format('YYYY-MM-DD'), req.query.to_id as string)

      const response: RequestResponse = {
        status_code: 200,
        error: false,
        result: {
          ...last3MonthRecord,
          ...newCustomerCalc
        },
      };
      return res.status(200).json(response);
    } catch (e) {
      const response: RequestResponse = {
        status_code: 422,
        error: true,
        message: e.message,
      };
      return res.status(422).json(response);
    }
  }

  @Get('yearly')
  async getYearlyData(@Req() req: Request, @Res() res: Response): Promise<any> {
    const date = moment.utc(req.query.date as string);

    try {
      if (req.query.start_date && req.query.end_date) throw new Error('Error occurred, can not pass range date directly to this API call.')

      if (!date.isValid()) throw new Error('Error occurred, date format is not valid.')

      const yearlyRecord = await this.businessChatAnalyticsService.findyearlyReport(req.query.to_id as string, req.query.date as string);
      const newCustomerCalc = await this.businessChatAnalyticsNewCustomerService.findYearlyRecord(req.query.to_id as string, req.query.date as string)

      const response: RequestResponse = {
        status_code: 200,
        error: false,
        result: {
          ...yearlyRecord,
          ...newCustomerCalc
        },
      };
      return res.status(200).json(response);
    } catch (e) {
      const response: RequestResponse = {
        status_code: 422,
        error: true,
        message: e.message,
      };
      return res.status(422).json(response);
    }
  }

  @Get('custom')
  async getDatePicker(@Req() req: Request, @Res() res: Response): Promise<any> {
    const startDate = moment.utc(req.query.start_date as string);
    const endDate = moment.utc(req.query.end_date as string);
    const dateDiff = endDate.diff(startDate, "days");
    const toId = req.query.to_id as string;
    let visitorRecord: any; 
    let newCustomerRecord: any;

    try {
      if (!req.query.start_date || !req.query.end_date) throw new Error('Error occurred, start_date or end_date is not defined') 

      if(!req.query.to_id) throw new Error('Error occurred, to_id param is required.')

      if (!startDate.isValid() || !endDate.isValid()) throw new Error('Error occurred, date format is not valid.')
  
      if (dateDiff < 6) {
        // daily
        visitorRecord = await this.businessChatAnalyticsService.findDailyRecord(toId, "", startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'));
        newCustomerRecord = await this.businessChatAnalyticsNewCustomerService.findDailyRecord(toId, "", startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'))
      } else if (dateDiff <= 28 ) {
        // weekly
        visitorRecord = await this.businessChatAnalyticsService.findWeeklyReport(toId, "", startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'))
        newCustomerRecord = await this.businessChatAnalyticsNewCustomerService.findDailyRecord(toId, "", startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'))
      } else if (dateDiff < 365 ) {
        // monthly
        visitorRecord = await this.businessChatAnalyticsService.findMonthlyReport(toId, "", startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'))
        newCustomerRecord = await this.businessChatAnalyticsNewCustomerService.findDailyRecord(toId, "", startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'))
      } else {
        // yearly
        visitorRecord = await this.businessChatAnalyticsService.findyearlyReport(toId, "", startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'))
        newCustomerRecord = await this.businessChatAnalyticsNewCustomerService.findDailyRecord(toId, "", startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'))
      }
      const response: RequestResponse = {
        status_code: 200,
        error: false,
        result: {
          ...visitorRecord,
          ...newCustomerRecord
        },
      };
      return res.status(200).json(response);
      
    } catch (e) {
      const response: RequestResponse = {
        status_code: 422,
        error: true,
        message: e.message,
      };
      return res.status(422).json(response);
    }
  }

  // @Post()
  // async createRecord(
  //   @Res() res: Response,
  //   @Body() payload: any,
  // ): Promise<any> {
  //   try {
  //     let counter = 0;
  //     let now = moment.utc("2023-01-01T09:23:05.545134Z");


  //     for (let i = 0; i < 10; i ++) {
  //       now.add(1, "days");
  //       for (let j = 0; j < 6; j++ ) {
  //         now.add(Math.floor(Math.random() * 6) + 1, "hours");
  //         now.add(1, "hours");
  //         let fromID = '1655715372600488' + counter + j.toString() + 3;
  //         let toId = '1649040691044276c1c850';
  //         let roomId = `${fromID}_${toId}`;

  //         console.log(now.format('LLLL'));

  //         // console.log(now.format());

  //         let dataset = {
  //           id: '1669189998028',
  //           type: 'ChatText',
  //           fromId: fromID,
  //           fromName: '0',
  //           sendTime: now.format(),
  //           toId: toId,
  //           toName: '',
  //           text: 'Zg==',
  //           caption: '',
  //           roomId: roomId,
  //           originality: 'Original',
  //           attachment: null,
  //           thumbnail: null,
  //           originalId: null,
  //           originalMessage: null,
  //           size: null,
  //           mime: null,
  //           longitude: null,
  //           latitude: null,
  //           participant: '[]',
  //           isGroup: 2,
  //         }

  //         // data stored in utc format, need to convert it first to current locale for use, month, day start from 0 ( 0 based )
  //         const momentDate = moment(dataset.sendTime);
  //         const formattedDate  = momentDate.format("YYYY-MM-DD HH:00:00");
  //         const toUnix = moment(formattedDate).unix();

  //         const setWeekOfMonth = (date: number) => {
  //           if (date <= 7) {
  //             return 1;
  //           } else if (date <= 14) {
  //             return 2;
  //           } else if (date <= 21) {
  //             return 3;
  //           } else {
  //             return 4
  //           }
  //         }

  //         // console.log(dataset.sendTime)

  //         const record = {
  //           key_id: `${dataset.roomId}_${toUnix}`,
  //           from_id: dataset.fromId,
  //           to_id: dataset.toId,
  //           room_id: dataset.roomId,
  //           send_time: dataset.sendTime as unknown as Date,
  //           date_hours: toUnix,
  //           year: momentDate.year(),
  //           month:  momentDate.month(),
  //           week_of_year: momentDate.week(),
  //           week_of_month: setWeekOfMonth(Number(momentDate.format('DD'))),
  //           day_of_week: momentDate.day(),
  //           date: Number(momentDate.format('DD')),
  //           hour: momentDate.hour(),
  //         }

  //         // console.log(record);
  //         await this.businessChatAnalyticsService.saveRecord(record);
  //       }
  //     }
      
  //     return res.status(200).json({success: true})

  //     // // data stored in utc format, need to convert it first to current locale for use, month, day start from 0 ( 0 based )
  //     // const momentDate = moment.utc(payload.sendTime);
  //     // const formattedDate  = moment.utc(payload.sendTime).format("YYYY-MM-DD HH:00:00");
  //     // const toUnix = moment.utc(formattedDate).unix();

  //     // const record = {
  //     //   key_id: `${payload.roomId}_${toUnix}`,
  //     //   from_id: payload.fromId,
  //     //   to_id: payload.toId,
  //     //   room_id: payload.roomId,
  //     //   send_time: payload.sendTime,
  //     //   date_hours: toUnix,
  //     //   year: momentDate.year(),
  //     //   month:  momentDate.month(),
  //     //   week_of_year: momentDate.weeksInYear(),
  //     //   week_of_month: momentDate.week() - moment().startOf('month').week() + 1,
  //     //   day_of_week: momentDate.day(),
  //     //   date: Number(momentDate.format('DD')),
  //     //   hour: momentDate.hour(),
  //     // }
  //     // const postResponse = await this.businessChatAnalyticsService.saveRecord(record);
  //     // return res.status(200).json({ postResponse });
  //   } catch (e) {
  //     const response: RequestResponse = {
  //       status_code: 422,
  //       error: true,
  //       message: e.message,
  //     };
  //     return res.status(422).json(response);
  //   }
  // }

}
