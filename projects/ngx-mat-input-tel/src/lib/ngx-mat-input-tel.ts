import { FocusMonitor } from '@angular/cdk/a11y'
import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { NgClass } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  Self,
  ViewChild,
  booleanAttribute,
  signal,
} from '@angular/core'
import {
  FormControl,
  FormGroupDirective,
  FormsModule,
  NG_VALIDATORS,
  NgControl,
  NgForm,
  ReactiveFormsModule,
} from '@angular/forms'
import { ErrorStateMatcher, MatRippleModule } from '@angular/material/core'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { MatDividerModule } from '@angular/material/divider'
import { MatFormFieldControl } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import {
  AsYouType,
  CountryCode as CC,
  CountryCode,
  E164Number,
  NationalNumber,
  PhoneNumber,
  getExampleNumber,
  parsePhoneNumberFromString,
} from 'libphonenumber-js'
import { Subject } from 'rxjs'
import { COUNTRIES_CODE, COUNTRIES_NAME, EXAMPLES } from './data/country-code.const'
import { Country } from './model/country.model'
import { PhoneNumberFormat } from './model/phone-number-format.model'
import {
  NgxMatInputTelDialog,
  NgxMatInputTelDialogData,
} from './ngx-mat-input-tel-dialog/ngx-mat-input-tel.dialog'
import { NgxMatInputTelFlagComponent } from './ngx-mat-input-tel-flag/ngx-mat-input-tel-flag'
import { ngxMatInputTelValidator } from './ngx-mat-input-tel.validator'
import { RemoveIsoPipe } from './remove-iso.pipe'

class ngxMatInputTelBase {
  constructor(
    public _defaultErrorStateMatcher: ErrorStateMatcher,
    public _parentForm: NgForm,
    public _parentFormGroup: FormGroupDirective,
    public ngControl: NgControl,
  ) {}
}

@Component({
  selector: 'ngx-mat-input-tel',
  templateUrl: './ngx-mat-input-tel.html',
  styleUrls: ['./ngx-mat-input-tel.scss'],
  providers: [
    { provide: MatFormFieldControl, useExisting: NgxMatInputTelComponent },
    {
      provide: NG_VALIDATORS,
      useValue: ngxMatInputTelValidator,
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgClass,

    // Forms
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,

    // Mat
    MatDialogModule,
    MatRippleModule,
    MatDividerModule,

    // Pipes
    RemoveIsoPipe,

    // Components
    NgxMatInputTelFlagComponent,
  ],
})
export class NgxMatInputTelComponent
  extends ngxMatInputTelBase
  implements OnInit, DoCheck, OnDestroy
{
  static nextId = 0
  @ViewChild('focusable', { static: false }) focusable!: ElementRef

  @HostBinding()
  id = `ngx-mat-input-tel-${NgxMatInputTelComponent.nextId++}`
  @HostBinding('class.ngx-floating')
  get shouldLabelFloat(): boolean {
    return this.focused || !this.empty
  }

  @Input() autocomplete: 'off' | 'tel' = 'off'
  @Input() ariaLabel = 'Select country'
  @Input() cssClass?: string
  @Input() defaultCountry?: CountryCode
  @Input() errorStateMatcher: ErrorStateMatcher = this._defaultErrorStateMatcher
  @Input() maxLength: string | number = 15
  @Input() name?: string
  @Input() placeholder = ''

  @Input() countriesName = COUNTRIES_NAME

  private _preferredCountries: string[] = []
  @Input() set preferredCountries(value: string[]) {
    this._preferredCountries = value.map((v) => v.toUpperCase())
  }

  @Input() set onlyCountries(countryCodes: string[]) {
    if (countryCodes.length) {
      const codes = countryCodes.map((c) => c.toUpperCase())
      this.$availableCountries.set(this._getFilteredCountries(codes))
    }

    this._setPreferredCountriesInDropDown()
    this._setDefaultCountry()
  }

  @Input() searchPlaceholder = 'Search ...'
  @Input() validation: 'isValid' | 'isPossible' = 'isValid'
  @Input({ transform: booleanAttribute }) enablePlaceholder = false
  @Input({ transform: booleanAttribute }) enableSearch = false
  @Input({ transform: booleanAttribute }) resetOnChange = false
  @Input({ transform: booleanAttribute }) separateDialCode = false
  @Input({ transform: booleanAttribute }) hideAreaCodes = false

  private _format: PhoneNumberFormat = 'default'
  @Input() set format(value: PhoneNumberFormat) {
    this._format = value
    this.phoneNumber = this.formattedPhoneNumber()
    this.stateChanges.next()
  }
  get format(): PhoneNumberFormat {
    return this._format
  }

  private _required = false
  @Input({ transform: booleanAttribute })
  set required(value: boolean) {
    this._required = coerceBooleanProperty(value)
    this.stateChanges.next(undefined)
  }
  get required(): boolean {
    return this._required
  }

  private _disabled = false
  @Input({ transform: booleanAttribute })
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value)
    this.stateChanges.next(undefined)
  }
  get disabled(): boolean {
    return this._disabled
  }

  get empty(): boolean {
    return !this.phoneNumber
  }

  @Output()
  countryChanged: EventEmitter<Country> = new EventEmitter<Country>()

  stateChanges = new Subject<void>()
  focused = false
  isDialCodeFocused = false
  isPhoneInputFocused = false
  describedBy = ''
  phoneNumber?: E164Number | NationalNumber = '' as E164Number | NationalNumber
  private _allCountries: Record<string, Country> = {}
  $availableCountries = signal<Record<string, Country>>(this._initAllCountries())
  $preferredCountriesInDropDown = signal<Record<string, Country>>({})
  $selectedCountry = signal<Country>({} as Country)
  numberInstance?: PhoneNumber
  value?: any

  private _previousFormattedNumber?: string

  onTouched = () => {}
  propagateChange = (_: any) => {}

  private errorState?: boolean

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _focusMonitor: FocusMonitor,
    private _elementRef: ElementRef<HTMLElement>,
    private _dialog: MatDialog,
    @Optional() @Self() _ngControl: NgControl,
    @Optional() _parentForm: NgForm,
    @Optional() _parentFormGroup: FormGroupDirective,
    _defaultErrorStateMatcher: ErrorStateMatcher,
  ) {
    super(_defaultErrorStateMatcher, _parentForm, _parentFormGroup, _ngControl)

    _focusMonitor.monitor(_elementRef, true).subscribe((origin: any) => {
      if (this.focused && !origin) {
        this.onTouched()
      }
      this.focused = !!origin
      this.stateChanges.next()
    })

    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this
    }
  }

  ngOnInit() {
    this._setPreferredCountriesInDropDown()
    this._setDefaultCountry()

    this._changeDetectorRef.markForCheck()
    this.stateChanges.next()
  }

  ngOnDestroy() {
    this.stateChanges.complete()
    this._focusMonitor.stopMonitoring(this._elementRef)
  }

  ngDoCheck(): void {
    if (this.ngControl) {
      const oldState = this.errorState
      const newState = this.errorStateMatcher.isErrorState(this.ngControl.control, this._parentForm)

      this.errorState =
        (newState && (!this.ngControl.control?.value || this.ngControl.control?.touched)) ||
        (!this.focused ? newState : false)

      if (oldState !== newState) {
        this.errorState = newState
        this.stateChanges.next()
      }
    }
  }

  openCountrySelector(): void {
    if (this.disabled) {
      return
    }

    const dialogRef = this._dialog.open<NgxMatInputTelDialog, NgxMatInputTelDialogData, Country>(
      NgxMatInputTelDialog,
      {
        width: '420px',
        maxWidth: '90vw',
        maxHeight: '80vh',
        data: {
          selectedCountry: this.$selectedCountry(),
          availableCountries: this.$availableCountries(),
          preferredCountriesInDropDown: this.$preferredCountriesInDropDown(),
          enableSearch: this.enableSearch,
          searchPlaceholder: this.searchPlaceholder,
          ariaLabel: this.ariaLabel,
        },
        autoFocus: this.enableSearch ? 'dialog' : 'first-tabbable',
        restoreFocus: true,
      },
    )

    dialogRef.afterClosed().subscribe((selectedCountry) => {
      if (selectedCountry) {
        // Create KeyValue-compatible structure expected by onCountrySelect
        this.onCountrySelect({
          key: selectedCountry.iso2,
          value: selectedCountry,
        })
      }
    })
  }

  updateErrorState() {
    if (
      this.ngControl &&
      this.ngControl.invalid &&
      (this.ngControl.touched || (this._parentForm && this._parentForm.submitted))
    ) {
      const currentState = this.errorStateMatcher.isErrorState(
        this.ngControl.control as FormControl,
        this.ngControl?.value,
      )
      if (currentState !== this.errorState) {
        this.errorState = currentState
        this._changeDetectorRef.markForCheck()
      }
    }
  }

  private _setPreferredCountriesInDropDown(countries = this._preferredCountries) {
    this.$preferredCountriesInDropDown.set(this._getFilteredCountries(countries))
  }

  private _setDefaultCountry() {
    let country: Country

    const preferredCountries = this.$preferredCountriesInDropDown()

    if (this.numberInstance?.country) {
      // If an existing number is present, we use it to determine country
      country = this.getCountry(this.numberInstance.country)
    } else if (this.defaultCountry) {
      country = this.getCountry(this.defaultCountry)
    } else if (Object.keys(preferredCountries).length) {
      country = Object.values(preferredCountries)[0]
    } else {
      const firstKeyValue = Object.entries(this._allCountries)[0]
      country = { ...firstKeyValue[1], iso2: firstKeyValue[0] }
    }

    this.$selectedCountry.set(country)
    this.countryChanged.emit(country)
  }

  private _getFilteredCountries(countryCodes: string[]): Record<string, Country> {
    return Object.values(this._allCountries)
      .filter((c) => countryCodes.includes(c.iso2))
      .sort((a, b) => countryCodes.indexOf(a.name) - countryCodes.indexOf(b.name))
      .reduce<Record<string, Country>>((acc, country) => {
        acc[country.iso2] = country
        return acc
      }, {})
  }

  public onPhoneNumberChange(): void {
    try {
      this._setCountry()
    } catch {
      // Pass a value to trigger the validator error
      this.value = this.formattedPhoneNumber().toString()
    }

    this.propagateChange(this.value)
    this._changeDetectorRef.markForCheck()
  }

  private _setCountry() {
    if (!this.phoneNumber) {
      this.value = null
      return
    }

    const numberInstance = parsePhoneNumberFromString(
      this.phoneNumber.toString(),
      this.$selectedCountry().iso2.toUpperCase() as CC,
    )
    if (!numberInstance) {
      // Single digit or invalid number
      this.value = this.phoneNumber.toString()
      return
    }
    this.numberInstance = numberInstance

    this.formatAsYouTypeIfEnabled()
    this.value = this.numberInstance?.number

    if (!this.value) throw new Error('Incorrect phone number')

    if (
      this.numberInstance &&
      (this.validation === 'isPossible'
        ? this.numberInstance.isPossible()
        : this.numberInstance.isValid())
    ) {
      if (this.phoneNumber !== this.formattedPhoneNumber()) {
        this.phoneNumber = this.formattedPhoneNumber()
      }
      if (
        this.$selectedCountry().iso2 !== this.numberInstance.country &&
        this.numberInstance.country
      ) {
        this.$selectedCountry.set(this.getCountry(this.numberInstance.country))
        this.countryChanged.emit(this.$selectedCountry())
      }
    }
  }

  public onCountrySelect(country: { key: string; value: Country }): void {
    if (this.phoneNumber) {
      this.phoneNumber = this.numberInstance?.nationalNumber
    }
    if (this.resetOnChange && this.$selectedCountry().iso2 !== country.key) {
      this.reset()
    }

    this.$selectedCountry.set({
      ...country.value,
      iso2: country.key,
    })
    this.countryChanged.emit(this.$selectedCountry())

    this.onPhoneNumberChange()

    setTimeout(() => {
      this.focusable.nativeElement.focus()
    }, 0)
  }

  public getCountry(code: CC): Country {
    const targetCountry = this._allCountries[code]
    if (targetCountry) {
      return { ...targetCountry, iso2: code }
    }
    return {
      name: 'UN',
      iso2: 'UN',
      dialCode: '',
      priority: 0,
      areaCodes: undefined,
      placeholder: '',
    }
  }

  public onInputKeyPress(event: any): void {
    const pattern = /[0-9+\- ]/
    if (!pattern.test(event.key)) {
      event.preventDefault()
    }
  }

  public onDialCodeFocus(): void {
    this.isDialCodeFocused = true
    // In separated mode, button focus shouldn't make mat-form-field appear focused
    // Only clear focused state if phone input is not focused
    if (this.separateDialCode && !this.isPhoneInputFocused) {
      this.focused = false
      this.stateChanges.next()
    }
  }

  public onDialCodeBlur(): void {
    this.isDialCodeFocused = false
    // In separated mode, keep mat-form-field focused if phone input is focused
    if (this.separateDialCode && !this.isPhoneInputFocused) {
      this.focused = false
    }
    if (this.separateDialCode) {
      this.stateChanges.next()
    }
  }

  public onPhoneInputFocus(): void {
    this.isPhoneInputFocused = true
    // In separated mode, ensure mat-form-field shows as focused
    if (this.separateDialCode) {
      this.focused = true
      this.stateChanges.next()
    }
  }

  public onPhoneInputBlur(): void {
    this.isPhoneInputFocused = false
    // In separated mode, clear mat-form-field focus state
    // Only clear if dial code button is not focused
    if (this.separateDialCode && !this.isDialCodeFocused) {
      this.focused = false
      this.stateChanges.next()
    }
  }

  public onPhoneInputBlurAndTouch(): void {
    this.onTouched()
    this.onPhoneInputBlur()
  }

  protected _initAllCountries(): Record<string, Country> {
    this._allCountries = {}
    Object.entries(COUNTRIES_CODE).forEach(([iso2, codes]) => {
      const country: Country = {
        name: this.countriesName[iso2] || iso2,
        iso2: iso2,
        dialCode: codes[0].toString(),
        priority: +codes || 0,
        areaCodes:
          !this.hideAreaCodes && codes.length > 2 && Array.isArray(codes[2]) ? codes[2] : undefined,
        placeholder: '',
      }
      if (this.enablePlaceholder) {
        country.placeholder = this._getPhoneNumberPlaceHolder(iso2)
      }
      this._allCountries[iso2] = country
    })
    return this._allCountries
  }

  private _getPhoneNumberPlaceHolder(countryISOCode: any): string | undefined {
    try {
      return getExampleNumber(countryISOCode, EXAMPLES)?.number
    } catch (e) {
      return e as any
    }
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled
    this._changeDetectorRef.markForCheck()
    this.stateChanges.next(undefined)
  }

  writeValue(value: any): void {
    if (value) {
      this.numberInstance = parsePhoneNumberFromString(value)
      if (this.numberInstance) {
        const countryCode = this.numberInstance.country
        this.phoneNumber = this.formattedPhoneNumber()

        if (!countryCode) return

        this.$selectedCountry.set(this.getCountry(countryCode))

        if (
          this.$selectedCountry().dialCode &&
          !this._preferredCountries.includes(this.$selectedCountry().iso2)
        ) {
          this.$preferredCountriesInDropDown.update((values) => {
            return { ...values, ...{ [this.$selectedCountry().iso2]: this.$selectedCountry() } }
          })
        }
        this.countryChanged.emit(this.$selectedCountry())

        // Initial value is set
        this.stateChanges.next()
      } else {
        this.phoneNumber = value
        this.stateChanges.next(undefined)
      }
    }

    // Value is set from outside using setValue()
    this.onPhoneNumberChange()
    this._changeDetectorRef.markForCheck()
  }

  setDescribedByIds(ids: string[]) {
    this.describedBy = ids.join(' ')
  }

  onContainerClick(event: MouseEvent): void {
    if ((event.target as Element).tagName.toLowerCase() !== 'input') {
      this._elementRef.nativeElement.querySelector('input')!.focus()
    }
  }

  reset() {
    this.phoneNumber = '' as E164Number | NationalNumber
    this.propagateChange(null)

    this._changeDetectorRef.markForCheck()
    this.stateChanges.next(undefined)
  }

  private formattedPhoneNumber(): E164Number | NationalNumber {
    if (!this.numberInstance) {
      return (this.phoneNumber?.toString() || '') as E164Number | NationalNumber
    }
    switch (this.format) {
      case 'national':
        return this.numberInstance.formatNational() as E164Number | NationalNumber
      case 'international':
        return this.numberInstance.formatInternational() as E164Number | NationalNumber
      default:
        return this.numberInstance.nationalNumber.toString() as E164Number | NationalNumber
    }
  }

  private formatAsYouTypeIfEnabled(): void {
    if (this.format === 'default') {
      return
    }
    const asYouType: AsYouType = new AsYouType(this.$selectedCountry().iso2.toUpperCase() as CC)
    // To avoid caret positioning we apply formatting only if the caret is at the end:
    if (!this.phoneNumber) return

    if (this.phoneNumber?.toString().startsWith(this._previousFormattedNumber || '')) {
      this.phoneNumber = asYouType.input(this.phoneNumber.toString()) as E164Number | NationalNumber
    }
    this._previousFormattedNumber = this.phoneNumber.toString()
  }
}
