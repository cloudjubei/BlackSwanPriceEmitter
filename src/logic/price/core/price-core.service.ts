import { Injectable } from '@nestjs/common'
import { PriceCache } from 'src/models/cache/PriceCache'
import PriceKlineModel from 'src/models/price/PriceKlineModel.dto'
import TokenPriceTimeModel from 'src/models/price/TokenPriceTimeModel.dto'

@Injectable()
export class PriceCoreService
{
    private cache = new PriceCache()

    setupCache(tokens: string[], intervals: string[], cacheSize: number)
    {
        this.cache.setup(tokens, intervals, cacheSize)
    }
    setupCacheValues(token: string, interval: string, klines: PriceKlineModel[])
    {
        this.cache.setupValues(token, interval, klines)
    }

    storeInCache(kline: PriceKlineModel)
    {
        this.cache.storeKline(kline)
    }

    getAll(tokenPair: string, interval: string) : PriceKlineModel[]
    {
        return this.cache.getAll(tokenPair, interval)
    }

    getLatest(tokenPair: string, interval: string) : PriceKlineModel
    {
        return this.cache.getLatest(tokenPair, interval)
    }
    getLatestPrice(tokenPair: string) : TokenPriceTimeModel
    {
        const kline = this.getLatest(tokenPair, '1s')
        return new TokenPriceTimeModel(kline.tokenPair, kline.price_close, kline.timestamp_open)
    }
}
