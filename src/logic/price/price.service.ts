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

        this.priceCoreService.setupCache(this.identityService.config.tokens, this.identityService.config.intervals, 201)
        this.indicatorsService.setupCache(this.identityService.config.tokens, this.identityService.config.intervals, 201)

        for(const tokenPair of this.identityService.config.tokens){
            for(const interval of this.identityService.config.intervals){
                const klines = await this.mineService.getMostRecentKlines(tokenPair, interval, 200)
                this.priceCoreService.setupCacheValues(tokenPair, interval, klines)
                this.indicatorsService.storeInCache(tokenPair, interval, klines)
            }
        }

        this.hasSetup = true

        console.log(`PriceService done`)
    }

    @Cron(CronExpression.EVERY_SECOND)
    async update()
    {
        if (!this.hasSetup) { return }

        for(const tokenPair of this.identityService.config.tokens){
            for(const interval of this.identityService.config.intervals){
                await this.updateKline(tokenPair, interval)
            }
        }
    }

    private async updateKline(tokenPair: string, interval: string)
    {
        const klines = await this.mineService.getMostRecentKlines(tokenPair, interval, 1)
        const kline = klines[0]
        this.priceCoreService.storeInCache(kline)
        if (interval === '1s') {
            await this.wsPriceService.sendUpdate(tokenPair, kline.price)
        }
        await this.wsPriceService.sendKlineUpdate(tokenPair, interval, kline)

        this.indicatorsService.storeInCache(tokenPair, interval, this.priceCoreService.getAll(tokenPair, interval))
        if (interval === '1s') {
            await this.wsIndicatorsService.sendUpdate(tokenPair, this.indicatorsService.getLatest(tokenPair, interval))
        }
        await this.wsIndicatorsService.sendIntervalUpdate(tokenPair, interval, this.indicatorsService.getLatest(tokenPair, interval))
    }
}
