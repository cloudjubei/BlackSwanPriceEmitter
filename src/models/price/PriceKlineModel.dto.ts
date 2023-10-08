import { ApiProperty } from "@nestjs/swagger"

export default class PriceKlineModel
{
    @ApiProperty() tokenPair: string
    @ApiProperty() interval: string

    @ApiProperty() timestamp_open: string = "0"
    @ApiProperty() timestamp_close: string = "0"
    @ApiProperty() price_open: string = "0"
    @ApiProperty() price_close: string = "0"
    @ApiProperty() price_low: string = "0"
    @ApiProperty() price_high: string = "0"
    @ApiProperty() volume: string = "0"
    @ApiProperty() trades_number: string = "0"
    @ApiProperty() asset_volume_quote: string = "0"
    @ApiProperty() asset_volume_taker_base: string = "0"
    @ApiProperty() asset_volume_taker_quote: string = "0"

    constructor(tokenPair: string, interval: string)
    {
        this.tokenPair = tokenPair
        this.interval = interval
    }
}