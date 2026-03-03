import { Test, TestingModule } from '@nestjs/testing';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { PrismaService } from '../prisma.service';

describe('AccountsController', () => {
  let controller: AccountsController;

  beforeEach(async () => {
    const prismaMock = {
      account: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    } as unknown as PrismaService;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountsController],
      providers: [
        AccountsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    controller = module.get<AccountsController>(AccountsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
