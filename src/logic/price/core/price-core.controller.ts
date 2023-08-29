import { Controller, Get, Param, Req, UseGuards, Post, Body, Query } from '@nestjs/common'
import { ApiQuery, ApiTags } from "@nestjs/swagger"
import { PriceCoreService } from './price-core.service'
import PriceKlineModel from 'src/models/price/PriceKlineModel.dto'
import TokenPriceTimeModel from 'src/models/price/TokenPriceTimeModel.dto'

@ApiTags("price")
@Controller("price")
export class PriceCoreController
{
    constructor(private readonly priceCoreService: PriceCoreService) {}

    @Get('latest/:tokenPair')
    async getLatest(@Param('tokenPair') tokenPair: string) : Promise<TokenPriceTimeModel>
    {
        return await this.priceCoreService.getLatest(tokenPair)
    }

    @Get('latestPrice/:tokenPair')
    async getLatestPrice(@Param('tokenPair') tokenPair: string) : Promise<string>
    {
        return await this.priceCoreService.getLatestPrice(tokenPair)
    }

    @Get('latestTime/:tokenPair')
    async getLatestTime(@Param('tokenPair') tokenPair: string) : Promise<number>
    {
        return await this.priceCoreService.getLatestTime(tokenPair)
    }

    @Get('timeframe/:tokenPair/:startDate/:endDate')
    async getTimeframe(@Param('tokenPair') tokenPair: string, @Param('startDate') startDate: Date, @Param('endDate') endDate: Date, @Query('interval') interval: string = '1s') : Promise<PriceKlineModel[]>
    {
        return await this.priceCoreService.getTimeframe(tokenPair, startDate, endDate, interval)
    }
}