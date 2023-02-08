import {StormGlass} from '@src/clients/stormGlass'
import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3.json'
import stormglass_normalize_weather from '@test/fixtures/stormglass_normalize_weather_3.json'
import axios from 'axios'
import * as HTTPUtil from '@src/util/request'

jest.mock('@src/util/request')

describe('StormGlass client', ()=>{
    const MockedRquestClass = HTTPUtil.Request as jest.Mocked<typeof HTTPUtil.Request>

    const mockedRequest = new HTTPUtil.Request() as jest.Mocked<HTTPUtil.Request>
    // esse as força o ts inserir esse tipe usamos ele no nosso test
    it('should return the normalized forecast from the StormGlass service', async()=>{
        const lat = -33.9039
        const lng = 151.98273
        mockedRequest.get.mockResolvedValue({data:stormGlassWeather3HoursFixture} as HTTPUtil.Response)
        const stormGlass = new StormGlass(mockedRequest)
        const res = await stormGlass.fetchPoints(lat, lng)
        expect(res).toEqual(stormglass_normalize_weather)
    })

    it('should exclude incomplete data points', async()=>{
        const lat = -33.9039
        const lng = 151.98273
        const incompleteRes = {
            hours:[
                {
                    windDirection:{
                        noaa: 300
                    },
                    time: "2020-03-26T00:00:00+00:00",
                }
            ]
        }
        mockedRequest.get.mockResolvedValue({data:incompleteRes} as HTTPUtil.Response)
        const stormGlass = new StormGlass(mockedRequest)
        const res = await stormGlass.fetchPoints(lat, lng)
        expect(res).toEqual([])
    })

    it('should get a genericerror from StormGlass service when the request fail before reachingthe service', async()=>{
        const lat = -33.9039
        const lng = 151.98273
      
        mockedRequest.get.mockRejectedValue({message: 'Network Error'})
        const stormGlass = new StormGlass(mockedRequest)
        await expect(stormGlass.fetchPoints(lat,lng)).rejects.toThrow(
            'Unexpected error when trying to communicate to StormGlass: Network Error'
        )
    })

    it('should get an StormGlassResponseError when the StormGlass service responds with error', async()=>{
        const lat = -33.9039
        const lng = 151.98273
        
        MockedRquestClass.isRequestError.mockReturnValue(true)
        mockedRequest.get.mockRejectedValue({
            response:{
                status: 429,
                data:{errors: ['Rate Limit reached']}
            }
        })
        const stormGlass = new StormGlass(mockedRequest)
        await expect(stormGlass.fetchPoints(lat,lng)).rejects.toThrow(
            'Unexpected error returned by the StormGlass service: Error: {"errors":["Rate Limit reached"]} code: 429'
        )
    })
})