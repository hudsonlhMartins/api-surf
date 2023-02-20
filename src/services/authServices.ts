import bcrypt from 'bcrypt'


export default class AuthService {
    
   public static async  hashPassword(password:string, salt = 10): Promise<string> {
        return await bcrypt.hash(password, salt)
    }
    
    public static async comparePassword(password: string, hashedPassword:string):Promise<Boolean> {
          return await bcrypt.compare(password, hashedPassword)
    }
}