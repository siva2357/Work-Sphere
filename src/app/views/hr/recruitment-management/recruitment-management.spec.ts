import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecruitmentManagement } from './recruitment-management';

describe('RecruitmentManagement', () => {
  let component: RecruitmentManagement;
  let fixture: ComponentFixture<RecruitmentManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecruitmentManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecruitmentManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
