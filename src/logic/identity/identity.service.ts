import { Injectable } from '@nestjs/common'
import { getFile } from 'src/lib/storageUtils'
import ConfigModel from 'src/models/ConfigModel.dto'

@Injectable()
export class IdentityService
{
    config : ConfigModel

    constructor()
    {
        const configFile = getFile('config.json')
        this.config = JSON.parse(configFile) as ConfigModel
    }

    getConfig() : ConfigModel
    {
        return this.config
    }

    getType() : string
    {
        return this.config.type
    }

    getTokens() : string[]
    {
        return this.config.tokens
    }

    getIntervals() : string[]
    {
        return this.config.intervals
    }
}
