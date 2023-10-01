import { Injectable } from "@nestjs/common"
import PriceKlineModel from "src/models/price/PriceKlineModel.dto"
import axios from "axios"
import TokenPriceTimeModel from "src/models/price/TokenPriceTimeModel.dto"

@Injectable()
export class PriceMineBinanceService
{
    static API_URL_PRICE = "https://api.binance.com/api/v3/ticker"

    static API_URL = "https://api.binance.com/api/v3/klines"
    static API_URL_ALT = "https://data-api.binance.vision/api/v3/klines"
    static INTERVAL_1S = 1000
    static INTERVALS = {
        "1s": PriceMineBinanceService.INTERVAL_1S,
        "1m": PriceMineBinanceService.INTERVAL_1S * 60,
        "1h": PriceMineBinanceService.INTERVAL_1S * 60 * 60,
        "1d": PriceMineBinanceService.INTERVAL_1S * 60 * 60 * 24
    }

    async getPrice(symbol: string) : Promise<TokenPriceTimeModel>
    {
        const params = {
            symbol
        }
        try{
            const response = await axios.get(PriceMineBinanceService.API_URL_PRICE, { params })
            return this.processTicker(response.data)
        }catch(error){
            console.log(error)
        }
    }

    getIntervalTime(interval: string, multiplier: number = 1) : number
    {
        return PriceMineBinanceService.INTERVALS[interval] * multiplier
    }

    async getTimeSeriesData(symbol: string, interval: string, startTime: number, endTime: number, limit: number = 1000) : Promise<PriceKlineModel[]>
    {
        const params = {
            symbol,
            interval,
            startTime,
            endTime,
            limit
        }
        const response = await axios.get(PriceMineBinanceService.API_URL, { params })
        const klines = this.processKlines(response.data)
        return klines
    }

    private processTicker(json: any) : TokenPriceTimeModel
    {
        return {
            'tokenPair': json.symbol,
            'price': json.lastPrice,
            'timestamp': json.closeTime
        } as TokenPriceTimeModel
    }

    private processKlines(json: any) : PriceKlineModel[]
    {
        const klines : PriceKlineModel[] = []
        for (const vals in json){
            klines.push({
                timestamp_open: vals[0],
                price_open: vals[1],
                price_high: vals[2],
                price_low: vals[3],
                price_close: vals[4],
                volume: vals[5],
                timestamp_close: vals[6],
                asset_volume_quote: vals[7],
                trades_number: vals[8],
                asset_volume_taker_base: vals[9],
                asset_volume_taker_quote: vals[10],
            } as PriceKlineModel)
        }
        return klines
    }
}


// def mineData(folder: str, name: str, symbol: str, interval: str = "1m"):
//     symbol_data = getSymbolData(folder, symbol)
//     start_time = symbol_data["startTime"]
//     end_time = time.time() * 1000

//     current_time = start_time
//     window_time = getIntervalTime(interval)
//     interval_time = getIntervalTime(interval, 1000)
//     requests_per_min = 1000

//     requests = 0
//     results = []
//     while current_time < end_time:
//         new_end_time = current_time + interval_time
//         result = getTimeSeriesData(symbol, interval, current_time, new_end_time - window_time)
//         results += result
//         current_time = new_end_time
//         requests += 1
//         if requests >= requests_per_min:
//             requests = 0
//             print(f"DONE {requests_per_min} reqs - sleeping at {time.time()}")
//             time.sleep(61)


//     f = open(f"{folder}/{name}_{symbol}_{interval}.json", "w")
//     f.write(json.dumps(results))
//     f.close()
