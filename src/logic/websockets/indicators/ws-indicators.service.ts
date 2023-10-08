import { Injectable } from '@nestjs/common'
import { WebsocketsService } from '../common/ws-common.service'
import TokenIndicatorsModel from 'src/models/indicators/TokenIndicatorsModel.dto'

@Injectable()
export class WSIndicatorsService
{
    constructor(private readonly websocketsService: WebsocketsService){}

    async sendUpdate(tokenPair: string, indicators: TokenIndicatorsModel)
    {
        // console.log(`WS INDICATORS of ${tokenPair} : ${JSON.stringify(indicators)}`)
        this.websocketsService.sendMessage('indicators-' + tokenPair, indicators)
    }
    async sendIntervalUpdate(tokenPair: string, interval: string, indicators: TokenIndicatorsModel)
    {
        // console.log(`WS INDICATORS of ${tokenPair} : ${JSON.stringify(indicators)}`)
        this.websocketsService.sendMessage('indicators-' + tokenPair + '-' + interval, indicators)
    }
}