import { Injectable } from '@nestjs/common'
import TokenPriceTimeModel from 'src/models/price/TokenPriceTimeModel.dto'

@Injectable()
export class PriceCoreService
{
    private cache : { [key:string] : TokenPriceTimeModel[] } = {}
    private cacheSize = 200

    setupCache(tokens: string[])
    {
        for(const token of tokens){
            this.cache[token] = []
        }
    }

    storeInCache(tokenPriceTime: TokenPriceTimeModel)
    {
        this.cache[tokenPriceTime.tokenPair] = [tokenPriceTime, ...this.cache[tokenPriceTime.tokenPair]]
        if (this.cache[tokenPriceTime.tokenPair].length > this.cacheSize){
            this.cache[tokenPriceTime.tokenPair].pop()
        }
    }

    getAll(tokenPair: string) : TokenPriceTimeModel[]
    {
        return this.cache[tokenPair] ?? []
    }

    getLatest(tokenPair: string) : TokenPriceTimeModel
    {
        const prices = this.cache[tokenPair]
        if (prices.length > 0){
            return prices[0]
        }
        return new TokenPriceTimeModel(tokenPair, '0', Date.now())
    }
}
