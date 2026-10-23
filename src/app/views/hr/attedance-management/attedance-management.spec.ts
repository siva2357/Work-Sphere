import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttedanceManagement } from './attedance-management';

describe('AttedanceManagement', () => {
  let component: AttedanceManagement;
  let fixture: ComponentFixture<AttedanceManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttedanceManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttedanceManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
