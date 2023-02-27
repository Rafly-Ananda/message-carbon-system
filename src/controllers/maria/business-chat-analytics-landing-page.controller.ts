import { Body, Controller, Get, Inject, Post, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { RequestResponse } from "src/interfaces/response.interface";
import { BusinessChatAnalyticsLandingPageService } from "src/services/maria/owner-insight-analytics/business-chat-analytics-landing-page.service";
import * as moment from "moment";
import * as ua_parser from 'ua-parser-js';

@Controller()
export class BusinessChatAnalyticsLandingPageController {
  constructor(private businessChatAnalyticsLandingPageService: BusinessChatAnalyticsLandingPageService) {}

  @Get()
  async getAllData(@Req() req: Request, @Res() res: Response): Promise<any> {
    try {
      const result = await this.businessChatAnalyticsLandingPageService.findAll();
      const response: RequestResponse = {
        status_code: 200,
        error: false,
        result,
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

  @Post()
  async saveData(@Req() req: Request, @Res() res: Response): Promise<any> {
    const currDate = moment.utc().format('YYYY-MM-DD hh:mm:ss')
    const parser = ua_parser(req.headers['user-agent']);
    try {
      const payload = {
        session: req.body.session,
        ip_address: req.headers['x-forwarded-for'] as string,
        url: req.body.url,
        business_jabberid: req.body.business_jabberid,
        business_unique_id: req.body.unique_id,
        OS: parser.os.name,
        browser_agent: parser.browser.name,
        created_at: currDate,
        user_agent: parser.ua,
        device: parser.device.type ? parser.device.type : 'desktop',
        device_name: '-'
      }

      await this.businessChatAnalyticsLandingPageService.saveRecord(payload)
    } catch (e) {
      const response: RequestResponse = {
        status_code: 422,
        error: true,
        message: e.message,
      };
      return res.status(422).json(response);
    }
  }
}