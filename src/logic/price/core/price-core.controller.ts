import { Controller, Get, Param } from '@nestjs/common'
import { ApiTags } from "@nestjs/swagger"
import { PriceCoreService } from './price-core.service'
import PriceKlineModel from 'commons/models/price/PriceKlineModel.dto'
import PriceModel from 'commons/models/price/PriceModel.dto'

@ApiTags("price")
@Controller("price")
export class PriceCoreController
{
    constructor(private readonly priceCoreService: PriceCoreService) {}

    @Get('latest/:tokenPair')
    async getLatest(@Param('tokenPair') tokenPair: string) : Promise<PriceModel>
    {
        return await this.priceCoreService.getLatestPrice(tokenPair)
    }

    @Get('latestKline/:tokenPair/:interval')
    async getLatestKline(@Param('tokenPair') tokenPair: string, @Param('interval') interval: string) : Promise<PriceKlineModel>
    {
        return await this.priceCoreService.getLatest(tokenPair, interval)
    }
}