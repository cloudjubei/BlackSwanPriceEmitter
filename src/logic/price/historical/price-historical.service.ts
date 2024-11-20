import { Injectable } from '@nestjs/common'
import PriceKlineModel from 'commons/models/price/PriceKlineModel.dto'
import PriceKlineWithIndicatorsModel from 'commons/models/price/PriceKlineWithIndicatorsModel.dto'
import { IndicatorsCoreService } from 'logic/indicators/core/inidicators-core.service'
import { PriceMineBinanceService } from '../mines/price-mine-binance.service'
import StorageUtils from 'commons/lib/storageUtils'

@Injectable()
export class PriceHistoricalService
{
    constructor(
        private readonly indicatorsCoreService: IndicatorsCoreService,
        private readonly priceMineBinanceService: PriceMineBinanceService
    ){}

    hasSetup = false

    onApplicationBootstrap()
    {
        this.setup()
    }

    private async setup()
    {
        if (this.hasSetup) { return }

        console.log(`PriceHistoricalService setup ${Date.now()}`)

        // await this.getPricesWithIndicators("BTCUSDT", "1m", 2023, 11)
        // await this.getPricesWithIndicators("BTCUSDT", "1m", 2023, 10)
        // await this.getPricesWithIndicators("BTCUSDT", "1h", 2023, 11)
        await this.getPricesWithIndicators("BTCUSDT", "1h", 2023, 10)
        await this.getPricesWithIndicators("BTCUSDT", "1h", 2023, 9)
        // await this.getPricesWithIndicators("BTCUSDT", "1h", 2023, 8)
        // await this.getPricesWithIndicators("BTCUSDT", "1h", 2023, 7)
        // await this.getPricesWithIndicators("BTCUSDT", "1h", 2023, 6)
        // await this.getPricesWithIndicators("BTCUSDT", "1h", 2023, 5)
        // await this.getPricesWithIndicators("BTCUSDT", "1h", 2023, 4)
        // await this.getPricesWithIndicators("BTCUSDT", "1h", 2023, 3)
        // await this.getPricesWithIndicators("BTCUSDT", "1h", 2023, 2)
        // await this.getPricesWithIndicators("BTCUSDT", "1h", 2023, 1)
        // await this.getPricesWithIndicators("BTCUSDT", "1h", 2022, 12)
        await this.getPricesWithIndicators("BTCUSDT", "1d", 2023, 10)
        await this.getPricesWithIndicators("BTCUSDT", "1d", 2023, 9)
        // await this.getPricesWithIndicators("BTCUSDT", "1d", 2023, 8)
        // await this.getPricesWithIndicators("BTCUSDT", "1d", 2023, 7)
        // await this.getPricesWithIndicators("BTCUSDT", "1d", 2023, 6)
        // await this.getPricesWithIndicators("BTCUSDT", "1d", 2023, 5)
        // await this.getPricesWithIndicators("BTCUSDT", "1d", 2023, 4)
        // await this.getPricesWithIndicators("BTCUSDT", "1d", 2023, 3)
        // await this.getPricesWithIndicators("BTCUSDT", "1d", 2023, 2)
        // await this.getPricesWithIndicators("BTCUSDT", "1d", 2023, 1)
        // await this.getPricesWithIndicators("BTCUSDT", "1d", 2022, 12)

        this.hasSetup = true

        console.log(`PriceHistoricalService done`)
    }

    async getPrices(tokenPair: string, interval: string, year: number, month: number) : Promise<PriceKlineModel[]>
    {
        const path = "./raw/prices/" + tokenPair + "/" + interval
        const filename = year + "-" + month + ".json"
        const filepath = path + "/" + filename

        if (StorageUtils.checkIfFileOrDirectoryExists(filepath)){
            const file = StorageUtils.getFile(filepath)
            const prices = JSON.parse(file) as PriceKlineModel[]
            return prices
        }

        const startDate = Date.UTC(year, month - 1)
        const endDate = Date.UTC(year, month) - 1

        const prices = await this.priceMineBinanceService.getFullTimeSeriesData(tokenPair, interval, startDate, endDate)

        StorageUtils.createOrWriteToFile(path, filename, JSON.stringify(prices))

        return prices
        // @ApiProperty() price_open: string = "0"
        // @ApiProperty() price_low: string = "0"
        // @ApiProperty() price_high: string = "0"
        // @ApiProperty() price: string = "0"
        // @ApiProperty() volume: string = "0"
    }

    async getPricesWithIndicators(tokenPair: string, interval: string, year: number, month: number) : Promise<PriceKlineWithIndicatorsModel[]>
    {
        const file = await this.getFile(tokenPair, interval, year, month)

        if (file) { return JSON.parse(file) as PriceKlineWithIndicatorsModel[] }

        const prevYear = month == 1 ? year - 1 : year
        const prevMonth = month == 1 ? 12 : month - 1

        const pricesPrev = await this.getPrices(tokenPair, interval, prevYear, prevMonth)
        const prices = await this.getPrices(tokenPair, interval, year, month)

        const indicators = await this.indicatorsCoreService.processPrices(tokenPair, interval, pricesPrev.concat(prices), prices.length)

        const priceIndicators = prices.map((price, index) => { return { ...price, indicators: indicators[index].indicators } as PriceKlineWithIndicatorsModel })

        this.saveFile(tokenPair, interval, year, month, priceIndicators)
    }

    private async getFile(tokenPair: string, interval: string, year: number, month: number) : Promise<string | undefined>
    {
        const filename = "./raw/indicators/" + tokenPair + "/" + interval + "/" + tokenPair + "-" + interval + "-" + year + "-" + month + ".json"

        if (StorageUtils.checkIfFileOrDirectoryExists(filename)){
            const file = StorageUtils.getFile(filename)
            return file
        }
    }
    private saveFile(tokenPair: string, interval: string, year: number, month: number, indicators: PriceKlineWithIndicatorsModel[])
    {
        const path = "./raw/indicators/" + tokenPair + "/" + interval
        const filename = tokenPair + "-" + interval + "-" + year + "-" + month + ".json"

        const smallIndicators = []
        
        for(const indicator of indicators){
            const smallIndicator = { ...indicator }
            delete smallIndicator.tokenPair
            delete smallIndicator.interval
            smallIndicators.push(smallIndicator)
        }

        StorageUtils.createOrWriteToFile(path, filename, JSON.stringify(smallIndicators))
    }
}
