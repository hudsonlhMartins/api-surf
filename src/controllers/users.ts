import { Request, Response } from 'express';
import {Controller, Get, Post} from '@overnightjs/core'
import {User} from '@src/models/user'
import { BaseController } from '.';
import AuthService from '@src/services/authServices';

@Controller('users')
export class UsersController extends BaseController{

    @Post('/')
    public async create(req:Request, res:Response):Promise<void>{
        try{
            const user = new User(req.body)
            const newUser = await user.save()
            res.status(201).send(newUser)

        }catch(err){
            this.sendCreatedUpdateErrorResponse(res, err)
        }
    }

    @Post('authenticate')
    public async authenticate(req:Request, res:Response):Promise<Response>{
        const {email, password} = req.body
        const user = await User.findOne({email})
        if(!user){
            return res.status(401).send({
                code:401,
                error: 'User not found'
            })
        }
        if(!(await AuthService.comparePassword(password, user.password))){
            return res.status(401).send({
                code:401,
                error: 'password does not match'
            })
        }
        const token = AuthService.generateToken(user.toJSON())
        return res.status(200).send({token: token})
    }
}