import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { fileURLToPath } from 'url';
import { FileInterceptor } from '@nestjs/platform-express';
import { storage } from './oss';
import * as path from 'path';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  //for upload avatar
  @Post('upload/avt')
  @UseInterceptors(FileInterceptor('file', {
    dest: 'uploads/avatars',
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 3, // 3MB
    },
    fileFilter: (req, file, cb) => {
      const extName = path.extname(file.originalname);
      if(['.jpg', '.jpeg', '.png', '.gif'].includes(extName)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('upload file error'), false);
      }
    },
  }))

  uploadFile(@UploadedFile() file: Express.Multer.File ) {
    console.log('upload file------->', file.path);
    
    return file.path;
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    console.log( loginUserDto);
    
    return this.userService.login(loginUserDto);
  }

  @Post('new')
  register(@Body() registerUserDto: RegisterUserDto) {
    console.log( registerUserDto);
    
    return this.userService.register(registerUserDto);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
