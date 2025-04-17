import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { GithubScannerService } from './github-scanner.service';

@Controller('github-scanner')
export class GithubScannerController {
  constructor(private readonly githubService: GithubScannerService) {}

  @Get('repos')
  async listRepos(@Query('token') token: string, @Query('user') user: string) {
    return this.githubService.getRepos(token, user);
  }

  @Get('repo')
  async repoDetails(
    @Query('token') token: string,
    @Query('owner') owner: string,
    @Query('repo') repo: string,
  ) {
    return this.githubService.getRepoDetails(token, owner, repo);
  }

  @Post('scan-all')
  async scanAll(
    @Body() body: { token: string; repos: { owner: string; repo: string }[] },
  ) {
    return this.githubService.scanReposInParallel(body.token, body.repos);
  }
}
