import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNewsDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  @IsString()
  news_url : string;
}

export class UpdateNewsDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  news_url : string;
}

export class NewsResponseDto {
  id: number;
  title: string;
  image: string;
  created_at: Date;
  news_url : string;
}
