import { Injectable } from "@nestjs/common"
import { IndicatorsCache } from "src/models/cache/IndicatorsCache"
import TokenIndicatorsModel from "src/models/indicators/TokenIndicatorsModel.dto"
import PriceKlineModel from "src/models/price/PriceKlineModel.dto"

@Injectable()
export class IndicatorsService
{
    private cache = new IndicatorsCache()

    setupCache(tokens: string[], intervals: string[], cacheSize: number)
    {
        this.cache.setup(tokens, intervals, cacheSize)
    }

    storeInCache(tokenPair: string, interval: string, allKlines: PriceKlineModel[])
    {
        const timestamp = allKlines[0].timestamp_open
        const prices = allKlines.map(p => parseFloat(p.price_close)).reverse()
        const indicators = this.processPrice(tokenPair, interval, timestamp, prices, this.getAll(tokenPair, interval).reverse())

        this.cache.storeIndicators(indicators)
    }

    getAll(tokenPair: string, interval: string) : TokenIndicatorsModel[]
    {
        return this.cache.getAll(tokenPair, interval)
    }

    getLatest(tokenPair: string, interval: string = '1s') : TokenIndicatorsModel
    {
        return this.cache.getLatest(tokenPair, interval)
    }

    private processPrice(tokenPair: string, interval: string, timestamp: number, prices: number[], indicators: TokenIndicatorsModel[]) : TokenIndicatorsModel
    {
        const rsi9 = this.calculateRSI(prices, 9)
        const rsi11 = this.calculateRSI(prices, 11)
        const rsi14 = this.calculateRSI(prices, 14)
        const rsi20 = this.calculateRSI(prices, 20)
        const rsi30 = this.calculateRSI(prices, 30)

        const williams14 = this.calculateWilliams(prices, 14)
        const williams30 = this.calculateWilliams(prices, 30)

        // calculateSAR

        const ema12 = this.calculateEMA(prices, 12)
        const ema20 = this.calculateEMA(prices, 20)
        const ema26 = this.calculateEMA(prices, 26)
        const ema50 = this.calculateEMA(prices, 50)
        const ema200 = this.calculateEMA(prices, 200)

        const macdLine = this.calculateMACDLine(ema12, ema26)
        const macdSignal9 = this.calculateMACDSignal(macdLine, indicators.map(i => i.indicators["macdLine"]), 9)
        const macd9 = '' + (parseFloat(macdLine) - parseFloat(macdSignal9)).toFixed(8)

        const bollinger20 = this.calculateBollinger(prices, 20)

        return new TokenIndicatorsModel(tokenPair, interval, '' + prices[0], timestamp, {
            rsi9, rsi11, rsi14, rsi20, rsi30, 
            williams14, williams30, 
            ema12, ema20, ema26, ema50, ema200, 
            macdLine, macdSignal9, macd9, 
            bollinger20Mid: bollinger20.middle, bollinger20SD: bollinger20.sd, bollinger20High: bollinger20.high, bollinger20Low: bollinger20.low
        })
    }

    // The RSI measures the ratio of up-moves to down-moves, and normalises the calculation so that the index is expressed in a range of 0-100. It was originally developed by J.Welles Wilder. If the RSI is 70 or greater, the instrument is assumed to be overbought (a situation whereby prices have risen more than market expectations). An RSI of 30 or less is taken as a signal that the instrument may be oversold (a situation in which prices have fallen more than the market expectations).
    private calculateRSI(prices: number[], period: number) : string
    {
        if (prices.length < period) { return '0' }
        
        const priceChanges: number[] = [];
        for (let i = 1; i < prices.length; i++) {
            priceChanges.push(prices[i] - prices[i - 1])
        }

        let averageGain = 0
        let averageLoss = 0
        for (let i = 0; i < period; i++) {
            const change = priceChanges[i];
            if (change > 0) {
                averageGain += change
            } else {
                averageLoss -= change
            }
        }
        averageGain /= period
        averageLoss /= period
        
        const rs = averageGain / averageLoss
        const rsi = 100 - (100 / (1 + rs))
        
        return '' + rsi.toFixed(8)
    }

    // Williams %R, also known as the Williams Percent Range, is a type of momentum indicator that moves between 0 and -100. When the indicator is between -20 and zero the price is overbought, or near the high of its recent price range. When the indicator is between -80 and -100 the price is oversold, or far from the high of its recent range.
    private calculateWilliams(prices: number[], period: number) : string
    {
        if (prices.length < period) { return '0' }

        const periodPrices = [...prices.slice(-period, prices.length)]

        const highestHigh = Math.max(...periodPrices)
        const lowestLow = Math.min(...periodPrices)
        const currentPrice = prices[prices.length-1]
    
        const williamsPercentR = ((highestHigh - currentPrice) / (highestHigh - lowestLow)) * -100   
      
        return '' + williamsPercentR.toFixed(8)
    }

    private calculateSMA(prices: number[], period: number) : number
    {
        if (prices.length < period) { return 0 }

        const periodPrices = [...prices.slice(-period, prices.length)]

        let sma = 0
        for (let i = 0; i < period; i++) {
            sma += periodPrices[i]
        }
        sma /= period

        return sma
    }

    // EMA - Traders are bullish when the 20 EMA crosses above the 50 EMA or remains above the 50 EMA, and only turn bearish if the 20 EMA falls below the 50 EMA.
    // The 12- and 26-day exponential moving averages (EMAs) are often the most quoted and analyzed short-term averages. The 12- and 26-day are used to create indicators like the moving average convergence divergence (MACD) and the percentage price oscillator (PPO). In general, the 50- and 200-day EMAs are used as indicators for long-term trends. When a stock price crosses its 200-day
    private calculateEMA(prices: number[], period: number) : string
    {
        if (prices.length < period) { return '0' }

        const multiplier = 2 / (period + 1)

        const sma = this.calculateSMA([...prices.slice(-period-1, prices.length-1)], period)

        let ema = sma
        const previousEMA = ema

        for (let i = 0; i < period; i++) {
            const currentPrice = prices[prices.length - period + i];
            ema = (currentPrice - previousEMA) * multiplier + previousEMA
        }
        return '' + ema.toFixed(8)
    }

    private calculateMACDLine(ema12: string, ema26: string) : string
    {
        const macdLine = parseFloat(ema12) - parseFloat(ema26)

        return '' + macdLine.toFixed(8)
    }

    private calculateMACDSignal(macdLine: string, macdLines: string[], period: number) : string
    {
        if (macdLines.length + 1 < period) { return '0' }
    
        const numericPrices: number[] = [...macdLines.map(parseFloat), parseFloat(macdLine)]

        const signal = this.calculateEMA(numericPrices, period)

        return signal
    }

    private calculateBollinger(prices: number[], period: number, multiplier: number = 2) : { high, middle, low, sd }
    {
        if (prices.length < period) { return { high: '0', middle: '0', low: '0', sd: '0' }}

        const middleBand = this.calculateSMA(prices, period)
        const standardDeviation = this.calculateStandardDeviation(prices, middleBand, period)
        const upperBand = middleBand + multiplier * standardDeviation
        const lowerBand = middleBand - multiplier * standardDeviation

        return { high: '' + upperBand.toFixed(8), middle: '' + middleBand.toFixed(8), low: '' + lowerBand.toFixed(8), sd: '' + standardDeviation.toFixed(8) }  
    }

    private calculateStandardDeviation(prices: number[], average: number, period: number) : number
    {
        if (prices.length < period) { return 0 }

        const periodPrices = [...prices.slice(-period, prices.length)]

        const squaredDifferences = periodPrices.map((price) => Math.pow(price - average, 2))
        const variance = squaredDifferences.reduce((acc, diff) => acc + diff, 0) / period
        return Math.sqrt(variance)
    }
}