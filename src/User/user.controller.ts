import { 
  Controller, 
  Post, 
  Get, 
  Put, 
  Delete, 
  Body, 
  Param, 
  HttpCode, 
  HttpStatus,
  ValidationPipe,
  UsePipes,
  UseGuards
} from '@nestjs/common';
import { PortalUserService } from './Providers/portalUser.service';
import { CreateUserDto, UserResponseDto, LoginUserDto, AuthResponseDto, SignupResponseDto } from './dto/user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('users')
@UsePipes(new ValidationPipe({ transform: true }))
export class UserController {
  constructor(private readonly userService: PortalUserService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() createUserDto: CreateUserDto): Promise<SignupResponseDto> {
    return this.userService.createUser(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginUserDto: LoginUserDto): Promise<AuthResponseDto> {
    return this.userService.loginUser(loginUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getAllUsers(): Promise<UserResponseDto[]> {
    return this.userService.getAllUsers();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    return this.userService.findUserById(parseInt(id));
  }

  @Get('uuid/:uuid')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getUserByUuid(@Param('uuid') uuid: string): Promise<UserResponseDto> {
    return this.userService.findUserByUuid(uuid);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: Partial<CreateUserDto>
  ): Promise<UserResponseDto> {
    return this.userService.updateUser(parseInt(id), updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string): Promise<void> {
    return this.userService.deleteUser(parseInt(id));
  }
}

