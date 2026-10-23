import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeDirectory } from './employee-directory';

describe('EmployeeDirectory', () => {
  let component: EmployeeDirectory;
  let fixture: ComponentFixture<EmployeeDirectory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeDirectory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeDirectory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
