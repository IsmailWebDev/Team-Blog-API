import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import { Service } from 'typedi';
import { CreateUserDto, UpdateUserDto } from '@dtos/users.dto';
import { HttpException } from '@/exceptions/HttpException';
import { User } from '@interfaces/users.interface';

@Service()
export class UserService {
  public user = new PrismaClient({
    omit: {
      user: {
        password: true,
      },
    },
  }).user;

  public async findAllUser(): Promise<User[]> {
    const allUser: User[] = await this.user.findMany({
      where: {
        deletedAt: null,
      },
    });
    return allUser;
  }

  public async findUserById(userId: number): Promise<User> {
    const findUser: User = await this.user.findUnique({ where: { id: userId, deletedAt: null } });
    if (!findUser) throw new HttpException(409, "User doesn't exist");

    return findUser;
  }

  public async createUser(userData: CreateUserDto): Promise<User> {
    const findUser: User = await this.user.findUnique({ where: { email: userData.email } });
    if (findUser) throw new HttpException(409, `This email ${userData.email} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    const createUserData: User = await this.user.create({ data: { ...userData, password: hashedPassword } });
    return createUserData;
  }

  public async updateUser(userId: number, userData: UpdateUserDto, profilePic?: string): Promise<User> {
    const findUser: User = await this.user.findUnique({ where: { id: userId } });
    if (!findUser) throw new HttpException(409, "User doesn't exist");
    const updateData: Partial<User> & { password: string } = { ...userData };
    if (userData.password) {
      const hashedPassword = await hash(userData.password, 10);
      updateData.password = hashedPassword;
    }
    const updateUserData = await this.user.update({ where: { id: userId }, data: { ...updateData, profilePic } });
    return updateUserData;
  }

  public async deleteUser(userId: number): Promise<User> {
    const softDeletedUser: User = await this.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
      },
    });
    return softDeletedUser;
  }
}
