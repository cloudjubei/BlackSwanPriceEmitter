import { Injectable } from '@nestjs/common'
import PriceKlineWithIndicatorsModel from 'commons/models/price/PriceKlineWithIndicatorsModel.dto'
import { PriceCoreService } from '../core/price-core.service'
import { IndicatorsService } from 'logic/indicators/inidicators.service'

@Injectable()
export class PriceValuesService
{
    constructor(
        private readonly indicatorsService: IndicatorsService,
        private readonly priceCoreService: PriceCoreService,
    ){}

    hasSetup = false

    onApplicationBootstrap()
    {
        this.setup()
    }

    private async setup()
    {
        if (this.hasSetup) { return }

        this.hasSetup = true

        console.log(`PriceValuesService done`)
    }

    getFull(tokenPair: string, interval: string, lookback_window: number) : PriceKlineWithIndicatorsModel[]
    {
        if (!this.hasSetup) { return [] }

        const prices = [...this.priceCoreService.getAll(tokenPair, interval).slice(0, lookback_window)]
        const indicators = [...this.indicatorsService.getAll(tokenPair, interval).slice(0, lookback_window)]

        const out = []

        for(let i=0; i<lookback_window; i++) {
            const price = prices[i]
            const indicator = indicators[i]
            const o = {
                ...price,
                indicators: indicator.indicators
            } as PriceKlineWithIndicatorsModel
            out.push(o)
        }
        return out
    }
}
