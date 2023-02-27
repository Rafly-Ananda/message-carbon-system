import { Body, Controller, Get, Inject, Post, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { RequestResponse } from "src/interfaces/response.interface";
import { BusinessChatAnalyticsNewCustomerService } from "src/services/maria/owner-insight-analytics/business-chat-analytics-new-customer.service";
import * as moment from "moment";

@Controller()
export class BusinessChatAnalyticsNewCustomerController {
  constructor(private businessChatAnalyticsNewCustomerService: BusinessChatAnalyticsNewCustomerService) {}

  @Get()
  async getAllData(@Req() req: Request, @Res() res: Response): Promise<void> {
    const result = await this.businessChatAnalyticsNewCustomerService.findAll();
    res.status(200).json(result);
  }
}
