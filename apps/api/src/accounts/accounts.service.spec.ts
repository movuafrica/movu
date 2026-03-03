import { Test, TestingModule } from '@nestjs/testing';
import { AccountsService } from './accounts.service';
import { DbService } from '../db/db.service';

describe('AccountsService', () => {
  let service: AccountsService;

  beforeEach(async () => {
    const dbServiceMock = {
      db: {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]),
      },
    } as unknown as DbService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        {
          provide: DbService,
          useValue: dbServiceMock,
        },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
