import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskManagement } from './task-management';

import { provideRouter } from '@angular/router';

describe('TaskManagement', () => {
  let component: TaskManagement;
  let fixture: ComponentFixture<TaskManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskManagement],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
