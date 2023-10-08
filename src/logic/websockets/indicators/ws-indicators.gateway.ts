import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody
  } from '@nestjs/websockets'
import { COMMON_GATEWAY } from '../websockets.gateway'
import { IndicatorsService } from 'src/logic/indicators/inidicators.service'
import TokenIndicatorsModel from 'src/models/indicators/TokenIndicatorsModel.dto'
  
export const INDICATORS_PREFIX ='indicators_'
export const MESSAGE_GET_LATEST = INDICATORS_PREFIX + 'latest'

@WebSocketGateway(COMMON_GATEWAY)
export class WSIndicatorsGateway
{
    constructor(
        private readonly indicatorsService: IndicatorsService
    ) {}

    @SubscribeMessage(MESSAGE_GET_LATEST)
    async getLatest(@MessageBody() tokenPair: string) : Promise<TokenIndicatorsModel | undefined>
    {
        console.log(`MESSAGE_GET_LATEST INDICATORS: ${tokenPair}`)

        return await this.indicatorsService.getLatest(tokenPair)
    }
}