import { IsEmail, IsString, MinLength, MaxLength, IsBoolean, IsOptional } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: '邮箱格式不正确' })
  email!: string;

  @IsString()
  @MinLength(6, { message: '密码长度至少 6 位' })
  @MaxLength(20, { message: '密码长度最多 20 位' })
  password!: string;

  @IsBoolean()
  @IsOptional()
  rememberMe?: boolean = false;
}
