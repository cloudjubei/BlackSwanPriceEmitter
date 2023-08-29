import { Controller, Get } from '@nestjs/common'
import { ApiTags } from "@nestjs/swagger"
import { IdentityService } from './identity.service'
import ConfigModel from 'src/models/ConfigModel.dto'

@ApiTags("identity")
@Controller("identity")
export class IdentityController
{
    constructor(private readonly identityService: IdentityService) {}

    @Get('config')
    async getConfig() : Promise<ConfigModel>
    {
        return await this.identityService.getConfig()
    }
    
    @Get('type')
    async getType() : Promise<string>
    {
        return await this.identityService.getType()
    }

    @Get('tokens')
    async getTokens() : Promise<string[]>
    {
        return await this.identityService.getTokens()
    }

    @Get('intervals')
    async getIntervals() : Promise<string[]>
    {
        return await this.identityService.getIntervals()
    }
}