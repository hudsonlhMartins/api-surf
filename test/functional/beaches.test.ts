import { Beach } from "@src/models/beach"
import { User } from "@src/models/user"
import AuthService from "@src/services/authServices"

describe("Beaches  functional tests",()=>{
    const defaultUser = {
        name: 'John doe',
        email: 'john@mail.com',
        password: '123455'
    }

    let token: String
    beforeEach(async()=> {
        await Beach.deleteMany({})
        await User.deleteMany({})
        const user = await  new User(defaultUser).save()
        token = AuthService.generateToken(user.toJSON())

    })
    describe("When creating a beach",()=>{
      
        it("Should create a beach with success", async()=>{
            const newBeach = {
                lat: -33.292726,
                lng:151.289824,
                name: 'Manly',
                position: 'E'
            }

            const res = await global.testRequest
                .post('/beaches')
                .set({'x-access-token': token})
                .send(newBeach)

            expect(res.status).toBe(201)
            expect(res.body).toEqual(expect.objectContaining(newBeach))
        })

        it('Should return 422 when there is a validation error', async()=>{
            const newBeach = {
                lat: 'invalid_string',
                lng:151.289824,
                name: 'Manly',
                position: 'E'
            }
            const res = await global.testRequest.post('/beaches')
                .set({'x-access-token': token})
                .send(newBeach)

            expect(res.status).toBe(422)
            expect(res.body).toEqual({
                error:
                'Beach validation failed: lat: Cast to Number failed for value "invalid_string" (type string) at path "lat"'
            })
        })
    })
})