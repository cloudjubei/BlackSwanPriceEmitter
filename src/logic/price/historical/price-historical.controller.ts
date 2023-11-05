import { Controller, Get, Param } from '@nestjs/common'
import { ApiTags } from "@nestjs/swagger"
import { PriceHistoricalService } from './price-historical.service'
import PriceKlineWithIndicatorsModel from 'commons/models/price/PriceKlineWithIndicatorsModel.dto'

@ApiTags("price")
@Controller("historical")
export class PriceHistoricalController
{
    constructor(private readonly priceHistoricalService: PriceHistoricalService) {}

    @Get('priceWithIndicators/:tokenPair/:interval/:year/:month')
    async getPriceWithIndicators(@Param('tokenPair') tokenPair, @Param('interval') interval: string, @Param('year') year: number, @Param('month') month: number) : Promise<PriceKlineWithIndicatorsModel[]>
    {
        return await this.priceHistoricalService.getPricesWithIndicators(tokenPair, interval, year, month)
    }
}