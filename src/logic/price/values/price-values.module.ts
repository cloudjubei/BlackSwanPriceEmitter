import { Module } from '@nestjs/common'
import { PriceValuesService } from './price-values.service'
import { PriceValuesController } from './price-values.controller'
import { PriceCoreModule } from '../core/price-core.module'
import { IndicatorsModule } from 'logic/indicators/indicators.module'

@Module({
    imports: [
        IndicatorsModule,
        PriceCoreModule,
    ],
    controllers: [PriceValuesController],
    providers: [PriceValuesService],
    exports: [PriceValuesService],
})
export class PriceValuesModule {}