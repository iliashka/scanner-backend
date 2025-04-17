import { Module } from '@nestjs/common';
import { GithubScannerController } from './github-scanner.controller';
import { GithubScannerService } from './github-scanner.service';

@Module({
  imports: [],
  controllers: [GithubScannerController],
  providers: [GithubScannerService],
})
export class GithubScannerModule {}
