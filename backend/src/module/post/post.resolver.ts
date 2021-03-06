import { UseGuards } from '@nestjs/common';
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Roles } from 'src/decorator/role.decorator';
import { GetUser } from 'src/decorator/user.decorator';
import { AuthGuard } from 'src/guard/auth.guard';
import { User } from 'src/module/user/user.entity';
import { Tag } from '../tag/tag.entity';
import {
  DeletePostArgs,
  GetPostArgs,
  GetPostsArgs,
  UpdatePostArgs,
} from './dto/post.args';
import { CreatePostInput } from './dto/post.input';
import { Post } from './post.entity';
import { PostService } from './post.service';

@Resolver(Post)
export class PostResolver {
  constructor(private postService: PostService) {}

  @Query(() => Post)
  async post(@Args() { url }: GetPostArgs): Promise<Post> {
    return await this.postService.post(url);
  }

  @Query(() => [Post])
  async posts(
    @Args() { postType, option: { page, limit } }: GetPostsArgs,
  ): Promise<Post[]> {
    return await this.postService.posts(page, limit, postType);
  }

  @ResolveField(() => Int)
  async commentCount(@Parent() parent: Post): Promise<number> {
    return await this.postService.commentCount(parent.idx);
  }

  @ResolveField(() => [Tag])
  async tags(@Parent() parent: Post): Promise<Tag[]> {
    return await this.postService.tags(parent.idx);
  }

  @ResolveField(() => Int)
  async likeCount(@Parent() parent: Post): Promise<number> {
    return await this.postService.likeCount(parent.idx);
  }

  @ResolveField(() => String)
  thumbnail(@Parent() parent: Post): string {
    return this.postService.thumbnail(parent.thumbnail);
  }

  @Mutation(() => Post)
  @Roles('Client')
  @UseGuards(AuthGuard)
  async createPost(
    @GetUser() user: User,
    @Args('post') data: CreatePostInput,
  ): Promise<Post> {
    return await this.postService.create(data, user);
  }

  @Mutation(() => Post)
  @Roles('Client')
  @UseGuards(AuthGuard)
  async updatePost(
    @GetUser() user: User,
    @Args() { uuid, post }: UpdatePostArgs,
  ) {
    return await this.postService.update(uuid, post, user);
  }

  @Mutation(() => Post)
  @Roles('Client')
  @UseGuards(AuthGuard)
  async deletePost(@GetUser() user: User, @Args() { uuid }: DeletePostArgs) {
    return await this.postService.delete(uuid, user);
  }
}
