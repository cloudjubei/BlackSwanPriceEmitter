import { ApiProperty } from "@nestjs/swagger"

export default class PriceKlineModel
{
    @ApiProperty() timestamp_open: string
    @ApiProperty() timestamp_close: string
    @ApiProperty() price_open: string
    @ApiProperty() price_close: string
    @ApiProperty() price_low: string
    @ApiProperty() price_high: string
    @ApiProperty() volume: string
    @ApiProperty() trades_number: string
    @ApiProperty() asset_volume_quote: string
    @ApiProperty() asset_volume_taker_base: string
    @ApiProperty() asset_volume_taker_quote: string
}