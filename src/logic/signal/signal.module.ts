import { Module } from '@nestjs/common'
import { SignalController } from './signal.controller'

@Module({
    controllers: [SignalController],
})
export class SignalModule {}
