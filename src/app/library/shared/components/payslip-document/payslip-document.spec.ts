import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayslipDocument } from './payslip-document';

describe('PayslipDocument', () => {
  let component: PayslipDocument;
  let fixture: ComponentFixture<PayslipDocument>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayslipDocument]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayslipDocument);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
