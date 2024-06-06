import { BadRequestException, Injectable } from '@nestjs/common';
import { DrizzleService } from 'src/database/drizzle.service';
import { HashingService } from './hashing.service';
import { users } from 'src/database/database-schema';
import { eq } from 'drizzle-orm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from '../dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly hashingService: HashingService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    // find the user by email
    const [user] = await this.drizzleService.db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    // check if the password matches
    const isPasswordValid = await this.hashingService.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    delete user.password;
    return user;
  }

  async signUp(signUpDto: SignUpDto) {
    const hashedPassword = await this.hashingService.hash(signUpDto.password);

    // check if the email is already used
    const [userWithEmail] = await this.drizzleService.db
      .select()
      .from(users)
      .where(eq(users.email, signUpDto.email));

    if (userWithEmail) {
      throw new BadRequestException('Email already used');
    }

    // create new user
    const [user] = await this.drizzleService.db
      .insert(users)
      .values({
        ...signUpDto,
        password: hashedPassword,
      })
      .returning();

    delete user.password;
    return user;
  }

  private async signToken<T>(userId: number, payload?: T) {
    return this.jwtService.signAsync({
      sub: userId,
      ...payload,
    });
  }

  async generateTokens(userId: number) {
    const [user] = await this.drizzleService.db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    const [accessToken] = await Promise.all([
      await this.signToken(user.id, {
        email: user.email,
      }),
    ]);
    return {
      accessToken,
    };
  }
}
