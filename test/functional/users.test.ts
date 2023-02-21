import { User } from "@src/models/user"
import  AuthService  from "@src/services/authServices"

describe('Users functional tests', ()=>{
    beforeEach(async()=>{
        await User.deleteMany({})
        // Antes do test roda ele vai salva um praia no banco
      })
      
    describe('When creating a new user',()=>{
        it('Should successfully create a new user with encrypted password',async ()=>{
            const newUser = {
                name: 'John doe',
                email: 'john@mail.com',
                password: '123455'
            }
            const res = await global.testRequest.post('/users').send(newUser)
            expect(res.status).toBe(201)
            await expect(AuthService.comparePassword(newUser.password, res.body.password)).resolves.toBeTruthy()
            expect(res.body).toEqual(expect.objectContaining({
                ...newUser, 
                ...{password: expect.any(String)}
            }))
        })

        it('Should 422 when there is a validation error', async ()=>{
            const newUser = {
                email: 'john@mail.com',
                password: '123455'
            }
            const res = await global.testRequest.post('/users').send(newUser)
            expect(res.status).toBe(422)
            expect(res.body).toEqual({
                code: 422,
                error: 'User validation failed: name: Path `name` is required.'
            })
        })


        it('Should return 409 when the email already exists', async ()=>{
            const newUser = {
                name: 'John doe',
                email: 'john@mail.com',
                password: '123455'
            }

            await global.testRequest.post('/users').send(newUser)
            const res = await global.testRequest.post('/users').send(newUser)
            expect(res.status).toBe(409)
            expect(res.body).toEqual({
                code: 409,
                error: 'User validation failed: email: already exists in the database.'
            })
        })
        
    })

    describe('When authenticating  a user', ()=>{
        it('should gererate a token for a valid user', async()=>{
            const newUser = {
                name: 'John doe',
                email: 'john@mail.com',
                password: '123455'
            }   

            await new User(newUser).save()
            const res = await global.testRequest.post('/users/authenticate')
            .send({email: newUser.email, password: newUser.password})

            expect(res.body).toEqual(
                expect.objectContaining({token: expect.any(String)})
            )
        })
        it('Should return UNAUTHORIZED if the user with the given email is not found', async()=>{
            const res = await global.testRequest.post('/users/authenticate')
                .send({email: 'some-email@email.com', password: '1234'})
            
                expect(res.status).toBe(401)
        })

        it('Should return UNAUTHORIZED if the user is found but the password does not match', async()=>{
            const newUser = {
                name: 'John doe',
                email: 'john@mail.com',
                password: '123455'
            } 
            await new User(newUser).save()
            const res = await global.testRequest
                .post('/users/authenticate')
                .send({email: newUser.email, password: 'different password'})

            
            expect(res.status).toBe(401)
        })
    })
})