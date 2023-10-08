import {
    WebSocketGateway,
    SubscribeMessage
  } from '@nestjs/websockets'
import { COMMON_GATEWAY } from '../websockets.gateway'
import { IdentityService } from 'src/logic/identity/identity.service'
import ConfigModel from 'src/models/ConfigModel.dto'
  
export const IDENTITY_PREFIX ='identity_'
export const MESSAGE_GET_CONFIG = IDENTITY_PREFIX + 'config'
export const MESSAGE_GET_TYPE = IDENTITY_PREFIX + 'type'
export const MESSAGE_GET_TOKENS = IDENTITY_PREFIX + 'tokens'
export const MESSAGE_GET_INTERVALS = IDENTITY_PREFIX + 'intervals'


@WebSocketGateway(COMMON_GATEWAY)
export class WSIdentityGateway
{
    constructor(
        private readonly identityService: IdentityService
    ) {}

    @SubscribeMessage(MESSAGE_GET_CONFIG)
    async getConfig() : Promise<ConfigModel>
    {
        console.log(`MESSAGE_GET_CONFIG`)

        return await this.identityService.config
    }
    
    @SubscribeMessage(MESSAGE_GET_TYPE)
    async getType() : Promise<string>
    {
        console.log(`MESSAGE_GET_TYPE`)

        return await this.identityService.config.type
    }

    @SubscribeMessage(MESSAGE_GET_TOKENS)
    async getTokens() : Promise<string[]>
    {
        console.log(`MESSAGE_GET_TOKENS`)

        return await this.identityService.config.tokens
    }

    @SubscribeMessage(MESSAGE_GET_INTERVALS)
    async getIntervals() : Promise<string[]>
    {
        console.log(`MESSAGE_GET_INTERVALS`)

        return await this.identityService.config.intervals
    }
}