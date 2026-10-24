import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplyRequest } from './apply-request';

describe('ApplyRequest', () => {
  let component: ApplyRequest;
  let fixture: ComponentFixture<ApplyRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplyRequest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplyRequest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
