import { IsEmail, IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  public email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(9)
  @MaxLength(32)
  public password: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  public username: string;
}

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(9)
  @MaxLength(32)
  public password: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  public username: string;

  @IsString()
  @MaxLength(200)
  public bio?: string;

  @IsString()
  public profilePic?: string;
}
