import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LetterDocument } from './letter-document';

describe('LetterDocument', () => {
  let component: LetterDocument;
  let fixture: ComponentFixture<LetterDocument>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LetterDocument]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LetterDocument);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
