import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { Post } from './post.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProvider } from 'src/user/user.provider';
import { UsersModule } from 'src/user/user.module';
import { UsersService } from 'src/user/users.service';
import { IsCreatorGuard } from './guards/IsCreator.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), UsersModule],
  providers: [PostService, UserProvider, UsersService, IsCreatorGuard],
  controllers: [PostController]
})
export class PostModule { }
