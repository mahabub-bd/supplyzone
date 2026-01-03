import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorator/public.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private service: AuthService) {}
  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login with email or username' })
  @ApiBody({ type: LoginDto })
  login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    return this.service.login(dto);
  }
  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Request password reset email' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.service.resetPassword(dto);
  }
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({ summary: 'Logout (invalidate token)' })
  @ApiBearerAuth('token')
  logout(@Req() req) {
    return this.service.logout(req.user);
  }
}
