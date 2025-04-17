import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { GithubScannerService } from './github-scanner.service';
import { ScanReposDto } from './github-repository.types';

@Controller('github-scanner')
export class GithubScannerController {
  constructor(private readonly githubService: GithubScannerService) {}

  @Get('repos')
  async listRepos(
    @Query('token') token: string,
    @Query('user_name') user_name: string,
  ) {
    return this.githubService.getRepos(token, user_name);
  }

  @Post('scan-repos')
  async repoDetails(
    @Body()
    dto: ScanReposDto,
  ) {
    return this.githubService.scanReposInParallel(dto);
  }
}
