import { TestBed } from '@angular/core/testing';

import { SwitchesService } from './switches.service';

describe('SwitchesService', () => {
  let service: SwitchesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SwitchesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
