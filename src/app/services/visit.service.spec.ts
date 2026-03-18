import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { VisitService } from './visit.service';

describe('VisitService', () => {
  let service: VisitService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()]
    });
    service = TestBed.inject(VisitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

