import { Module } from '@nestjs/common'
import { IndicatorsService } from './inidicators.service'
import { IndicatorsController } from './indicators.controller'
import { IndicatorsCoreModule } from './core/indicators-core.module'

@Module({
    imports: [
        IndicatorsCoreModule
    ],
    controllers: [IndicatorsController],
    providers: [IndicatorsService],
    exports: [IndicatorsService],
})
export class IndicatorsModule {}
