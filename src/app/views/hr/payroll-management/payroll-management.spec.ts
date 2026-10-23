import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollManagement } from './payroll-management';

describe('PayrollManagement', () => {
  let component: PayrollManagement;
  let fixture: ComponentFixture<PayrollManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayrollManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayrollManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
