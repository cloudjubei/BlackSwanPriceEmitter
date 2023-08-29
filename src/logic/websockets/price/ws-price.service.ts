import { Injectable } from '@nestjs/common'
import { WebsocketsService } from '../common/ws-common.service'

@Injectable()
export class WSPriceService
{
    constructor(private readonly websocketsService: WebsocketsService){}

    async sendUpdate(tokenPair: string, priceAmount: string)
    {
        console.log(`WS PRICE of ${tokenPair} : ${priceAmount}`)
        this.websocketsService.sendMessage(tokenPair, priceAmount)
    }
}