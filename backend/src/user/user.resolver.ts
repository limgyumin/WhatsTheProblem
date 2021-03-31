import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateUserInput, QueryValue, UpdateUserInput } from './dto/user.input';
import { User } from './user.entity';
import { UserService } from './user.service';
import { GetUser } from '../decorator/user.decorator';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guard/auth.guard';
import { createToken } from 'src/lib/token';
import { GitHubUser } from './dto/user.object';

@Resolver()
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => User)
  @UseGuards(AuthGuard)
  async me(@GetUser() user: User): Promise<User> {
    return user;
  }

  @Query(() => User)
  async user(@Args('idx') idx: number): Promise<User> {
    return await this.userService.user(idx);
  }

  @Query(() => [User])
  async users(@Args('option') { page, limit }: QueryValue): Promise<User[]> {
    return await this.userService.users(page, limit);
  }

  @Mutation(() => String)
  async register(@Args('user') data: CreateUserInput): Promise<string> {
    const user = await this.userService.create(data);
    return createToken(user);
  }

  @Mutation(() => GitHubUser)
  async gitHubUser(@Args('code') code: string): Promise<GitHubUser> {
    return await this.userService.gitHubUser(code);
  }

  @Mutation(() => String)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<string> {
    const user = await this.userService.match(email, password);
    return createToken(user);
  }

  @Mutation(() => User)
  @UseGuards(AuthGuard)
  async updateUser(
    @GetUser() user: User,
    @Args('user') data: UpdateUserInput,
  ): Promise<User> {
    return await this.userService.update(user, data);
  }

  @Mutation(() => User)
  @UseGuards(AuthGuard)
  async deleteUser(@GetUser() user: User) {
    return this.userService.delete(user);
  }
}
