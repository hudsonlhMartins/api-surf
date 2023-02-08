import { InternalError } from "@src/util/erros/internal-error";
//import { AxiosStatic } from "axios";
// 15e63a7c-9866-11ed-a654-0242ac130002-15e63aea-9866-11ed-a654-0242ac130002
import * as HTTPUtil from '@src/util/request' 
import config, {IConfig} from 'config'

export interface StormGlassPointSource{
    [key:string]: number
}

export interface StormGlassPoint{
    time: string
    swellDirection: StormGlassPointSource
    swellHeight: StormGlassPointSource
    swellPeriod: StormGlassPointSource
    waveDirection: StormGlassPointSource
    waveHeight: StormGlassPointSource
    windDirection: StormGlassPointSource
    windSpeed: StormGlassPointSource
}

export interface StormGlassForecastResponse{
    hours: StormGlassPoint[]
}
export interface ForecastPoint{
    time: string
    swellDirection: number
    swellHeight: number
    swellPeriod: number
    waveDirection: number
    waveHeight: number
    windDirection: number
    windSpeed: number
}

export class ClientRquestError extends InternalError{
    constructor(message:string){
        const internalMessage = 'Unexpected error when trying to communicate to StormGlass'
        super(`${internalMessage}: ${message}`)
    }
}

export class StormGlassResponseError extends InternalError{
    constructor(message:string){
        const internalMessage = 'Unexpected error returned by the StormGlass service'
        super(`${internalMessage}: ${message}`)
    }
}

const stormGlassResourceConfig:IConfig = config.get('App.resources.StormGlass')

export class StormGlass{
    readonly stormGlassAPIParms = 'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed'
    readonly stormGlassAPISource = 'noaa'
    constructor(protected request = new HTTPUtil.Request()){

    }

    public async fetchPoints(lat:number, lng:number): Promise<ForecastPoint[]>{
        
        try{
            const res = await this.request.get<StormGlassForecastResponse>(
                `${stormGlassResourceConfig.get('apiUrl')}/weather/point?lat=${lat}&lng=${lng}&params=${this.stormGlassAPIParms}&source=${this.stormGlassAPISource}`,
                {
                    headers:{
                        Authorization: stormGlassResourceConfig.get('apiToken')

                    }
                }
                )
                
            return this.normalizeResponse(res.data)

        }catch(err:any){
            if(HTTPUtil.Request.isRequestError(err)){
                throw new StormGlassResponseError(`Error: ${JSON.stringify(err.response.data)} code: ${err.response.status}`)
            }
            throw new ClientRquestError(`${err.message}`)
        }
    }

    private normalizeResponse (points:StormGlassForecastResponse):ForecastPoint[]{
        return points.hours.filter(this.isValidPoint.bind(this)).map(item => ({
            swellDirection: item.swellDirection[this.stormGlassAPISource],
            swellHeight: item.swellHeight[this.stormGlassAPISource],
            swellPeriod: item.swellPeriod[this.stormGlassAPISource],
            time: item.time,
            waveDirection: item.waveDirection[this.stormGlassAPISource],
            waveHeight: item.waveHeight[this.stormGlassAPISource],
            windDirection: item.windDirection[this.stormGlassAPISource],
            windSpeed: item.windSpeed[this.stormGlassAPISource]
        }))
    }
    private isValidPoint (point: Partial<StormGlassPoint>): boolean{
        return !!(
            point.time &&
            point.swellDirection?.[this.stormGlassAPISource] &&
            point.swellHeight?.[this.stormGlassAPISource] &&
            point.swellPeriod?.[this.stormGlassAPISource] &&
            point.waveDirection?.[this.stormGlassAPISource] &&
            point.waveHeight?.[this.stormGlassAPISource] &&
            point.windDirection?.[this.stormGlassAPISource] &&
            point.windSpeed?.[this.stormGlassAPISource]
        )
    }
}