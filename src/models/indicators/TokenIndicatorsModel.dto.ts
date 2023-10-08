import { ApiProperty } from "@nestjs/swagger"
import { Timestamp } from "../swagger.consts"

export default class TokenIndicatorsModel
{
    @ApiProperty() tokenPair: string
    @ApiProperty() interval: string
    @ApiProperty() price: string
    @ApiProperty(Timestamp) timestamp: number

    // The RSI measures the ratio of up-moves to down-moves, and normalises the calculation so that the index is expressed in a range of 0-100. It was originally developed by J.Welles Wilder. If the RSI is 70 or greater, the instrument is assumed to be overbought (a situation whereby prices have risen more than market expectations). An RSI of 30 or less is taken as a signal that the instrument may be oversold (a situation in which prices have fallen more than the market expectations).
    @ApiProperty() rsi9: string
    @ApiProperty() rsi11: string 
    @ApiProperty() rsi14: string
    @ApiProperty() rsi20: string
    @ApiProperty() rsi30: string

    // Williams %R, also known as the Williams Percent Range, is a type of momentum indicator that moves between 0 and -100. When the indicator is between -20 and zero the price is overbought, or near the high of its recent price range. When the indicator is between -80 and -100 the price is oversold, or far from the high of its recent range.
    @ApiProperty() williams14: string
    @ApiProperty() williams30: string
    
    // EMA - Traders are bullish when the 20 EMA crosses above the 50 EMA or remains above the 50 EMA, and only turn bearish if the 20 EMA falls below the 50 EMA.
    // The 12- and 26-day exponential moving averages (EMAs) are often the most quoted and analyzed short-term averages. The 12- and 26-day are used to create indicators like the moving average convergence divergence (MACD) and the percentage price oscillator (PPO). In general, the 50- and 200-day EMAs are used as indicators for long-term trends. When a stock price crosses its 200-day
    @ApiProperty() ema12: string
    @ApiProperty() ema20: string
    @ApiProperty() ema26: string
    @ApiProperty() ema50: string
    @ApiProperty() ema200: string

    @ApiProperty() macdLine: string
    @ApiProperty() macdSignal9: string
    @ApiProperty() macd9: string

    @ApiProperty() bollinger20Mid: string
    @ApiProperty() bollinger20SD: string
    @ApiProperty() bollinger20High: string
    @ApiProperty() bollinger20Low: string

    constructor(tokenPair: string, interval: string, price: string, timestamp: number, rsi9: string, rsi11: string, rsi14: string, rsi20: string, rsi30: string, williams14: string, williams30: string, ema12: string, ema20: string, ema26: string, ema50: string, ema200: string, macdLine: string, macdSignal9: string, macd9: string, bollinger20Mid: string, bollinger20SD: string, bollinger20High: string, bollinger20Low: string)
    {
        this.tokenPair = tokenPair
        this.interval = interval
        this.price = price
        this.timestamp = timestamp

        this.rsi9 = rsi9
        this.rsi11 = rsi11
        this.rsi14 = rsi14
        this.rsi20 = rsi20
        this.rsi30 = rsi30

        this.williams14 = williams14
        this.williams30 = williams30

        this.ema12 = ema12
        this.ema20 = ema20
        this.ema26 = ema26
        this.ema50 = ema50
        this.ema200 = ema200

        this.macdLine = macdLine
        this.macdSignal9 = macdSignal9
        this.macd9 = macd9

        this.bollinger20Mid = bollinger20Mid
        this.bollinger20SD = bollinger20SD
        this.bollinger20High = bollinger20High
        this.bollinger20Low = bollinger20Low
    }
}