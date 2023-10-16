import { Injectable } from "@nestjs/common"
import axios from "axios"
import PriceKlineModel from "commons/models/price/PriceKlineModel.dto"
import PriceModel from "commons/models/price/PriceModel.dto"

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
        "5m": PriceMineBinanceService.INTERVAL_1S * 60 * 5,
        "15m": PriceMineBinanceService.INTERVAL_1S * 60 * 15,
        "1h": PriceMineBinanceService.INTERVAL_1S * 60 * 60,
        "1d": PriceMineBinanceService.INTERVAL_1S * 60 * 60 * 24
    }
    // 1s, 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M

    async getPrice(symbol: string) : Promise<PriceModel>
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

    async getMostRecentKlines(symbol: string, interval: string, limit: number = 1) : Promise<PriceKlineModel[]>
    {
        const params = {
            symbol,
            interval,
            limit
        }
        const response = await axios.get(PriceMineBinanceService.API_URL, { params })
        return this.processKlines(symbol, interval, response.data)
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
        const klines = this.processKlines(symbol, interval, response.data)
        return klines
    }

    private processTicker(json: any) : PriceModel
    {
        return {
            'tokenPair': json.symbol,
            'price': json.lastPrice,
            'interval': '1s',
            'timestamp': json.closeTime
        } as PriceModel
    }

    private processKlines(tokenPair: string, interval: string, json: any) : PriceKlineModel[]
    {
        const klines : PriceKlineModel[] = []
        for (const vals of json){
            klines.push({
                tokenPair,
                interval,
                timestamp: parseFloat(vals[0]),
                price_open: vals[1],
                price_high: vals[2],
                price_low: vals[3],
                price: vals[4],
                volume: vals[5],
                timestamp_close: parseFloat(vals[6]),
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
