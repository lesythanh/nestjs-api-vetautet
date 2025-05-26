import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { User } from './entities/user.entity';
import { DbService } from 'src/db/db.service';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UserService {

  @Inject(DbService)
  dbService: DbService;

//login
  async login(loginUserDto: LoginUserDto) {
    const users: User[] = await this.dbService.read();

    //check if user already exists
    const userExists = users.find((user) => user.accountname === loginUserDto.accountname);
    if (!userExists) {
      throw new BadRequestException ('login failed');
    }

    //check if password is correct
    if (userExists.password !== loginUserDto.password) {
      throw new BadRequestException (`login failed`);
    }

    return userExists;
  }

  async register(registerUserDto: RegisterUserDto) {

    const users: User[] = await this.dbService.read();

    //check if user already exists
    const userExists = users.find((user) => user.accountname === registerUserDto.accountname);
    if (userExists) {
      throw new BadRequestException (`User ${registerUserDto.accountname} already exists`);
    }

    const user = new User();
    user.accountname = registerUserDto.accountname;
    user.password = registerUserDto.password;

    //push
    users.push(user);

    //save user to db
    await this.dbService.write(users);
    return user;

  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
