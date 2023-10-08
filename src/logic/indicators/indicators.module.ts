import { Module } from '@nestjs/common'
import { IndicatorsService } from './inidicators.service'
import { IndicatorsController } from './indicators.controller'

@Module({
    controllers: [IndicatorsController],
    providers: [IndicatorsService],
    exports: [IndicatorsService],
})
export class IndicatorsModule {}
