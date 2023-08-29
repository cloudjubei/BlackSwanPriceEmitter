import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MissingModelsController } from './models/missingModels.controller'
import { ScheduleModule } from '@nestjs/schedule'
import { AppController } from './app.controller'
import { PriceModule } from './logic/price/price.module'
import { WebsocketsModule } from './logic/websockets/websockets.module'
import { IdentityModule } from './logic/identity/identity.module'

@Module({
    imports: [
        ConfigModule.forRoot({ envFilePath: ".env.local", isGlobal: true }),

        WebsocketsModule,

        IdentityModule,
        PriceModule,
        
        ScheduleModule.forRoot()
    ],
    controllers: [
        AppController,
        MissingModelsController
    ]
})
export class AppModule implements NestModule
{
  configure(consumer: MiddlewareConsumer)
  {
    consumer
  }
}
