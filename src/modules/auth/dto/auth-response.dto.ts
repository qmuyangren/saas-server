export class AuthResponseDto {
  code: number;
  message: string;
  data: {
    token: string;
    expiresIn: number;
    user: {
      id: number;
      email: string;
      role: string;
      createdAt: Date;
    };
  };
}
