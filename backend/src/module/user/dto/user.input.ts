import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field(() => String, {
    nullable: true,
  })
  readonly avatar: string;

  @Field(() => String)
  readonly name: string;

  @Field(() => String)
  readonly email: string;

  @Field(() => String)
  readonly password: string;

  @Field(() => String)
  readonly bio: string;
}

@InputType()
export class UpdateUserInput {
  @Field(() => String, {
    nullable: true,
  })
  readonly avatar: string;

  @Field(() => String, {
    nullable: true,
  })
  readonly name: string;

  @Field(() => String, {
    nullable: true,
  })
  readonly password: string;

  @Field(() => String, {
    nullable: true,
  })
  readonly bio: string;
}

@InputType()
export class UserQueryValue {
  @Field(() => Int)
  readonly page: number;

  @Field(() => Int)
  readonly limit: number;
}
