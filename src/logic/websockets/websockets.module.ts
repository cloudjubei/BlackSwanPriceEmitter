import { Module } from '@nestjs/common'
import { WSCommonModule } from './common/ws-common.module'
import { WebsocketsGateway } from './websockets.gateway'
import { WSPriceModule } from './price/ws-price.module'
import { WSTimesyncModule } from './timesync/ws-timesync.module'
import { WSIdentityModule } from './identity/ws-identity.module'

@Module({
    imports: [
        WSCommonModule,

        WSTimesyncModule,
        
        WSIdentityModule,
        WSPriceModule
    ],
    providers: [WebsocketsGateway]
})
export class WebsocketsModule {}