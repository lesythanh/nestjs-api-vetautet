import { IsNotEmpty, MinLength } from "class-validator";



export class LoginUserDto {
    @IsNotEmpty({message: 'username not empty' })
    accountname: string;
    @IsNotEmpty({message: 'email not empty' })
    // @MinLength(8, {message: 'password > 8 characters' })
    password: string;
}