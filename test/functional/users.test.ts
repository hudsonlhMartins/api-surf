import { User } from "@src/models/user"

describe('Users functional tests', ()=>{
    beforeEach(async()=>{
        await User.deleteMany({})
        // Antes do test roda ele vai salva um praia no banco
      })
      
    describe('When creating a new user',()=>{
        it('Should successfully create a new user',async ()=>{
            const newUser = {
                name: 'John doe',
                email: 'john@mail.com',
                password: '123455'
            }
            const res = await global.testRequest.post('/users').send(newUser)
            expect(res.status).toBe(201)
            expect(res.body).toEqual(expect.objectContaining(newUser))
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
})