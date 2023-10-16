import { Controller, Get, Param } from '@nestjs/common'
import { ApiTags } from "@nestjs/swagger"
import { IndicatorsService } from './inidicators.service'
import TokenIndicatorsModel from 'commons/models/indicators/TokenIndicatorsModel.dto'

@ApiTags("indicators")
@Controller("indicators")
export class IndicatorsController
{
    constructor(private readonly indicatorsService: IndicatorsService) {}

    @Get('latest/:tokenPair')
    async getLatest(@Param('tokenPair') tokenPair: string) : Promise<TokenIndicatorsModel>
    {
        return await this.indicatorsService.getLatest(tokenPair, '1s')
    }

    @Get('latest/:tokenPair/:interval')
    async getLatestInterval(@Param('tokenPair') tokenPair: string, @Param('interval') interval: string) : Promise<TokenIndicatorsModel>
    {
        return await this.indicatorsService.getLatest(tokenPair, interval)
    }

    // @Get('timeframe/:tokenPair/:startDate/:endDate')
    // async getTimeframe(@Param('tokenPair') tokenPair: string, @Param('startDate') startDate: Date, @Param('endDate') endDate: Date, @Query('interval') interval: string = '1s') : Promise<PriceKlineModel[]>
    // {
    //     return await this.priceCoreService.getTimeframe(tokenPair, startDate, endDate, interval)
    // }
}