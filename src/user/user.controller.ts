import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException, UploadedFiles, Query, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { fileURLToPath } from 'url';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { storage } from './oss';
import * as path from 'path';
import * as fs from "fs"
import { Response } from 'express';
import { MyLogger } from 'src/logger/my.logger';

@Controller('user')
export class UserController {

  private logger = new MyLogger();
  constructor(private readonly userService: UserService) { }

  @Get('merge/file')
  mergeFile(@Query("file") fileName: string, @Res() res: Response) {

    const nameDir = 'uploads/' + fileName;

    //1 check dir
    if (!fs.existsSync(nameDir)) {
      throw new BadRequestException('file not found');
    }

    //2 read dir
    const files = fs.readdirSync(nameDir);

    let startPos = 0, countFile = 0;

    files.map(file => {
      //get file path
      const filePath = nameDir + '/' + file;
      console.log('filePath |', filePath);

      const streamFile = fs.createReadStream(filePath);
      streamFile.pipe(fs.createWriteStream('uploads/merge/' + fileName, {
        start: startPos
      })).on('finish', () => {
        countFile++;
        console.log('count File |', countFile);
        if (files.length === countFile) {
          fs.rm(nameDir, { recursive: true }, () => { });
        }
      });

      startPos += fs.statSync(filePath).size;
    })

    return res.json({
      link: `http://localhost:3000/uploads/merge/${fileName}`,
      fileName
    })

  }

  //for upload avatar
  @Post('upload/large-file')
  @UseInterceptors(FilesInterceptor('files', 20, {
    dest: 'uploads',
  }))
  uploadLargeFile(@UploadedFiles() files: Array<Express.Multer.File>, @Body() body: { name: string }) {
    console.log('upload file body |', body);
    console.log('upload files |', files);

    const fileName = body.name.match(/(.+)-\d+$/)?.[1] ?? body.name;
    const nameDir = 'uploads/chunks-' + fileName;

    //2 mkdir
    if (!fs.existsSync(nameDir)) {
      fs.mkdirSync(nameDir);
    }

    //3 cp
    fs.cpSync(files[0].path, nameDir + '/' + body.name);

    //4 delete temp file
    fs.rmSync(files[0].path);
  }

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
      if (['.jpg', '.jpeg', '.png', '.gif'].includes(extName)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('upload file error'), false);
      }
    },
  }))

  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log('upload file------->', file.path);

    return file.path;
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    console.log(loginUserDto);

    return this.userService.login(loginUserDto);
  }

  @Post('new')
  register(@Body() registerUserDto: RegisterUserDto) {
    // console.log(registerUserDto);
    this.logger.log('Register User', registerUserDto.accountname);

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
