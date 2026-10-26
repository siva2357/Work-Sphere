import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewEmployee } from './add-new-employee';

describe('AddNewEmployee', () => {
  let component: AddNewEmployee;
  let fixture: ComponentFixture<AddNewEmployee>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewEmployee]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewEmployee);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
