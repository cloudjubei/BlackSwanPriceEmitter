import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody
  } from '@nestjs/websockets'
import { COMMON_GATEWAY } from '../websockets.gateway'
import { PriceValuesService } from 'logic/price/values/price-values.service'
import PriceKlineWithIndicatorsModel from 'commons/models/price/PriceKlineWithIndicatorsModel.dto'
  
export const VALUES_PREFIX ='values_'
export const MESSAGE_GET_FULL = VALUES_PREFIX + 'full'

@WebSocketGateway(COMMON_GATEWAY)
export class WSValuesGateway
{
    constructor(
        private readonly priceValuesService: PriceValuesService
    ) {}

    @SubscribeMessage(MESSAGE_GET_FULL)
    async getFull(@MessageBody() message: string) : Promise<PriceKlineWithIndicatorsModel[][] | undefined>
    {
        // console.log(`MESSAGE_GET_FULL: ${message}`)
        const { tokenPair, layers, lookback_window } = JSON.parse(message)

        const out = []
        for(const layer of layers){
            const o = this.priceValuesService.getFull(tokenPair, layer, lookback_window)
            out.push(o) 
        }
        return out
    }
}