import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  email: string;

  @IsNotEmpty({ message: '密码不能为空' })
  @IsString()
  @MinLength(6, { message: '密码至少 6 位' })
  password: string;

  @IsOptional()
  @IsString()
  role?: string;
}
