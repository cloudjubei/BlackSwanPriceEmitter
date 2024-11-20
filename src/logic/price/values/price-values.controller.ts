import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiTags } from "@nestjs/swagger"
import { PriceValuesService } from './price-values.service'
import PriceKlineWithIndicatorsModel from 'commons/models/price/PriceKlineWithIndicatorsModel.dto'

@ApiTags("values")
@Controller("values")
export class PriceValuesController
{
    constructor(private readonly priceValuesService: PriceValuesService) {}

    @Get('full/:tokenPair')
    async getFull( @Param('tokenPair') tokenPair: string, @Query('layers') layers: string[], @Query('lookback_window') lookback_window: number) : Promise<PriceKlineWithIndicatorsModel[][]>
    {
        const out = []
        for(const layer of layers){
            const o = this.priceValuesService.getFull(tokenPair, layer, lookback_window)
            out.push(o) 
        }
        return out
    }
}