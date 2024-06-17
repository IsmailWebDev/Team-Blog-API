import { IsString, IsNotEmpty, MaxLength, IsOptional, IsUrl } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  public title: string;

  @IsString()
  @IsNotEmpty()
  public content: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  public excerpt: string;

  @IsString()
  @IsOptional()
  public thumbnail?: string;
}

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  public title?: string;

  @IsString()
  @IsOptional()
  public content?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  public excerpt?: string;

  @IsString()
  @IsOptional()
  public thumbnail?: string;
}
