import { Injectable } from "@nestjs/common"
import TokenIndicatorsModel from "commons/models/indicators/TokenIndicatorsModel.dto"
import PriceKlineModel from "commons/models/price/PriceKlineModel.dto"

@Injectable()
export class IndicatorsCoreService
{
    processPrices(tokenPair: string, interval: string, klines: PriceKlineModel[], window: number) : TokenIndicatorsModel[]
    {
        const indicators = []
        for (let i=0; i<window; i++){
            const windowPrices = i > 0 ? klines.slice(0, -i) : klines
            const timestamp = windowPrices[windowPrices.length-1].timestamp
            const prices = windowPrices.map(p => parseFloat(p.price))
            const indicator = this.processPrice(tokenPair, interval, timestamp, prices, [])
            indicators.push(indicator)
        }
        return indicators.reverse()
    }

    processPrice(tokenPair: string, interval: string, timestamp: number, prices: number[], indicators: TokenIndicatorsModel[]) : TokenIndicatorsModel
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
        const ema30 = this.calculateEMA(prices, 30)

        //different macdLines
        const macdLine = this.calculateMACDLine(ema12, ema26)
        const macdSignal9 = this.calculateMACDSignal(macdLine, indicators.map(i => i.indicators["macdLine"]), 9)
        const macd9 = '' + (parseFloat(macdLine) - parseFloat(macdSignal9)).toFixed(8)

        const bollinger20 = this.calculateBollinger(prices, 20)

        //dumps
        const dump1 = this.calculateDump(prices, 1)
        const dump3 = this.calculateDump(prices, 3)
        const dump5 = this.calculateDump(prices, 5)
        const dump10 = this.calculateDump(prices, 10)
        //pumps
        const pump1 = this.calculatePump(prices, 1)
        const pump3 = this.calculatePump(prices, 3)
        const pump5 = this.calculatePump(prices, 5)
        const pump10 = this.calculatePump(prices, 10)

        return new TokenIndicatorsModel(tokenPair, interval, '' + prices[0], timestamp, {
            rsi9, rsi11, rsi14, rsi20, rsi30, 
            williams14, williams30, 
            ema12, ema20, ema26, ema30, 
            macdLine, macdSignal9, macd9, 
            bollinger20Mid: bollinger20.middle, bollinger20SD: bollinger20.sd, bollinger20High: bollinger20.high, bollinger20Low: bollinger20.low,
            dump1, dump3, dump5, dump10,
            pump1, pump3, pump5, pump10
        })
    }

    // The RSI measures the ratio of up-moves to down-moves, and normalises the calculation so that the index is expressed in a range of 0-100. It was originally developed by J.Welles Wilder. If the RSI is 70 or greater, the instrument is assumed to be overbought (a situation whereby prices have risen more than market expectations). An RSI of 30 or less is taken as a signal that the instrument may be oversold (a situation in which prices have fallen more than the market expectations).
    private calculateRSI(prices: number[], period: number) : string
    {
        if (prices.length < period) { return '0' }
        const periodPrices = [...prices.slice(-period-1, prices.length)]
        
        const priceChanges: number[] = [];
        for (let i = 0; i < periodPrices.length-1; i++) {
            priceChanges.push(periodPrices[i+1] - periodPrices[i])
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

    private calculateDump(prices: number[], period: number) : string
    {
        if (prices.length < period + 1) { return '0' }

        const currentPrice = prices[-1]
        const periodPrices = [...prices.slice(-period-1), period]

        const maxPrice = periodPrices.reduce((acc, price) => price > acc ? price : acc, 0)
        
        const currentDifference = (maxPrice - currentPrice)/maxPrice

        return '' + currentDifference
    }

    private calculatePump(prices: number[], period: number) : string
    {
        if (prices.length < period + 1) { return '0' }

        const currentPrice = prices[-1]
        const periodPrices = [...prices.slice(-period-1), period]

        const minPrice = periodPrices.reduce((acc, price) => price < acc ? price : acc, Number.MAX_VALUE)

        const currentDifference = (currentPrice - minPrice)/minPrice

        return '' + currentDifference
    }
}