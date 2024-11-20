import { Module } from '@nestjs/common'
import { PriceService } from './price.service'
import { WSPriceModule } from '../websockets/price/ws-price.module'
import { PriceCoreModule } from './core/price-core.module'
import { IdentityModule } from '../identity/identity.module'
import { PriceMineBinanceService } from './mines/price-mine-binance.service'
import { IndicatorsModule } from '../indicators/indicators.module'
import { WSIndicatorsModule } from '../websockets/indicators/ws-indicators.module'
import { PriceValuesModule } from './values/price-values.module'
import { WSValuesModule } from 'logic/websockets/values/ws-values.module'

@Module({
    imports: [
        IdentityModule,
        PriceCoreModule,
        IndicatorsModule,
        PriceValuesModule,

        WSPriceModule,
        WSIndicatorsModule,
        WSValuesModule,
    ],
    providers: [PriceService, PriceMineBinanceService],
    exports: [PriceService],
})
export class PriceModule {}
