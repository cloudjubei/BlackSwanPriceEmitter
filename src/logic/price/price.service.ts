import { Injectable, OnApplicationBootstrap } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PriceCoreService } from './core/price-core.service'
import { WSPriceService } from '../websockets/price/ws-price.service'
import { IdentityService } from '../identity/identity.service'
import { PriceMineBinanceService } from './mines/price-mine-binance.service'
import { IndicatorsService } from '../indicators/inidicators.service'
import { WSIndicatorsService } from '../websockets/indicators/ws-indicators.service'

@Injectable()
export class PriceService implements OnApplicationBootstrap
{
    constructor(
        private readonly identityService: IdentityService,
        private readonly priceCoreService: PriceCoreService,
        private readonly indicatorsService: IndicatorsService,
        private readonly wsPriceService: WSPriceService,
        private readonly wsIndicatorsService: WSIndicatorsService,

        private readonly mineService: PriceMineBinanceService,
    ){}
    
    hasSetup = false

    onApplicationBootstrap()
    {
        this.setup()
    }

    private async setup()
    {
        if (this.hasSetup) { return }

        console.log(`PriceService setup ${Date.now()}`)

        this.priceCoreService.setupCache(this.identityService.getTokens())
        this.indicatorsService.setupCache(this.identityService.getTokens())

        this.hasSetup = true

        console.log(`PriceService done`)
    }

    @Cron(CronExpression.EVERY_SECOND)
    async update()
    {
        if (!this.hasSetup) { return }

        const tokens = this.identityService.getTokens()
        for(const tokenPair of tokens){
            const tokenPriceTime = await this.mineService.getPrice(tokenPair)
            this.priceCoreService.storeInCache(tokenPriceTime)

            await this.wsPriceService.sendUpdate(tokenPriceTime.tokenPair, tokenPriceTime.price)

            this.indicatorsService.storeInCache(tokenPair, this.priceCoreService.getAll(tokenPair))

            await this.wsIndicatorsService.sendUpdate(tokenPriceTime.tokenPair, this.indicatorsService.getLatest(tokenPair))
        }
    }
}
