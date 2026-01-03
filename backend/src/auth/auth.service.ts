import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RbacService } from 'src/rbac/rbac.service';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private users: UserService,
    private jwt: JwtService,
    private rbac: RbacService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.users.findByEmailOrUsername(dto.identifier);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    // 2. Verify password
    const passwordMatch = await bcrypt.compare(
      dto.password,
      user.password_hash,
    );
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    // 3. Extract role names (not objects)
    const roleNames = user.roles?.map((r) => r.name) || [];

    // Update last_login_at and fetch user with relations in parallel
    const [safeUser] = await Promise.all([
      this.users.findById(user.id),
      this.users.update(user.id, { last_login_at: new Date() }),
    ]);

    const token = this.jwt.sign({
      sub: user.id,
      email: user.email,
      roles: roleNames,
    });

    // Transform branches to only include essential fields
    const optimizedBranches = safeUser.branches?.map((branch: any) => ({
      id: branch.id,
      code: branch.code,
      name: branch.name,
      is_active: branch.is_active,
    })) || [];

    return {
      statusCode: 201,
      message: 'Created successfully',
      token,
      user: {
        ...safeUser,
        branches: optimizedBranches,
      } as any,
    };
  }

  async logout(user: any) {
    return { message: 'Logged out successfully' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.users.findByEmailOrUsername(dto.email);
    if (!user) throw new BadRequestException('Email not found');

    return { message: 'Password reset email sent (stub)' };
  }
}
