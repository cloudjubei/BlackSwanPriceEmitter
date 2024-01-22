import { Injectable } from "@nestjs/common"
import IndicatorsCache from "commons/models/cache/IndicatorsCache"
import TokenIndicatorsModel from "commons/models/indicators/TokenIndicatorsModel.dto"
import PriceKlineModel from "commons/models/price/PriceKlineModel.dto"
import { IndicatorsCoreService } from "./core/inidicators-core.service"

@Injectable()
export class IndicatorsService
{
    constructor(
        private readonly indicatorsCoreService: IndicatorsCoreService
    ){}

    private cache = new IndicatorsCache()

    setupCache(tokens: string[], intervals: string[], cacheSize: number)
    {
        this.cache.setup(tokens, intervals, cacheSize)
    }

    storeInCache(tokenPair: string, interval: string, allKlines: PriceKlineModel[])
    {
        const timestamp = allKlines[0].timestamp
        const prices = allKlines.map(p => parseFloat(p.price)).reverse()
        const pricesHigh = allKlines.map(p => parseFloat(p.price_high)).reverse()
        const pricesLow = allKlines.map(p => parseFloat(p.price_low)).reverse()
        const indicators = this.indicatorsCoreService.processPrice(tokenPair, interval, timestamp, prices, pricesHigh, pricesLow, this.getAll(tokenPair, interval).reverse())

        this.cache.storeIndicators(indicators)
    }

    getAll(tokenPair: string, interval: string) : TokenIndicatorsModel[]
    {
        return this.cache.getAll(tokenPair, interval)
    }

    getLatest(tokenPair: string, interval: string = '1s') : TokenIndicatorsModel
    {
        return this.cache.getLatest(tokenPair, interval)
    }
}