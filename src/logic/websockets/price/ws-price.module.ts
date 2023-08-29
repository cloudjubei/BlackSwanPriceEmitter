import { Module } from '@nestjs/common'
import { WSCommonModule } from '../common/ws-common.module'
import { WSPriceService } from './ws-price.service'
import { PriceCoreModule } from 'src/logic/price/core/price-core.module'
import { WSPriceGateway } from './ws-price.gateway'

@Module({
    imports: [WSCommonModule, PriceCoreModule],
    providers: [
        WSPriceGateway, 
        WSPriceService],
    exports: [WSPriceService]
})
export class WSPriceModule {}