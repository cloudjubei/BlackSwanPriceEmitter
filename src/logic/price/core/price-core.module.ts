import { Module } from '@nestjs/common'
import { PriceCoreService } from './price-core.service'
import { PriceCoreController } from './price-core.controller'

@Module({
    controllers: [PriceCoreController],
    providers: [PriceCoreService],
    exports: [PriceCoreService],
})
export class PriceCoreModule {}
