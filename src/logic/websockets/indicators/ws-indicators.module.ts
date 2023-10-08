import { Module } from '@nestjs/common'
import { WSCommonModule } from '../common/ws-common.module'
import { WSIndicatorsGateway } from './ws-indicators.gateway'
import { IndicatorsModule } from 'src/logic/indicators/indicators.module'
import { WSIndicatorsService } from './ws-indicators.service'

@Module({
    imports: [WSCommonModule, IndicatorsModule],
    providers: [
        WSIndicatorsGateway, 
        WSIndicatorsService],
    exports: [WSIndicatorsService]
})
export class WSIndicatorsModule {}