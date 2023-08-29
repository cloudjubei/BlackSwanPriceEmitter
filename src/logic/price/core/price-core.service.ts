import { Injectable } from '@nestjs/common'
import PriceKlineModel from 'src/models/price/PriceKlineModel.dto'
import TokenPriceTimeModel from 'src/models/price/TokenPriceTimeModel.dto'

@Injectable()
export class PriceCoreService
{
    private cache : { [key:string] : TokenPriceTimeModel } = {}

    setupCache(tokens: string[])
    {
        for(const token of tokens){
            this.cache[token] = new TokenPriceTimeModel(token, '0', 0)
        }
    }

    storeInCache(tokenPriceTime: TokenPriceTimeModel)
    {
        this.cache[tokenPriceTime.tokenPair] = tokenPriceTime
    }

    getLatest(tokenPair: string) : TokenPriceTimeModel | undefined
    {
        return this.cache[tokenPair]
    }

    getLatestPrice(tokenPair: string) : string | undefined
    {
        return this.cache[tokenPair]?.price
    }

    getLatestTime(tokenPair: string) : number | undefined
    {
        return this.cache[tokenPair]?.timestamp
    }

    //TODO:
    getTimeframe(tokenPair: string, startDate: Date, endDate: Date, interval: string = '1s') : PriceKlineModel[]
    {
        return []
    }
}
