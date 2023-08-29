import { ApiProperty } from "@nestjs/swagger"
import { Timestamp } from "../swagger.consts"

export default class TokenPriceTimeModel
{
    @ApiProperty() tokenPair: string
    @ApiProperty() price: string
    @ApiProperty(Timestamp) timestamp: number

    constructor(tokenPair: string, price: string, timestamp: number)
    {
        this.tokenPair = tokenPair
        this.price = price
        this.timestamp = timestamp
    }
}