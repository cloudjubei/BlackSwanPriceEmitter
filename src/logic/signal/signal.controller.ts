import { Controller, Get, Param, Req, UseGuards, Post, Body, Query } from '@nestjs/common'
import { ApiQuery, ApiTags } from "@nestjs/swagger"
import SignalModel from 'src/models/price/SignalModel.dto'

@ApiTags("signal")
@Controller("signal")
export class SignalController
{
    constructor() {}

    @Get('latest/:tokenPair')
    async getLatest(@Param('tokenPair') tokenPair: string) : Promise<SignalModel>
    {
        return new SignalModel(tokenPair, 0, Date.now())
    }

    @Get('latestAction/:tokenPair')
    async getLatestAction(@Param('tokenPair') tokenPair: string) : Promise<number>
    {
        return 0
    }
}