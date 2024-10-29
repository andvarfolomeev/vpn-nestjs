import { Test, TestingModule } from '@nestjs/testing';
import { Wg0configService } from './wg0config.service';

describe('Wg0configService', () => {
  let service: Wg0configService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Wg0configService],
    }).compile();

    service = module.get<Wg0configService>(Wg0configService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
