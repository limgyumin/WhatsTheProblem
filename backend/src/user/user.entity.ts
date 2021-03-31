import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ObjectType()
@Entity('user')
export class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  idx: number;

  @Field(() => String)
  @Column({
    length: 255,
    nullable: true,
  })
  avatar: string;

  @Field(() => String)
  @Column({
    length: 255,
    nullable: false,
    unique: true,
  })
  email: string;

  @Field(() => String)
  @Column({
    length: 255,
    nullable: true,
  })
  password: string;

  @Field(() => String)
  @Column({
    length: 255,
    nullable: false,
  })
  name: string;

  @Field(() => String, { nullable: true })
  @Column({
    length: 255,
    nullable: true,
  })
  bio: string;

  @Field(() => Int, { defaultValue: 0 })
  @Column({
    default: 0,
  })
  score: number;

  @Field(() => Boolean, { defaultValue: false })
  @Column({
    default: false,
  })
  is_admin: boolean;

  @Field(() => Date)
  @Column('timestamptz')
  @CreateDateColumn()
  created_at: Date;
}
