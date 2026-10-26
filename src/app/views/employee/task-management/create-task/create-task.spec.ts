import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTask } from './create-task';

import { provideRouter } from '@angular/router';

describe('CreateTask', () => {
  let component: CreateTask;
  let fixture: ComponentFixture<CreateTask>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateTask],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateTask);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
