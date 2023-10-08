import { Injectable } from '@nestjs/common'
import PriceKlineModel from 'src/models/price/PriceKlineModel.dto'
import TokenPriceTimeModel from 'src/models/price/TokenPriceTimeModel.dto'

@Injectable()
export class PriceCoreService
{
    private cache : { [key:string] : { [interval:string] : PriceKlineModel[] }} = {}
    private cacheSize = 201

    setupCache(tokens: string[], intervals: string[])
    {
        for(const token of tokens){
            this.cache[token] = {}
            for(const interval of intervals){
                this.cache[token][interval] = []
            }
        }
    }

    storeInCache(kline: PriceKlineModel)
    {
        this.cache[kline.tokenPair][kline.interval] = [kline, ...this.cache[kline.tokenPair][kline.interval]]
        if (this.cache[kline.tokenPair][kline.interval].length > this.cacheSize){
            this.cache[kline.tokenPair][kline.interval].pop()
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
