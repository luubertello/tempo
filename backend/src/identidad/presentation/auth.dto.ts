import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RegistroDto {
  @IsString()
  @IsNotEmpty()
  email!: string; 

  @IsString()
  @MinLength(8)
  @MaxLength(72) 
  password!: string;
}

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}