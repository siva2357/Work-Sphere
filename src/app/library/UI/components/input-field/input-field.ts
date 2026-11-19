import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  forwardRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  REGEX_PATTERNS,
  RegexPatternKey,
} from '../../../../core/constants/regex.constants';

export type InputFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'date'
  | 'time'
  | 'datetime-local'
  | 'number'
  | 'tel'
  | 'phone'
  | 'search'
  | 'url'
  | 'dropdown'
  | 'select'
  | 'textarea';

export interface InputDropdownOption {
  label: string;
  value: any;
  disabled?: boolean;
  badge?: string;
}

@Component({
  selector: 'app-input-field, app-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './input-field.html',
  styleUrl: './input-field.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputField),
      multi: true,
    },
  ],
})
export class InputField implements ControlValueAccessor, OnChanges {
  @Input() label = '';
  @Input() type: InputFieldType = 'text';
  @Input() placeholder = '';
  @Input() name = '';
  @Input() id = '';
  @Input() icon = '';
  @Input() iconPosition: 'left' | 'right' = 'left';
  @Input() hint = '';
  @Input() customClass = '';

  // State Flags
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() clearable = false;

  // Validation Props (true / false)
  @Input() validate = false;
  @Input() required = false;
  @Input() isValid: boolean | null = null;
  @Input() showValidationState = true;
  @Input() regexKey: RegexPatternKey | null = null;
  @Input() pattern: string | RegExp | null = null;
  @Input() minLength: number | null = null;
  @Input() maxLength: number | null = null;
  @Input() min: number | string | null = null;
  @Input() max: number | string | null = null;
  @Input() rows = 3;
  @Input() errorMessage = '';
  @Input() validMessage = '';

  // Dropdown / Select Props
  @Input() options: (InputDropdownOption | Record<string, any> | string | number)[] = [];
  @Input() optionLabel = 'label';
  @Input() optionValue = 'value';
  @Input() showEmptyOption = true;
  @Input() emptyOptionLabel = 'Select an option';

  // Built-in Filter Function & Dataset Modeling
  @Input() filterable = false;
  @Input() dropdownSearchPlaceholder = 'Filter options...';
  @Input() filterItems: any[] = [];
  @Input() filterKeys: string[] = [];
  @Input() filterFn?: (item: any, query: string) => boolean;

  // Value Binding
  private _value: any = '';
  @Input()
  get value(): any {
    return this._value;
  }
  set value(val: any) {
    const normalized = val ?? '';
    if (this._value === normalized) return;
    this._value = normalized;
    this.runValidation(false);
  }

  @Output() valueChange = new EventEmitter<any>();
  @Output() validChange = new EventEmitter<boolean>();
  @Output() filterChange = new EventEmitter<string>();
  @Output() filteredItemsChange = new EventEmitter<any[]>();
  @Output() blurred = new EventEmitter<FocusEvent>();
  @Output() focused = new EventEmitter<FocusEvent>();

  showPassword = false;
  touched = false;
  dirty = false;
  computedValid = true;
  computedErrorText = '';
  dropdownFilterQuery = '';
  normalizedOptions: InputDropdownOption[] = [];

  private onChangeCallback: (value: any) => void = () => {};
  private onTouchedCallback: () => void = () => {};

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['options'] ||
      changes['optionLabel'] ||
      changes['optionValue'] ||
      changes['filterable']
    ) {
      this.rebuildNormalizedOptions();
    }
    if (
      changes['validate'] ||
      changes['required'] ||
      changes['isValid'] ||
      changes['pattern'] ||
      changes['regexKey'] ||
      changes['value']
    ) {
      this.runValidation(false);
    }
    if (changes['filterItems'] && this.filterItems?.length > 0) {
      this.runFilter(this._value, false);
    }
  }

  // ControlValueAccessor Implementation
  writeValue(val: any): void {
    this._value = val ?? '';
    this.runValidation(false);
  }

  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedCallback = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Helpers for Icon & Type Resolution
  get isDropdown(): boolean {
    return this.type === 'dropdown' || this.type === 'select';
  }

  get isTextarea(): boolean {
    return this.type === 'textarea';
  }

  get nativeInputType(): string {
    if (this.type === 'password') {
      return this.showPassword ? 'text' : 'password';
    }
    if (this.type === 'phone') {
      return 'tel';
    }
    if (this.isDropdown || this.isTextarea) {
      return 'text';
    }
    return this.type;
  }

  get resolvedIcon(): string {
    if (this.icon) {
      return this.icon.startsWith('bi ') ? this.icon : `bi ${this.icon}`;
    }
    switch (this.type) {
      case 'email':
        return 'bi bi-envelope';
      case 'password':
        return 'bi bi-shield-lock';
      case 'date':
      case 'datetime-local':
        return 'bi bi-calendar3';
      case 'time':
        return 'bi bi-clock';
      case 'search':
        return 'bi bi-search';
      case 'tel':
      case 'phone':
        return 'bi bi-telephone';
      case 'url':
        return 'bi bi-link-45deg';
      default:
        return '';
    }
  }

  /**
   * Rebuilds cached dropdown options so change detection never sees new array references on every check
   */
  private rebuildNormalizedOptions(): void {
    const mapped = (this.options || []).map((opt) => {
      if (typeof opt === 'string' || typeof opt === 'number') {
        return { label: String(opt), value: opt };
      }
      const rec = opt as Record<string, any>;
      return {
        label: String(rec[this.optionLabel] ?? rec['name'] ?? rec['title'] ?? rec['label'] ?? ''),
        value: rec[this.optionValue] ?? rec['id'] ?? rec['code'] ?? rec['value'] ?? opt,
        disabled: Boolean(rec['disabled']),
        badge: rec['badge'] ? String(rec['badge']) : undefined,
      };
    });

    if (!this.filterable || !this.dropdownFilterQuery.trim()) {
      this.normalizedOptions = mapped;
      return;
    }

    const q = this.dropdownFilterQuery.trim().toLowerCase();
    this.normalizedOptions = mapped.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        String(item.value ?? '')
          .toLowerCase()
          .includes(q)
    );
  }

  /**
   * Handles user input changes across input, select, and textarea
   */
  onValueInput(newValue: any): void {
    this._value = newValue;
    this.dirty = true;
    this.onChangeCallback(this._value);
    this.valueChange.emit(this._value);
    this.runValidation(true);
    this.runFilter(this._value, true);
  }

  onDropdownSearchInput(query: string): void {
    this.dropdownFilterQuery = query;
    this.rebuildNormalizedOptions();
    this.filterChange.emit(query);
  }

  onBlur(event: FocusEvent): void {
    this.touched = true;
    this.onTouchedCallback();
    this.runValidation(true);
    this.blurred.emit(event);
  }

  onFocus(event: FocusEvent): void {
    this.focused.emit(event);
  }

  togglePasswordVisibility(): void {
    if (!this.disabled) {
      this.showPassword = !this.showPassword;
    }
  }

  clearInput(): void {
    if (this.disabled || this.readonly) return;
    this.dropdownFilterQuery = '';
    this.rebuildNormalizedOptions();
    this.onValueInput('');
  }

  /**
   * Evaluates boolean validation (true / false) based on type, required, regex, and bounds
   */
  runValidation(emitEvent = true): boolean {
    if (typeof this.isValid === 'boolean') {
      this.computedValid = this.isValid;
      this.computedErrorText = this.isValid ? '' : this.errorMessage || 'Invalid value';
      if (emitEvent) this.validChange.emit(this.computedValid);
      return this.computedValid;
    }

    if (!this.validate && !this.required) {
      this.computedValid = true;
      this.computedErrorText = '';
      if (emitEvent) this.validChange.emit(true);
      return true;
    }

    const raw = this._value;
    const strVal = raw !== null && raw !== undefined ? String(raw).trim() : '';

    // 1. Required Check
    if (this.required && strVal.length === 0) {
      this.computedValid = false;
      this.computedErrorText =
        this.errorMessage || `${this.label || 'This field'} is required.`;
      if (emitEvent) this.validChange.emit(false);
      return false;
    }

    // If empty and not required, it is valid
    if (strVal.length === 0) {
      this.computedValid = true;
      this.computedErrorText = '';
      if (emitEvent) this.validChange.emit(true);
      return true;
    }

    // 2. MinLength / MaxLength Check
    if (this.minLength !== null && strVal.length < this.minLength) {
      this.computedValid = false;
      this.computedErrorText =
        this.errorMessage || `Minimum ${this.minLength} characters required.`;
      if (emitEvent) this.validChange.emit(false);
      return false;
    }

    if (this.maxLength !== null && strVal.length > this.maxLength) {
      this.computedValid = false;
      this.computedErrorText =
        this.errorMessage || `Maximum ${this.maxLength} characters allowed.`;
      if (emitEvent) this.validChange.emit(false);
      return false;
    }

    // 3. Explicit Regex Key or Pattern Check
    if (this.regexKey && REGEX_PATTERNS[this.regexKey]) {
      const regex = REGEX_PATTERNS[this.regexKey];
      if (!regex.test(strVal)) {
        this.computedValid = false;
        this.computedErrorText = this.errorMessage || `Invalid ${this.label || this.type} format.`;
        if (emitEvent) this.validChange.emit(false);
        return false;
      }
    } else if (this.pattern) {
      const regex =
        this.pattern instanceof RegExp ? this.pattern : new RegExp(this.pattern);
      if (!regex.test(strVal)) {
        this.computedValid = false;
        this.computedErrorText = this.errorMessage || `Invalid ${this.label || 'input'} format.`;
        if (emitEvent) this.validChange.emit(false);
        return false;
      }
    } else if (this.validate) {
      // 4. Built-in Type Validation
      let typeValid = true;
      let defaultErr = 'Invalid input.';

      switch (this.type) {
        case 'email':
          typeValid = REGEX_PATTERNS.EMAIL.test(strVal);
          defaultErr = 'Please enter a valid email address.';
          break;
        case 'password':
          typeValid = strVal.length >= 6;
          defaultErr = 'Password must be at least 6 characters.';
          break;
        case 'tel':
        case 'phone':
          typeValid = REGEX_PATTERNS.PHONE_INTERNATIONAL.test(strVal);
          defaultErr = 'Please enter a valid phone number.';
          break;
        case 'url':
          typeValid = REGEX_PATTERNS.URL.test(strVal);
          defaultErr = 'Please enter a valid URL (http/https).';
          break;
        case 'date':
          typeValid = REGEX_PATTERNS.DATE_ISO.test(strVal) || !isNaN(Date.parse(strVal));
          defaultErr = 'Please select a valid date.';
          break;
        case 'number': {
          const num = Number(strVal);
          typeValid = !isNaN(num);
          if (typeValid && this.min !== null && num < Number(this.min)) {
            typeValid = false;
            defaultErr = `Value must be at least ${this.min}.`;
          }
          if (typeValid && this.max !== null && num > Number(this.max)) {
            typeValid = false;
            defaultErr = `Value must be at most ${this.max}.`;
          }
          break;
        }
      }

      if (!typeValid) {
        this.computedValid = false;
        this.computedErrorText = this.errorMessage || defaultErr;
        if (emitEvent) this.validChange.emit(false);
        return false;
      }
    }

    this.computedValid = true;
    this.computedErrorText = '';
    if (emitEvent) this.validChange.emit(true);
    return true;
  }

  /**
   * Executes filter modeling whenever user types
   */
  private runFilter(rawVal: any, emitFilterQuery = true): void {
    const query = rawVal !== null && rawVal !== undefined ? String(rawVal).trim() : '';
    if (emitFilterQuery) {
      this.filterChange.emit(query);
    }

    if (!Array.isArray(this.filterItems) || this.filterItems.length === 0) {
      return;
    }

    if (!query) {
      this.filteredItemsChange.emit([...this.filterItems]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = this.filterItems.filter((item) => {
      if (this.filterFn) {
        return this.filterFn(item, query);
      }
      if (typeof item === 'string' || typeof item === 'number') {
        return String(item).toLowerCase().includes(lowerQuery);
      }
      if (item && typeof item === 'object') {
        const keys =
          this.filterKeys && this.filterKeys.length > 0
            ? this.filterKeys
            : Object.keys(item);
        return keys.some((k) =>
          String(item[k] ?? '')
            .toLowerCase()
            .includes(lowerQuery)
        );
      }
      return false;
    });

    this.filteredItemsChange.emit(filtered);
  }

  get showInvalidUI(): boolean {
    if (!this.showValidationState) return false;
    if (this.isValid === false) return true;
    return (this.validate || this.required) && (this.touched || this.dirty) && !this.computedValid;
  }

  get showValidUI(): boolean {
    if (!this.showValidationState) return false;
    if (this.isValid === true) return true;
    const hasVal = String(this._value ?? '').trim().length > 0;
    return (this.validate || this.required) && (this.touched || this.dirty) && hasVal && this.computedValid;
  }
}
