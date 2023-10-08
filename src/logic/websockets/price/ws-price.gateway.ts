import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody
  } from '@nestjs/websockets'
import { COMMON_GATEWAY } from '../websockets.gateway'
import { PriceCoreService } from 'src/logic/price/core/price-core.service'
import TokenPriceTimeModel from 'src/models/price/TokenPriceTimeModel.dto'
import PriceKlineModel from 'src/models/price/PriceKlineModel.dto'
  
export const PRICE_PREFIX ='price_'
export const MESSAGE_GET_LATEST = PRICE_PREFIX + 'latest'
export const MESSAGE_GET_LATEST_PRICE = PRICE_PREFIX + 'latestPrice'
export const MESSAGE_GET_LATEST_TIME = PRICE_PREFIX + 'latestTime'
export const MESSAGE_GET_TIMEFRAME = PRICE_PREFIX + 'timeframe'

@WebSocketGateway(COMMON_GATEWAY)
export class WSPriceGateway
{
    constructor(
        private readonly priceCoreService: PriceCoreService
    ) {}

    @SubscribeMessage(MESSAGE_GET_LATEST)
    async getLatest(@MessageBody() tokenPair: string) : Promise<TokenPriceTimeModel | undefined>
    {
        console.log(`MESSAGE_GET_LATEST: ${tokenPair}`)

        return await this.priceCoreService.getLatest(tokenPair)
    }
}