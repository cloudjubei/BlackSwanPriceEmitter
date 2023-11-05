import { Module } from '@nestjs/common'
import { PriceHistoricalService } from './price-historical.service'
import { PriceHistoricalController } from './price-historical.controller'
import { IndicatorsCoreModule } from 'logic/indicators/core/indicators-core.module'
import { PriceMineBinanceService } from '../mines/price-mine-binance.service'

@Module({
    imports: [
        IndicatorsCoreModule,
    ],
    controllers: [PriceHistoricalController],
    providers: [PriceHistoricalService, PriceMineBinanceService],
    exports: [PriceHistoricalService],
})
export class PriceHistoricalModule {}