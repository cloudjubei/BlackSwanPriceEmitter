import { Module } from '@nestjs/common'
import { PriceService } from './price.service'
import { WSPriceModule } from '../websockets/price/ws-price.module'
import { PriceCoreModule } from './core/price-core.module'
import { IdentityModule } from '../identity/identity.module'
import { PriceMineBinanceService } from './mines/price-mine-binance.service'

@Module({
    imports: [
        IdentityModule,
        PriceCoreModule,

        WSPriceModule
    ],
    providers: [PriceService, PriceMineBinanceService],
    exports: [PriceService],
})
export class PriceModule {}
