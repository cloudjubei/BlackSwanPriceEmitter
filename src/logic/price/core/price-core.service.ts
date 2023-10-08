import { Injectable } from '@nestjs/common'
import PriceKlineModel from 'src/models/price/PriceKlineModel.dto'
import TokenPriceTimeModel from 'src/models/price/TokenPriceTimeModel.dto'

@Injectable()
export class PriceCoreService
{
    private cache : { [key:string] : { [interval:string] : PriceKlineModel[] }} = {}
    private cacheSize = 1000

    setupCache(tokens: string[], intervals: string[], cacheSize: number)
    {
        this.cacheSize = cacheSize
        for(const token of tokens){
            this.cache[token] = {}
            for(const interval of intervals){
                this.cache[token][interval] = []
            }
        }
    }
    setupCacheValues(token: string, interval: string, klines: PriceKlineModel[])
    {
        this.cache[token][interval] = klines.reverse()
    }

    storeInCache(kline: PriceKlineModel)
    {
        const latest = this.getLatest(kline.tokenPair, kline.interval)
        if (latest.timestamp_open < kline.timestamp_open){
            this.cache[kline.tokenPair][kline.interval] = [kline, ...this.cache[kline.tokenPair][kline.interval]]
            if (this.cache[kline.tokenPair][kline.interval].length > this.cacheSize){
                this.cache[kline.tokenPair][kline.interval].pop()
            }
        }else{
            this.cache[kline.tokenPair][kline.interval][0] = kline
        }
    }

    getAll(tokenPair: string, interval: string) : PriceKlineModel[]
    {
        return this.cache[tokenPair][interval] ?? []
    }

    getLatest(tokenPair: string, interval: string) : PriceKlineModel
    {
        const klines = this.cache[tokenPair][interval]
        if (klines.length > 0){
            return klines[0]
        }
        return new PriceKlineModel(tokenPair, interval)
    }
    getLatestPrice(tokenPair: string) : TokenPriceTimeModel
    {
        const kline = this.getLatest(tokenPair, '1s')
        return new TokenPriceTimeModel(kline.tokenPair, kline.price_close, parseInt(kline.timestamp_close) ?? 0)
    }
}
