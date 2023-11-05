import { Module } from '@nestjs/common'
import { IndicatorsCoreService } from './inidicators-core.service'

@Module({
    providers: [IndicatorsCoreService],
    exports: [IndicatorsCoreService],
})
export class IndicatorsCoreModule {}
