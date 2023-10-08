import { Injectable } from '@nestjs/common'
import { WebsocketsService } from '../common/ws-common.service'
import PriceKlineModel from 'src/models/price/PriceKlineModel.dto'

@Injectable()
export class WSPriceService
{
    constructor(private readonly websocketsService: WebsocketsService){}

    async sendUpdate(tokenPair: string, priceAmount: string)
    {
        console.log(`WS PRICE of ${tokenPair} : ${priceAmount}`)
        this.websocketsService.sendMessage(tokenPair, priceAmount)
    }
    async sendKlineUpdate(tokenPair: string, interval: string, kline: PriceKlineModel)
    {
        // console.log(`WS KLINE of ${tokenPair} for ${interval} : ${JSON.stringify(kline)}`)
        this.websocketsService.sendMessage(tokenPair + '-' + interval, kline)
    }
}