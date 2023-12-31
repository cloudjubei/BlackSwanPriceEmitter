import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody
  } from '@nestjs/websockets'
import { COMMON_GATEWAY } from '../websockets.gateway'
import { IndicatorsService } from 'logic/indicators/inidicators.service'
import TokenIndicatorsModel from 'commons/models/indicators/TokenIndicatorsModel.dto'
  
export const INDICATORS_PREFIX ='indicators_'
export const MESSAGE_GET_LATEST = INDICATORS_PREFIX + 'latest'
export const MESSAGE_GET_LATEST_INTERVAL = INDICATORS_PREFIX + 'latestInterval'

@WebSocketGateway(COMMON_GATEWAY)
export class WSIndicatorsGateway
{
    constructor(
        private readonly indicatorsService: IndicatorsService
    ) {}

    @SubscribeMessage(MESSAGE_GET_LATEST)
    async getLatest(@MessageBody() tokenPair: string) : Promise<TokenIndicatorsModel | undefined>
    {
        // console.log(`MESSAGE_GET_LATEST INDICATORS: ${tokenPair}`)

        return await this.indicatorsService.getLatest(tokenPair)
    }
    
    @SubscribeMessage(MESSAGE_GET_LATEST_INTERVAL)
    async getLatestInterval(@MessageBody() message: string) : Promise<TokenIndicatorsModel | undefined>
    {
        // console.log(`MESSAGE_GET_LATEST_INTERVAL: ${message}`)
        const { tokenPair, interval } = JSON.parse(message)

        return await this.indicatorsService.getLatest(tokenPair, interval)
    }
}