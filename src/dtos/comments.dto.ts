import { IsString, IsNotEmpty, MaxLength, IsInt, IsOptional } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  public content: string;

  @IsInt()
  @IsNotEmpty()
  public postId: number;
}

export class UpdateCommentDto {
  @IsString()
  @IsOptional()
  @MaxLength(500)
  public content?: string;
}
