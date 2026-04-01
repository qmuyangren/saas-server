import { IsEmail, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail({}, { message: '邮箱格式错误' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  email: string;

  @IsNotEmpty({ message: '验证码不能为空' })
  @MinLength(6, { message: '验证码长度为 6 位' })
  @MaxLength(6, { message: '验证码长度为 6 位' })
  code: string;

  @IsNotEmpty({ message: '新密码不能为空' })
  @MinLength(6, { message: '密码长度至少 6 位' })
  @MaxLength(20, { message: '密码长度最多 20 位' })
  @Matches(/.*[a-zA-Z].*\d.*|.*\d.*[a-zA-Z].*/, {
    message: '密码必须包含字母和数字',
  })
  newPassword: string;
}
