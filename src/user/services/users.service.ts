import { ConflictException, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from '../dtos/UpdateUserDto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private readonly entityManager: EntityManager) { }

    async createUser(email: string, username: string, password: string): Promise<User> {
        // Check if the user with the given email already exists
        const existingUser = await this.entityManager.findOne(User, {
            where: [{ email }, { username }],
        });

        if (existingUser) {
            // Determine which field(s) caused the conflict
            if (existingUser.email === email) {
                throw new ConflictException('User with this email already exists');
            } else if (existingUser.username === username) {
                throw new ConflictException('User with this username already exists');
            }
        }

        // Create a new user
        const saltOrRounds = 10;
        password = await bcrypt.hash(password, saltOrRounds);
        const newUser = this.entityManager.create(User, {
            email,
            username,
            password,
        });
        return this.entityManager.save(newUser);
    }

    async getAllUsers(): Promise<User[]> {
        return this.entityManager.find(User);
    }

    async getUserById(userid: string): Promise<User | undefined> {
        return this.entityManager.findOneBy(User, { userid });
    }

    async updateUser(
        userid: string,
        updateUserDto: UpdateUserDto,
    ): Promise<User | undefined> {

        const { password, ...otherFields } = updateUserDto;

        if (password) {
            const saltOrRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltOrRounds);
            updateUserDto.password = hashedPassword;
        }

        await this.entityManager.update(User, userid, updateUserDto);
        return this.entityManager.findOneBy(User, { userid });
    }

    async softDeleteUser(userid: string): Promise<User | undefined> {
        await this.entityManager.update(User, userid, { deleted: true });
        return this.entityManager.findOneBy(User, { userid });
    }

    async hardDeleteUser(userid: string): Promise<User | undefined> {
        const user = await this.entityManager.findOneBy(User, { userid });
        if (user) {
            await this.entityManager.remove(user);
        }
        return user;
    }

    async findOneByEmail(email: string): Promise<User | undefined> {
        return this.entityManager.findOneBy(User, { email });
    }
}
