import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Toaster, ToasterService } from './toaster';

describe('Toaster', () => {
  let component: Toaster;
  let fixture: ComponentFixture<Toaster>;
  let service: ToasterService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Toaster],
    }).compileComponents();

    fixture = TestBed.createComponent(Toaster);
    component = fixture.componentInstance;
    service = TestBed.inject(ToasterService);
    fixture.detectChanges();
  });

  it('should create and display toast from service', () => {
    expect(component).toBeTruthy();
    service.emerald('Saved successfully');
    expect(component.activeToasts.length).toBeGreaterThan(0);
  });
});
