import { Injectable } from "@nestjs/common"
import { KalmanFilter } from "kalman-filter"
import TokenIndicatorsModel from "commons/models/indicators/TokenIndicatorsModel.dto"
import PriceKlineModel from "commons/models/price/PriceKlineModel.dto"

@Injectable()
export class IndicatorsCoreService
{
    processPrices(tokenPair: string, interval: string, klines: PriceKlineModel[], window: number) : TokenIndicatorsModel[]
    {
        const indicators = []
        for (let i=1; i<=window; i++){
            const windowPrices = klines.slice(0, klines.length-window+i)
            const timestamp = windowPrices[windowPrices.length-1].timestamp
            const prices = windowPrices.map(p => parseFloat(p.price))
            const pricesHigh = windowPrices.map(p => parseFloat(p.price_high))
            const pricesLow = windowPrices.map(p => parseFloat(p.price_low))
            const pricesCandleHeight = windowPrices.map(p => parseFloat(p.price) - parseFloat(p.price_open))
            // const pricesCandleHeightMax = windowPrices.map(p => parseFloat(p.price_high) - parseFloat(p.price_low))
            const volumes = windowPrices.map(p => parseFloat(p.volume))
            const indicator = this.processPrice(tokenPair, interval, timestamp, prices, pricesHigh, pricesLow, pricesCandleHeight, volumes, [])
            // const indicator = this.processPrice(tokenPair, interval, timestamp, prices, pricesHigh, pricesLow, pricesCandleHeight, pricesCandleHeightMax, volumes, [])
            indicators.push(indicator)
        }
        return indicators
    }

    processPrice(tokenPair: string, interval: string, timestamp: number, prices: number[], pricesHigh: number[], pricesLow: number[], pricesCandleHeight: number[], /*pricesCandleHeightMax: number[],*/ volumes: number[], indicators: TokenIndicatorsModel[]) : TokenIndicatorsModel
    {
        // const price_percent = '' + ((prices[prices.length-1] - prices[prices.length-2])/prices[prices.length-2]).toFixed(8)
        // const volume_percent = '' + ((volumes[volumes.length-1] - volumes[volumes.length-2])/volumes[volumes.length-2]).toFixed(8)
        // const price_high_percent = '' + ((pricesHigh[pricesHigh.length-1] - pricesHigh[pricesHigh.length-2])/pricesHigh[pricesHigh.length-2]).toFixed(8)
        // const price_low_percent = '' + ((pricesLow[pricesLow.length-1] - pricesLow[pricesLow.length-2])/pricesLow[pricesLow.length-2]).toFixed(8)

        const atr5_number = this.calculateATR(prices, pricesLow, pricesHigh, 5)
        const atr5 = '' + atr5_number.toFixed(8)
        const atr8_number = this.calculateATR(prices, pricesLow, pricesHigh, 8)
        const atr8 = '' + atr8_number.toFixed(8)
        const atr13_number = this.calculateATR(prices, pricesLow, pricesHigh, 13)
        const atr13 = '' + atr13_number.toFixed(8)
        const atr30_number = this.calculateATR(prices, pricesLow, pricesHigh, 30)
        const atr30 = '' + atr30_number.toFixed(8)

        const rsi9 = this.calculateRSI(prices, 9)
        const rsi11 = this.calculateRSI(prices, 11)
        const rsi14 = this.calculateRSI(prices, 14)
        const rsi20 = this.calculateRSI(prices, 20)
        const rsi30 = this.calculateRSI(prices, 30)

        const williams14 = this.calculateWilliams(prices, 14)
        const williams30 = this.calculateWilliams(prices, 30)

        const wlti = this.calculateWLTI(prices, pricesLow, pricesHigh, volumes)

        const sma3_number = this.calculateSMA(prices, 3)
        const sma3 = '' + sma3_number.toFixed(8)
        const sma5_number = this.calculateSMA(prices, 5)
        const sma5 = '' + sma5_number.toFixed(8)
        const sma8_number = this.calculateSMA(prices, 8)
        const sma8 = '' + sma8_number.toFixed(8)
        const sma13_number = this.calculateSMA(prices, 13)
        const sma13 = '' + sma13_number.toFixed(8)
        const sma30_number = this.calculateSMA(prices, 30)
        const sma30 = '' + sma30_number.toFixed(8)

        const ema12 = this.calculateEMA(prices, 12)
        const ema20 = this.calculateEMA(prices, 20)
        const ema26 = this.calculateEMA(prices, 26)
        const ema30 = this.calculateEMA(prices, 30)

        const rma14 = this.calculateRMA(prices, 14)
        const rma21 = this.calculateRMA(prices, 21)
        const rma50 = this.calculateRMA(prices, 50)
        const rma90 = this.calculateRMA(prices, 90)

        const sar001_01 = this.calculateSAR(prices, 30, 0.01, 0.1)
        const sar002_02 = this.calculateSAR(prices, 30, 0.02, 0.2)
        const sar005_03 = this.calculateSAR(prices, 30, 0.05, 0.3)

        //different macdLines
        const macdLine = this.calculateMACDLine(ema12, ema26)
        const macdSignal9 = this.calculateMACDSignal(macdLine, indicators.map(i => i.indicators["macdLine"]), 9)
        const macd9 = '' + (parseFloat(macdLine) - parseFloat(macdSignal9)).toFixed(8)

        const bollinger20 = this.calculateBollinger(prices, 20)

        //kallman filter
        const kallman5 = this.calculateKallmanFilter(prices, 5)
        const kallman14 = this.calculateKallmanFilter(prices, 14)
        const kallman20 = this.calculateKallmanFilter(prices, 20)
        const kallman30 = this.calculateKallmanFilter(prices, 30)

        //larry williams large trade indicator
        const lwti8 = this.calculateLWTI(prices, pricesLow, pricesHigh, 8)
        const lwti13 = this.calculateLWTI(prices, pricesLow, pricesHigh, 13)
        const lwti30 = this.calculateLWTI(prices, pricesLow, pricesHigh, 30)

        const donchianChannels14 = this.calculateDonchianChannels(prices, 14)
        const donchianChannels20 = this.calculateDonchianChannels(prices, 20)
        const donchianChannels96 = this.calculateDonchianChannels(prices, 96)

        //candle counts
        const kandleCount2_10 = this.calculateCandleCount(pricesCandleHeight, 10, 2)
        const kandleCount2_30 = this.calculateCandleCount(pricesCandleHeight, 30, 2)
        const kandleCount3_30 = this.calculateCandleCount(pricesCandleHeight, 30, 3)
        const kandleCount3_90 = this.calculateCandleCount(pricesCandleHeight, 90, 3)
        const kandleCount5_90 = this.calculateCandleCount(pricesCandleHeight, 90, 5)
        const kandleCount5_300 = this.calculateCandleCount(pricesCandleHeight, 300, 5)
        // const kandleCount10_300 = this.calculateCandleCount(pricesCandleHeight, 300, 10)

        const volume_sma8 = '' + this.calculateSMA(volumes, 8).toFixed(8)
        const volume_sma30 = '' + this.calculateSMA(volumes, 30).toFixed(8)
        const volume_sma90 = '' + this.calculateSMA(volumes, 90).toFixed(8)

        const lwStrategyUp = this.calculateLWStrategyUp(prices, volumes, donchianChannels96.high, lwti30, volume_sma90)
        const lwStrategyDown = this.calculateLWStrategyDown(prices, volumes, donchianChannels96.low, lwti30, volume_sma90)

        return new TokenIndicatorsModel(tokenPair, interval, '' + prices[prices.length-1], timestamp, {
            // price_percent, price_high_percent, price_low_percent, volume_percent,
            atr5, atr8, atr13, atr30,
            rsi9, rsi11, rsi14, rsi20, rsi30, 
            williams14, williams30, wlti,
            sma3, sma5, sma8, sma13, sma30,
            ema12, ema20, ema26, ema30, 
            rma14, rma21, rma50, rma90,
            sar001_01, sar002_02, sar005_03,
            macdLine, macdSignal9, macd9, 
            bollinger20Mid: bollinger20.middle, bollinger20SD: bollinger20.sd, bollinger20High: bollinger20.high, bollinger20Low: bollinger20.low,
            kallman5Mean: kallman5.mean, kallman5Momentum: kallman5.momentum, kallman14Mean: kallman14.mean, kallman14Momentum: kallman14.momentum, kallman20Mean: kallman20.mean, kallman20Momentum: kallman20.momentum, kallman30Mean: kallman30.mean, kallman30Momentum: kallman30.momentum,
            lwti8, lwti13, lwti30,
            donchianChannels14High: donchianChannels14.high, donchianChannels14Mid: donchianChannels14.middle, donchianChannels14Low: donchianChannels14.low,
            donchianChannels20High: donchianChannels20.high, donchianChannels20Mid: donchianChannels20.middle, donchianChannels20Low: donchianChannels20.low,
            donchianChannels96High: donchianChannels96.high, donchianChannels96Mid: donchianChannels96.middle, donchianChannels96Low: donchianChannels96.low,

            kandleCount2_30_green: kandleCount2_30.green, kandleCount2_30_red: kandleCount2_30.red, kandleCount2_30_high: kandleCount2_30.height_high, kandleCount2_30_mid: kandleCount2_30.height_mid, kandleCount2_30_low: kandleCount2_30.height_low,
            kandleCount3_30_green: kandleCount3_30.green, kandleCount3_30_red: kandleCount3_30.red, kandleCount3_30_high: kandleCount3_30.height_high, kandleCount3_30_mid: kandleCount3_30.height_mid, kandleCount3_30_low: kandleCount3_30.height_low,
            kandleCount5_90_green: kandleCount5_90.green, kandleCount5_90_red: kandleCount5_90.red, kandleCount5_90_high: kandleCount5_90.height_high, kandleCount5_90_mid: kandleCount5_90.height_mid, kandleCount5_90_low: kandleCount5_90.height_low,
            
            kandleCount2_10_green: kandleCount2_10.green, kandleCount2_10_red: kandleCount2_10.red, kandleCount2_10_high: kandleCount2_10.height_high, kandleCount2_10_mid: kandleCount2_10.height_mid, kandleCount2_10_low: kandleCount2_10.height_low,
            kandleCount3_90_green: kandleCount3_90.green, kandleCount3_90_red: kandleCount3_90.red, kandleCount3_90_high: kandleCount3_90.height_high, kandleCount3_90_mid: kandleCount3_90.height_mid, kandleCount3_90_low: kandleCount3_90.height_low,
            kandleCount5_300_green: kandleCount5_300.green, kandleCount5_300_red: kandleCount5_300.red, kandleCount5_300_high: kandleCount5_300.height_high, kandleCount5_300_mid: kandleCount5_300.height_mid, kandleCount5_300_low: kandleCount5_300.height_low,
            pump_dump10: kandleCount2_10.pump_dump, pump_dump90: kandleCount3_90.pump_dump, pump_dump300: kandleCount5_300.pump_dump,
            candle_color: kandleCount2_10.color, candle_height10: kandleCount2_10.height, candle_height30: kandleCount3_30.height, candle_height90: kandleCount3_90.height, candle_height300: kandleCount5_300.height,

            volume_sma8, volume_sma30, volume_sma90,

            lwStrategyUp, lwStrategyDown
        })
    }

    // Average True Range (ATR) is a popular technical indicator used to measure market volatility.
    private calculateATR(prices: number[], lowPrices: number[], highPrices: number[], period: number) : number
    {
        if (prices.length < period+1) { return 0 }
        const periodPrices = [...prices.slice(-period-1, prices.length)]
        const periodLowPrices = [...lowPrices.slice(-period-1, lowPrices.length)]
        const periodHighPrices = [...highPrices.slice(-period-1, highPrices.length)]
        
        const trueRanges = []
    
        for (let i = 1; i <= period; i++) {
            const trueRange = Math.max(
                periodHighPrices[i] - periodLowPrices[i],
                Math.abs(periodHighPrices[i] - periodPrices[i - 1]),
                Math.abs(periodLowPrices[i] - periodPrices[i - 1])
            )
            trueRanges.push(trueRange)
        }
    
        return trueRanges.reduce((sum, trueRange) => sum + trueRange, 0) / period
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
        const currentPrice = periodPrices[periodPrices.length-1]
    
        const williamsPercentR = ((highestHigh - currentPrice) / (highestHigh - lowestLow)) * -100   
      
        return '' + williamsPercentR.toFixed(8)
    }
    
    private calculateWLTI(prices: number[], pricesLow: number[], pricesHigh: number[], volumes: number[]) : string
    {
        const i = prices.length - 1
        const wlti = (prices[i] - pricesLow[i]) / (pricesHigh[i] - pricesLow[i]) * volumes[i]
      
        return '' + wlti.toFixed(8)
    }

    private calculateSMA(prices: number[], period: number) : number
    {
        if (prices.length < period) { return 0 }

        const periodPrices = [...prices.slice(-period, prices.length)]

        return periodPrices.reduce((sum, price) => sum + price, 0) / period
    }

    // EMA - Traders are bullish when the 20 EMA crosses above the 50 EMA or remains above the 50 EMA, and only turn bearish if the 20 EMA falls below the 50 EMA.
    // The 12- and 26-day exponential moving averages (EMAs) are often the most quoted and analyzed short-term averages. The 12- and 26-day are used to create indicators like the moving average convergence divergence (MACD) and the percentage price oscillator (PPO). In general, the 50- and 200-day EMAs are used as indicators for long-term trends. When a stock price crosses its 200-day
    private calculateEMA(prices: number[], period: number) : string
    {
        if (prices.length < period) { return '0' }

        const multiplier = 2 / (period + 1)

        const sma = this.calculateSMA(prices, period)

        let ema = sma
        let previousEMA = ema

        for (let i = 0; i < period; i++) {
            const currentPrice = prices[prices.length - period + i]
            const newEma = (currentPrice - previousEMA) * multiplier + previousEMA
            previousEMA = ema
            ema = newEma
        }
        return '' + ema.toFixed(8)
    }

    private calculateRMA(prices: number[], period: number) : string
    {
        if (prices.length < period) { return '0' }

        const multiplier = 1 / period

        const sma = this.calculateSMA(prices, period)

        let rma = sma
        let previousRMA = rma

        for (let i = 0; i < period; i++) {
            const currentPrice = prices[prices.length - period + i]
            const newRma = (currentPrice - previousRMA) * multiplier + previousRMA
            previousRMA = rma
            rma = newRma
        }
        return '' + rma.toFixed(8)
    }
    
    // acceleration factor 0.01 to 0.05
    // maxAccelerationFactor factor 0.1 to 0.3
    // period short-term best is 10, 20, or 30, long term 50, 100, 200
    private calculateSAR(prices: number[], period: number, accelerationFactor: number, maxAccelerationFactor: number) : string
    {
        if (prices.length < period) { return '0' }

        const periodPrices = [...prices.slice(-period, prices.length)]

        let sars = []
        let af = accelerationFactor
        let maxAF = maxAccelerationFactor
        let trend_up = true
        let extreme_price = periodPrices[0]
        let current_sar = periodPrices[0]
    
        for (let i = 0; i < periodPrices.length; i++) {
    
            if (trend_up) {

                if (periodPrices[i] < current_sar) {
                    trend_up = false
                    current_sar = extreme_price
                    extreme_price = periodPrices[i]
                    af = accelerationFactor
                } else {
                    current_sar = current_sar + af * (extreme_price - current_sar)
                    extreme_price = Math.max(extreme_price, periodPrices[i])
                    af = Math.min(af + accelerationFactor, maxAF)
                }
            } else {
                if (periodPrices[i] > current_sar) {
                    trend_up = true
                    current_sar = extreme_price
                    extreme_price = periodPrices[i]
                    af = accelerationFactor
                } else {
                    current_sar = current_sar + af * (extreme_price - current_sar)
                    extreme_price = Math.min(extreme_price, periodPrices[i])
                    af = Math.min(af + accelerationFactor, maxAF)
                }
            }
            sars.push(current_sar)
        }
        let last_sar = sars[sars.length-1]
        return '' + last_sar.toFixed(8)
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

    private calculateKallmanFilter(prices: number[], period: number) : { mean, momentum }
    {
        if (prices.length < period && prices.length >= 2) { return { mean: '0', momentum: '0' } }

        const observations = [...prices.slice(-period-1, prices.length-1)]

        const kFilter = new KalmanFilter()
        const means = kFilter.filterAll(observations)
        
        const mean_last = Number(means[means.length-1])
        const momentum_last = Number(means[means.length-1] - means[means.length-2])
        // console.log(`mean_last: ${mean_last} momentum_last: ${momentum_last} means.length: ${means.length}`)

        return { mean: mean_last.toFixed(8) , momentum: momentum_last.toFixed(8) }
    }

    private calculateLWTI(prices: number[], lowPrices: number[], highPrices: number[], period: number) : string
    {
        if (prices.length < 2*period) { return '0' }

        const len = prices.length
        const priceDifferences = []
        for(let i=0; i<period; i++){
            priceDifferences.push(prices[len-period+i] - prices[len-period*2+i])
        }
        const sma = this.calculateSMA(priceDifferences, period)
        const atr = this.calculateATR(prices, lowPrices, highPrices, period)
        const out = sma / atr

        return '' + out.toFixed(8)
    }
    
    // Donchian Channels are particularly useful for identifying trends. When the price consistently remains near the upper channel, it suggests a strong uptrend. Conversely, if the price hovers around the lower channel, it indicates a strong downtrend.
    private calculateDonchianChannels(prices: number[], period: number) : { high, middle, low, }
    {
        if (prices.length < period) { return { high: '0', middle: '0', low: '0' }}

        const periodPrices = [...prices.slice(-period, prices.length)]

        const highestHigh = Math.max(...periodPrices)
        const lowestLow = Math.min(...periodPrices)
        const middle = (highestHigh + lowestLow)/2
    
        return { high: '' + highestHigh.toFixed(8), middle: '' + middle.toFixed(8), low: '' + lowestLow.toFixed(8) }
    }

    private calculateLWStrategyUp(prices: number[], volumes: number[], donchianHighString: string, lwtiString: string, volumeAvgString: string) : string
    {
        const last_price = prices[prices.length - 1]
        const last_volume = volumes[volumes.length - 1]

        const donchianHigh = parseFloat(donchianHighString)
        const lwti = parseFloat(lwtiString)
        const volumeAvg = parseFloat(volumeAvgString)

        return (last_price >= donchianHigh * 0.99) && (lwti > 0) && (last_volume >= volumeAvg) ? "1" : "0"
    }
    private calculateLWStrategyDown(prices: number[], volumes: number[], donchianDownString: string, lwtiString: string, volumeAvgString: string) : string
    {
        const last_price = prices[prices.length - 1]
        const last_volume = volumes[volumes.length - 1]

        const donchianDown = parseFloat(donchianDownString)
        const lwti = parseFloat(lwtiString)
        const volumeAvg = parseFloat(volumeAvgString)

        return (last_price <= donchianDown * 1.01) && (lwti < 0) && (last_volume >= volumeAvg) ? "-1" : "0"
    }
    
    private calculateCandleCount(pricesCandleHeight: number[], period: number, tuplesCount: number) : { color, height, pump_dump, green, red, height_high, height_mid, height_low }
    {
        if (pricesCandleHeight.length < period) { return { color: '0', height: '0', pump_dump: '0', green: '0', red: '0', height_high: '0', height_mid: '0', height_low: '0' } }

        const MULTIPLIER_LOW = 0.4
        const MULTIPLIER_HIGH = 0.6
        const observations = [...pricesCandleHeight.slice(-period-1, pricesCandleHeight.length-1)]

        let total_height = 0
        const mapped = []
        const mapped_heights = []

        for(let i=0; i<period; i++){
            const height = observations[i]
            mapped.push(height >= 0 ? 'g' : 'r')

            const height_abs = Math.abs(height)
            total_height += height_abs
            mapped_heights.push(height_abs)
        }

        const average_height = total_height/mapped_heights.length
        const pump_dump = observations[observations.length-1]/average_height

        for(let i=0; i<mapped_heights.length; i++){
            const h = mapped_heights[i]
            if (h < average_height * MULTIPLIER_LOW){
                mapped_heights[i] = "0"
            }else if(h > average_height * MULTIPLIER_HIGH){
                mapped_heights[i] = "2"
            }else{
                mapped_heights[i] = "1"
            }
        }

        const counts = {}
        const count_heights = {}
        const counts_with_heights = {}
        for(let i=0; i<mapped.length-tuplesCount; i++){
            let colors = ""
            let heights = ""
            let colorsWithHeights = ""
            for(let j=0; j<tuplesCount; j++){
                const index = i+j
                colors += mapped[index]
                heights += mapped_heights[index]
                colorsWithHeights += mapped[index] + mapped_heights[index]
            }
            counts[colors] = (counts[colors] ?? 0) + 1
            count_heights[heights] = (count_heights[heights] ?? 0) + 1
            counts_with_heights[colorsWithHeights] = (counts_with_heights[colorsWithHeights] ?? 0) + 1
        }
        let last_colors = ""
        let last_heights = ""
        let last_colorsWithHeights = ""
        for(let i=tuplesCount-2; i>=0; i--){
            last_colors += mapped[i]
            last_heights += mapped_heights[i]
            last_colorsWithHeights += mapped[i] + mapped_heights[i]
        }

        const count_red = counts[last_colors + "r"] ?? 0
        const count_green = counts[last_colors + "g"] ?? 0
        const count_base = count_red + count_green

        const count_height_high = count_heights[last_heights + "2"] ?? 0
        const count_height_mid = count_heights[last_heights + "1"] ?? 0
        const count_height_low = count_heights[last_heights + "0"] ?? 0
        const count_height_base = count_height_high + count_height_mid + count_height_low

        const green = count_base > 0 ? count_green/count_base : 0
        const red = count_base > 0 ? count_red/count_base : 0

        const height_high = count_height_base > 0 ? count_height_high/count_height_base : 0
        const height_mid = count_height_base > 0 ? count_height_mid/count_height_base : 0
        const height_low = count_height_base > 0 ? count_height_low/count_height_base : 0

        const color = mapped[mapped.length-1] == 'g' ? 1 : -1
        const height = mapped_heights[mapped_heights.length-1]

        return { color, height, pump_dump: pump_dump.toFixed(8), green: green.toFixed(8), red: red.toFixed(8), height_high: height_high.toFixed(8), height_mid: height_mid.toFixed(8), height_low: height_low.toFixed(8) }
    }

    // private calculateDemandSupplyZones(prices, threshold = 0.1)
    // {
    //     const zones = [];
    
    //     for (let i = 1; i < prices.length - 1; i++) {
    //         const prevPrice = prices[i - 1];
    //         const currentPrice = prices[i];
    //         const nextPrice = prices[i + 1];
    
    //         // Check if current price is significantly higher/lower than previous and next prices
    //         const demandZone = currentPrice < prevPrice && currentPrice < nextPrice;
    //         const supplyZone = currentPrice > prevPrice && currentPrice > nextPrice;
    
    //         // Check if current price is within the threshold percentage of previous and next prices
    //         const demandZoneThreshold = (prevPrice - currentPrice) / prevPrice >= threshold && (nextPrice - currentPrice) / nextPrice >= threshold;
    //         const supplyZoneThreshold = (currentPrice - prevPrice) / prevPrice >= threshold && (currentPrice - nextPrice) / nextPrice >= threshold;
    
    //         // Add current price as demand or supply zone if conditions are met
    //         if (demandZone || demandZoneThreshold) {
    //             zones.push({ price: currentPrice, type: 'Demand' });
    //         } else if (supplyZone || supplyZoneThreshold) {
    //             zones.push({ price: currentPrice, type: 'Supply' });
    //         }
    //     }
    
    //     return zones;
    // }

    // private calculateDemandSupplyZonesUsingCandlesticks(prices)
    // {
    //     const zones = [];
    
    //     for (let i = 2; i < prices.length - 2; i++) {
    //         const prevPrevPrice = prices[i - 2];
    //         const prevPrice = prices[i - 1];
    //         const currentPrice = prices[i];
    //         const nextPrice = prices[i + 1];
    //         const nextNextPrice = prices[i + 2];
    
    //         // Check for potential demand zone (hammer or bullish engulfing pattern)
    //         if (prevPrevPrice > prevPrice && currentPrice < prevPrice && currentPrice > nextPrice && currentPrice < nextNextPrice) {
    //             zones.push({ price: currentPrice, type: 'Demand' });
    //         }
    
    //         // Check for potential supply zone (shooting star or bearish engulfing pattern)
    //         if (prevPrevPrice < prevPrice && currentPrice > prevPrice && currentPrice < nextPrice && currentPrice > nextNextPrice) {
    //             zones.push({ price: currentPrice, type: 'Supply' });
    //         }
    //     }
    
    //     return zones;
    // }

    // private calculateDemandSupplyZonesUsingClustering(prices, numClusters = 3)
    // {
    //     // Perform K-means clustering on the price data
    //     const kmeans = new KMeans();
    //     const clusters = kmeans.cluster(prices, numClusters);
    
    //     // Calculate centroids for each cluster
    //     const centroids = clusters.map(cluster => cluster.centroid());
    
    //     // Sort centroids in ascending order
    //     centroids.sort((a, b) => a - b);
    
    //     // Identify potential demand and supply zones based on the centroids
    //     const zones = centroids.map((centroid, index) => {
    //         if (index === 0) {
    //             return { price: centroid, type: 'Demand' };
    //         } else if (index === centroids.length - 1) {
    //             return { price: centroid, type: 'Supply' };
    //         } else {
    //             // Check if centroid is closer to neighboring centroids
    //             const prevDiff = centroid - centroids[index - 1];
    //             const nextDiff = centroids[index + 1] - centroid;
    //             const type = prevDiff < nextDiff ? 'Demand' : 'Supply';
    //             return { price: centroid, type };
    //         }
    //     });
    
    //     return zones;
    // }
}