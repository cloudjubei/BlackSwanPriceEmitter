import { Module } from '@nestjs/common'
import { WSCommonModule } from '../common/ws-common.module'
import { WSValuesGateway } from './ws-values.gateway'
import { PriceValuesModule } from 'logic/price/values/price-values.module'

@Module({
    imports: [WSCommonModule, PriceValuesModule],
    providers: [
        WSValuesGateway, 
        // WSValuesService
    ],
    // exports: [WSValuesService]
})
export class WSValuesModule {}