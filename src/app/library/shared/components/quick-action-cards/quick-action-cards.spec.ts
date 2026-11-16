import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickActionCards } from './quick-action-cards';

describe('QuickActionCards', () => {
  let component: QuickActionCards;
  let fixture: ComponentFixture<QuickActionCards>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickActionCards]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuickActionCards);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
