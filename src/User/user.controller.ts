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
import { CreateUserDto, UserResponseDto, VerifyOtpDto, AuthResponseDto, SignupResponseDto, SendOtpDto, OtpStatusResponseDto, VerifyOtpResponseDto } from './dto/user.dto';
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
  async login(@Body() verifyOtpDto: VerifyOtpDto): Promise<AuthResponseDto> {
    return this.userService.loginUser(verifyOtpDto);
  }

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() sendOtpDto: SendOtpDto): Promise<OtpStatusResponseDto> {
    return this.userService.sendOtp(sendOtpDto);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto): Promise<VerifyOtpResponseDto> {
    return this.userService.verifyOtp(verifyOtpDto);
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

