import { Body, Controller, Get, Inject, Post, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";

@Controller()
export class MariaMainController {
  constructor() {}

  @Get()
  async getHelloMaria(@Req() req: Request, @Res() res: Response): Promise<void> {
    res.status(200).json("Maria Index Route");
  }
}
