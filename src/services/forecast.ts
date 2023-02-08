import { ForecastPoint, StormGlass } from "@src/clients/stormGlass";
import { InternalError } from "@src/util/erros/internal-error";

export enum BeachePosition{
    S= 'S',
    E= 'E',
    N= 'N',
    W= 'W'
}

export interface Beache{
    lat: number,
    lng: number,
    name: string,
    position: BeachePosition,
    user: string,
}
export interface BeacheForecast extends Omit<Beache, 'user'>, ForecastPoint{} 

export class ForecastProccessingInternalError extends InternalError{
    constructor(message:string){
        super(`Unexpected error during the forecast processing: ${message}`)

    }
}

export class Forecast{
    constructor(protected stormGlass = new StormGlass()){}

    public async processForecastForBeaches(beaches:Beache[]): Promise<BeacheForecast[]>{
        const pointsWithCorrectSources:BeacheForecast[] = []
        
        try{

            for(const beach of beaches){
                const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng)
                const enrichedBeachData = this.enrichedBeachData(points, beach)
                pointsWithCorrectSources.push(...enrichedBeachData)
            }
            
    
            return pointsWithCorrectSources
        }catch(err:any){
            throw new ForecastProccessingInternalError(err.message)
        }
    } 
    
    private enrichedBeachData(points:ForecastPoint[], beach: Beache): BeacheForecast[]{
        return points.map(item=>{
            return({
                lat: beach.lat,
                lng: beach.lng,
                name: beach.name,
                position: beach.position,
                rating: 1,
                ...item
            })
        })
    }
}