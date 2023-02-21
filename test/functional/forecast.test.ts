import { Beach, BeachePosition } from "@src/models/beach";
import stormglass_weather_3 from '@test/fixtures/stormglass_weather_3.json'
import api_forecast_response_1_beach from "@test/fixtures/api_forecast_response_1_beach.json"
import nock from 'nock'
import { User } from "@src/models/user";
import AuthService from "@src/services/authServices";

describe('Beach forecast functional tests', () => {
  const defaultUser = {
    name: 'John doe',
    email: 'john@mail.com',
    password: '123455'
  }
  let token: String
  beforeEach(async()=>{
    await Beach.deleteMany({})
    await User.deleteMany({})
    const user = await  new User(defaultUser).save()
    const defaultBeach = {
      lat: -33.292726,
      lng:151.289824,
      name: 'Manly',
      position: BeachePosition.E,
      user: user.id
    }
    await new Beach(defaultBeach).save()
    
    token = AuthService.generateToken(user.toJSON())

    // Antes do test roda ele vai salva um praia no banco
  })
  afterEach(()=>{
    nock.restore()
  })

  it('should return a forecast with just a few times', async () => {
    // nock.recorder.rec()
    nock('https://api.stormglass.io:443', {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: (): boolean => true,
      },
    })
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .get('/v2/weather/point')
      .query({"lat":"-33.292726","lng":"151.289824","params":"swellDirection%2CswellHeight%2CswellPeriod%2CwaveDirection%2CwaveHeight%2CwindDirection%2CwindSpeed","source":"noaa"})
      .reply(200, stormglass_weather_3);

    const { body, status } = await global.testRequest
      .get('/forecast')
      .set({'x-access-token': token})
    // console.log(body)
    expect(status).toBe(200);
    // Make sure we use toEqual to check value not the object and array itself
    expect(body).toEqual(api_forecast_response_1_beach);
  });

  it('should return 500 if something goes wrong during the processing', async () => {
    nock('https://api.stormglass.io:443', {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: (): boolean => true,
      },
    })
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .get('/v1/weather/point')
      .query({ lat: '-33.792726', lng: '151.289824' })
      .replyWithError('Something went wrong')

    const { status } = await global.testRequest
      .get(`/forecast`)
      .set({'x-access-token': token})

    expect(status).toBe(500);
    
  });
});