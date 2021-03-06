import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserType } from 'src/enum/user.enum';
import { IGitHubUser } from 'src/lib/github/github.interface';
import { GitHubLib } from 'src/lib/github/github.lib';
import { Mailer } from 'src/module/mailer/mailer.entity';
import { MailerRepository } from 'src/module/mailer/mailer.repository';
import { Post } from '../post/post.entity';
import { PostRepository } from '../post/post.repository';
import { Question } from '../question/question.entity';
import { QuestionRepository } from '../question/question.repository';
import {
  CreateUserInput,
  GitHubUserInput,
  UpdateUserInput,
} from './dto/user.input';
import { User } from './user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private mailerRepository: MailerRepository,
    private postRepository: PostRepository,
    private questionRepository: QuestionRepository,
    private gitHubLib: GitHubLib,
  ) {}

  async create(data: CreateUserInput): Promise<User> {
    const mailer: Mailer = await this.mailerRepository.findOneByEmail(
      data.email,
    );

    if (!mailer || !mailer.isVerified) {
      throw new UnauthorizedException('Unverified email.');
    }

    const existUser: User = await this.userRepository.findOneById(data.id);

    if (existUser) {
      throw new ConflictException('User already exist.');
    }

    await mailer.remove();

    return await this.userRepository.create(data).save();
  }

  async update(user: User, data: UpdateUserInput): Promise<User> {
    user.avatar = data.avatar || user.avatar;
    user.name = data.name || user.name;
    user.password = data.password || user.password;
    user.bio = data.bio || user.bio;

    return await this.userRepository.save(user);
  }

  async delete(user: User): Promise<User> {
    return await this.userRepository.remove(user);
  }

  async match(email: string, password: string): Promise<User> {
    const user: User = await this.userRepository.findOneByEmailAndPassword(
      email,
      password,
    );

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  async user(idx: number): Promise<User> {
    const user: User = await this.userRepository.findOneByIdx(idx);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  async users(
    page: number,
    limit: number,
    userType: UserType,
  ): Promise<User[]> {
    if (page < 1 || limit < 1) {
      throw new BadRequestException('Invalid page or limit.');
    }

    let users: User[] = [];

    switch (userType) {
      case UserType.CreatedAt:
        users = await this.userRepository.findAllOrderByCreatedAtASC(
          page,
          limit,
        );
        break;
      case UserType.Score:
        users = await this.userRepository.findAllOrderByScoreDESC(page, limit);
        break;
    }

    return users;
  }

  async posts(userIdx: number, page: number, limit: number) {
    const posts: Post[] = await this.postRepository.findAllWithUserByUserIdxOrderByCreatedAtASC(
      page,
      limit,
      userIdx,
      false,
    );

    return posts;
  }

  async questions(
    userIdx: number,
    page: number,
    limit: number,
  ): Promise<Question[]> {
    const questions: Question[] = await this.questionRepository.findAllWithUserByUserIdxOrderByCreatedAtASC(
      page,
      limit,
      userIdx,
      false,
    );

    return questions;
  }

  async gitHubUser(code: string): Promise<User> {
    const accessToken: string = await this.gitHubLib.getGitHubAccessToken(code);

    const gitHubUser: User = await this.gitHubLib.getGitHubUser(accessToken);

    if (gitHubUser === null) {
      throw new NotFoundException('User not found.');
    }

    const existUser: User = await this.userRepository.findOneByGitHubId(
      gitHubUser.gitHubId,
    );

    if (existUser) {
      return existUser;
    }

    gitHubUser.isNew = true;

    return gitHubUser;
  }

  async gitHubAuth(data: GitHubUserInput): Promise<User> {
    const existUser: User = await this.userRepository.findOneById(data.id);

    if (existUser) {
      throw new ConflictException('User already exist.');
    }

    return await this.userRepository.create(data).save();
  }

  async findUserByEmailOrGitHubId(decodedUser: User): Promise<User> {
    let user: User;

    if (decodedUser.gitHubId) {
      user = await this.userRepository.findOneByGitHubId(decodedUser.gitHubId);
    } else {
      user = await this.userRepository.findOneByEmail(decodedUser.email);
    }

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  async handleScore(userIdx: number, score: number): Promise<void> {
    const validUser: User = await this.userRepository.findOneByIdx(userIdx);

    if (!validUser) {
      throw new NotFoundException('User not found.');
    }

    if (validUser.score + score <= 0) {
      validUser.score = 0;
    } else {
      validUser.score += score;
    }

    await validUser.save();
  }
}
