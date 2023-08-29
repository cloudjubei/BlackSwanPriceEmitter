import { ApiProperty } from "@nestjs/swagger"
import { Timestamp } from "../swagger.consts"

export default class SignalModel
{
    @ApiProperty() tokenPair: string
    @ApiProperty() action: number
    @ApiProperty(Timestamp) timestamp: number

    constructor(tokenPair: string, action: number, timestamp: number)
    {
        this.tokenPair = tokenPair
        this.action = action
        this.timestamp = timestamp
    }
}