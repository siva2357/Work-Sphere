import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestCards } from './request-cards';

describe('RequestCards', () => {
  let component: RequestCards;
  let fixture: ComponentFixture<RequestCards>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestCards]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestCards);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
