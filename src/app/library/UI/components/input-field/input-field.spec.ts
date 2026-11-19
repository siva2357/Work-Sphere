import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputField } from './input-field';

describe('InputField', () => {
  let component: InputField;
  let fixture: ComponentFixture<InputField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputField],
    }).compileComponents();

    fixture = TestBed.createComponent(InputField);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate email when validate is true', () => {
    component.type = 'email';
    component.validate = true;
    component.onValueInput('invalid-email');
    expect(component.computedValid).toBeFalse();

    component.onValueInput('hr.admin@worksphere.com');
    expect(component.computedValid).toBeTrue();
  });

  it('should filter items when filterItems are provided', () => {
    component.filterItems = [
      { name: 'Engineering', code: 'ENG' },
      { name: 'Human Resources', code: 'HR' },
    ];
    let emitted: any[] = [];
    component.filteredItemsChange.subscribe((res) => (emitted = res));

    component.onValueInput('eng');
    expect(emitted.length).toBe(1);
    expect(emitted[0].code).toBe('ENG');
  });
});
