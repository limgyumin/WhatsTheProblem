import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import config from 'src/config';
import { User } from 'src/module/user/user.entity';
import { IGitHubUser } from './github.interface';

@Injectable()
export class GitHubLib {
  async getGitHubAccessToken(code: string): Promise<string | undefined> {
    const { CLIENT_ID, CLIENT_SECRET } = config.GITHUB;

    const response: AxiosResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      },
      {
        headers: {
          accept: 'application/json',
        },
      },
    );
    const { access_token } = response.data;
    return access_token;
  }

  async getGitHubUser(access_token: string): Promise<User | null> {
    try {
      const { data }: AxiosResponse<IGitHubUser> = await axios.get(
        'https://api.github.com/user',
        {
          headers: {
            Authorization: `token ${access_token}`,
          },
        },
      );

      const user = {
        avatar: data.avatar_url,
        email: data.email,
        gitHubId: data.id,
        name: data.name || data.login,
        bio: data.bio,
      } as User;

      return user;
    } catch (error) {
      Logger.error(error);
      return null;
    }
  }
}
