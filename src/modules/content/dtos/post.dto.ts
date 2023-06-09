// src/modules/content/dtos/post.dto.ts

import { DtoValidation } from "@/modules/core/decorators/dto-validation.decorator";
import { toBoolean } from "@/modules/core/helpters";
import { PostOrderType, SelectTrashMode } from "@/modules/database/constants";
import { PaginateOptions } from "@/modules/database/types";
import { PartialType } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsOptional, IsEnum, Min, IsNumber, MaxLength, IsNotEmpty, IsDateString, ValidateIf, IsUUID, IsDefined } from "class-validator";
import { toNumber, isNil } from 'lodash'

// 通过class-transformer导出的Transform装饰器来定义转译函数，
// 在我们的ValidationPipe管道进行验证时，一旦有Transform装饰器，
// 则会通过该装饰器自动先把该属性的值转译成需要的数据类型，然后再通过验证约束进行验证

/**
 * 文章分页查询验证
 */
@DtoValidation({ type: 'query' })
export class QueryPostDto implements PaginateOptions {
  @IsEnum(SelectTrashMode)
  @IsOptional()
  trashed?: SelectTrashMode;

  @Transform(({ value }) => toBoolean(value)) // 进行了转译
  @IsBoolean() // 验证
  @IsOptional()
  isPublished?: boolean;

  @IsEnum(PostOrderType, {
      message: `排序规则必须是${Object.values(PostOrderType).join(',')}其中一项`,
  })
  @IsOptional()
  orderBy?: PostOrderType;

  @Transform(({ value }) => toNumber(value))
  @Min(1, { message: '当前页必须大于1' })
  @IsNumber()
  @IsOptional()
  page = 1;

  @Transform(({ value }) => toNumber(value))
  @Min(1, { message: '每页显示数据必须大于1' })
  @IsNumber()
  @IsOptional()
  limit = 10;

  @IsUUID(undefined, { message: '分类ID格式错误' })
  @IsOptional()
  category?: string;
}

/**
* 文章创建验证
*/
export class CreatePostDto {
  @MaxLength(255, {
      always: true,
      message: '文章标题长度最大为$constraint1',
  })
  @IsNotEmpty({ groups: ['create'], message: '文章标题必须填写' })
  @IsOptional({ groups: ['update'] })
  title!: string;

  @IsNotEmpty({ groups: ['create'], message: '文章内容必须填写' })
  @IsOptional({ groups: ['update'] })
  body!: string;

  @MaxLength(500, {
      always: true,
      message: '文章描述长度最大为$constraint1',
  })
  @IsOptional({ always: true })
  summary?: string;

  @IsDateString({ strict: true }, { always: true })
  @IsOptional({ always: true })
  @ValidateIf((value) => !isNil(value.publishedAt))
  @Transform(({ value }) => (value === 'null' ? null : value))
  publishedAt?: Date;

  @MaxLength(20, {
      each: true,
      always: true,
      message: '每个关键字长度最大为$constraint1',
  })
  @IsOptional({ always: true })
  keywords?: string[];


  @IsUUID(undefined, {
    each: true,
    always: true,
    message: '分类ID格式不正确',
  })
  @IsOptional({ always: true })
  categories?: string[];

  @Transform(({ value }) => toNumber(value))
  @Min(0, { always: true, message: '排序值必须大于0' })
  @IsNumber(undefined, { always: true })
  @IsOptional({ always: true })
  customOrder = 0;
}

/**
* 文章更新验证
*/
export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsUUID(undefined, { groups: ['update'], message: '文章ID格式错误' })
  @IsDefined({ groups: ['update'], message: '文章ID必须指定' })
  id!: string;
}