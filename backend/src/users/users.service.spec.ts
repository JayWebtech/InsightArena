import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    stellar_address: 'GBRPYHIL2CI3WHZDTOOQFC6EB4RRJC3XNRBF7XNZFXNRBF7XNRBF7XN',
    username: 'testuser',
    avatar_url: null,
    total_predictions: 10,
    correct_predictions: 7,
    total_staked_stroops: '1000000',
    total_winnings_stroops: '500000',
    reputation_score: 85,
    season_points: 100,
    role: 'user',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByAddress', () => {
    it('should return a user when found', async () => {
      const findOneByMock = jest
        .spyOn(repository, 'findOneBy')
        .mockResolvedValue(mockUser);

      const result = await service.findByAddress(mockUser.stellar_address);

      expect(result).toEqual(mockUser);
      expect(findOneByMock).toHaveBeenCalledWith({
        stellar_address: mockUser.stellar_address,
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(
        service.findByAddress('NONEXISTENT_ADDRESS'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException with descriptive message', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);
      const address = 'GBRPYHIL2CI3WHZDTOOQFC6EB4RRJC3XNRBF7XNZFXNRBF7XNRBF7XN';

      await expect(service.findByAddress(address)).rejects.toThrow(
        new NotFoundException(`User with address ${address} not found`),
      );
    });
  });
});
