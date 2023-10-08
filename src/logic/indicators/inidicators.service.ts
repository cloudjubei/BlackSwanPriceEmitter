import { Injectable } from "@nestjs/common";
import TokenIndicatorsModel from "src/models/indicators/TokenIndicatorsModel.dto";
import TokenPriceTimeModel from "src/models/price/TokenPriceTimeModel.dto";

@Injectable()
export class IndicatorsService
{
    private cache : { [key:string] : TokenIndicatorsModel[] } = {}
    private cacheSize = 201

    setupCache(tokens: string[])
    {
        for(const token of tokens){
            this.cache[token] = []
        }
    }

    storeInCache(tokenPair: string, allPrices: TokenPriceTimeModel[])
    {
        const indicators = this.processPrice(allPrices, this.getAll(tokenPair).reverse())
        this.cache[tokenPair] = [indicators, ...this.cache[tokenPair]]
        if (this.cache[tokenPair].length > this.cacheSize){
            this.cache[tokenPair].pop()
        }
    }

    getAll(tokenPair: string) : TokenIndicatorsModel[]
    {
        return this.cache[tokenPair] ?? []
    }

    getLatest(tokenPair: string) : TokenIndicatorsModel
    {
        const indicators = this.cache[tokenPair]
        if (indicators.length > 0){
            return indicators[0]
        }
        return new TokenIndicatorsModel(tokenPair, '0', Date.now(), '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0')
    }

    private processPrice(prices: TokenPriceTimeModel[], indicators: TokenIndicatorsModel[]) : TokenIndicatorsModel
    {
        const numericPrices: number[] = prices.map(p => parseFloat(p.price)).reverse()

        const rsi9 = this.calculateRSI(numericPrices, 9)
        const rsi11 = this.calculateRSI(numericPrices, 11)
        const rsi14 = this.calculateRSI(numericPrices, 14)
        const rsi20 = this.calculateRSI(numericPrices, 20)
        const rsi30 = this.calculateRSI(numericPrices, 30)

        const williams14 = this.calculateWilliams(numericPrices, 14)
        const williams30 = this.calculateWilliams(numericPrices, 30)

        // calculateSAR

        const ema12 = this.calculateEMA(numericPrices, 12)
        const ema20 = this.calculateEMA(numericPrices, 20)
        const ema26 = this.calculateEMA(numericPrices, 26)
        const ema50 = this.calculateEMA(numericPrices, 50)
        const ema200 = this.calculateEMA(numericPrices, 200)

        const macdLine = this.calculateMACDLine(ema12, ema26)
        const macdSignal9 = this.calculateMACDSignal(macdLine, indicators.map(i => i.macdLine), 9)
        const macd9 = '' + (parseFloat(macdLine) - parseFloat(macdSignal9))

        const bollinger20 = this.calculateBollinger(numericPrices, 20)

        return new TokenIndicatorsModel(prices[0].tokenPair, prices[0].price, Date.now(), rsi9, rsi11, rsi14, rsi20, rsi30, williams14, williams30, ema12, ema20, ema26, ema50, ema200, macdLine, macdSignal9, macd9, bollinger20.middle, bollinger20.sd, bollinger20.high, bollinger20.low)
    }

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
        
        return '' + rsi
    }

    private calculateWilliams(prices: number[], period: number) : string
    {
        if (prices.length < period) { return '0' }

        const periodPrices = [...prices.slice(-period, prices.length)]

        const highestHigh = Math.max(...periodPrices)
        const lowestLow = Math.min(...periodPrices)
        const currentPrice = prices[prices.length-1]
    
        const williamsPercentR = ((highestHigh - currentPrice) / (highestHigh - lowestLow)) * -100   
      
        return '' + williamsPercentR
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
        return '' + ema
    }

    private calculateMACDLine(ema12: string, ema26: string) : string
    {
        const macdLine = parseFloat(ema12) - parseFloat(ema26)

        return '' + macdLine
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
        const lowerBand = middleBand + multiplier * standardDeviation

        return { high: '' + upperBand, middle: '' + middleBand, low: '' + lowerBand, sd: '' + standardDeviation }  
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