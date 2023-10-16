import { Injectable } from '@nestjs/common'
import PriceKlineCache from 'commons/models/cache/PriceKlineCache'
import PriceKlineModel from 'commons/models/price/PriceKlineModel.dto'
import PriceModel from 'commons/models/price/PriceModel.dto'

@Injectable()
export class PriceCoreService
{
    private cache = new PriceKlineCache()

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
    getLatestPrice(tokenPair: string) : PriceModel
    {
        const kline = this.getLatest(tokenPair, '1s')
        return new PriceModel(kline.tokenPair, kline.interval, kline.price, kline.timestamp)
    }
}
