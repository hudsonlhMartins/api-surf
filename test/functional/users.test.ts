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
    })
})