import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GithubScannerModule } from './github-scanner/github-scanner.module';

@Module({
  imports: [GithubScannerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
