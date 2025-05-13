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
  WritableSignal,
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
import { MatDividerModule } from '@angular/material/divider'
import { MatFormFieldControl } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatMenu, MatMenuModule } from '@angular/material/menu'
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
import { ALL_COUNTRIES, EXAMPLES } from './data/country-code.const'
import { Country } from './model/country.model'
import { PhoneNumberFormat } from './model/phone-number-format.model'
import { ngxMatInputTelValidator } from './ngx-mat-input-tel.validator'
import { SearchPipe } from './search.pipe'

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
  templateUrl: './ngx-mat-input-tel.component.html',
  styleUrls: ['./ngx-mat-input-tel.component.scss'],
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
    MatMenuModule,
    MatRippleModule,
    MatDividerModule,
    // Pipes
    SearchPipe,
  ],
})
export class NgxMatInputTelComponent
  extends ngxMatInputTelBase
  implements OnInit, DoCheck, OnDestroy
{
  static nextId = 0
  @ViewChild(MatMenu) matMenu!: MatMenu
  @ViewChild('menuSearchInput', { static: false }) menuSearchInput?: ElementRef<HTMLInputElement>
  @ViewChild('focusable', { static: false }) focusable!: ElementRef

  @HostBinding()
  id = `ngx-mat-input-tel-${NgxMatInputTelComponent.nextId++}`
  @HostBinding('class.ngx-floating')
  get shouldLabelFloat(): boolean {
    return this.focused || !this.empty
  }

  @Input() autocomplete: 'off' | 'tel' = 'off'
  @Input() cssClass?: string
  @Input() defaultCountry?: CountryCode
  @Input() errorStateMatcher: ErrorStateMatcher = this._defaultErrorStateMatcher
  @Input() maxLength: string | number = 15
  @Input() name?: string
  @Input() placeholder: string = ''
  @Input() preferredCountries: string[] = []

  @Input() set onlyCountries(countryCodes: string[]) {
    if (countryCodes.length) {
      this.$availableCountries.set(this._getFilteredCountries(countryCodes))
    }

    this._setPreferredCountriesInDropDown()
    this._setDefaultCountry()
  }

  @Input() searchPlaceholder = 'Search ...'
  @Input() validation: 'isValid' | 'isPossible' = 'isValid'
  @Input({ transform: booleanAttribute }) enablePlaceholder = false
  @Input({ transform: booleanAttribute }) enableSearch = false
  @Input({ transform: booleanAttribute }) resetOnChange = false
  @Input()
  set format(value: PhoneNumberFormat) {
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
  @Input({ alias: 'disabled', transform: booleanAttribute })
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
  describedBy = ''
  phoneNumber?: E164Number | NationalNumber = '' as E164Number | NationalNumber
  private _allCountries: Country[] = []
  $availableCountries = signal<Country[]>(this._initAllCountries())
  $preferredCountriesInDropDown = signal<Country[]>([])
  $selectedCountry!: WritableSignal<Country>
  numberInstance?: PhoneNumber
  value?: any
  searchCriteria?: string

  private _previousFormattedNumber?: string
  private _format: PhoneNumberFormat = 'default'

  onTouched = () => {}
  propagateChange = (_: any) => {}

  private errorState?: boolean

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _focusMonitor: FocusMonitor,
    private _elementRef: ElementRef<HTMLElement>,
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

  private _setPreferredCountriesInDropDown(countries = this.preferredCountries) {
    this.$preferredCountriesInDropDown.set(this._getFilteredCountries(countries))
  }

  private _setDefaultCountry() {
    let country: Country

    if (this.numberInstance?.country) {
      // If an existing number is present, we use it to determine country
      country = this.getCountry(this.numberInstance.country)
    } else if (this.defaultCountry) {
      country = this.getCountry(this.defaultCountry)
    } else if (this.$preferredCountriesInDropDown().length) {
      country = this.$preferredCountriesInDropDown()[0]
    } else {
      country = this._allCountries[0]
    }
    this.$selectedCountry = signal<Country>(country)
    this.countryChanged.emit(country)
  }

  private _getFilteredCountries(countryCodes: string[]) {
    const filteredCountries = this._allCountries.filter((c) => countryCodes.includes(c.iso2))

    return filteredCountries.sort(
      (a, b) => countryCodes.indexOf(a.iso2) - countryCodes.indexOf(b.iso2),
    )
  }

  public onPhoneNumberChange(): void {
    try {
      this._setCountry()
    } catch (e) {
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
    if (!numberInstance) return
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

  public onCountrySelect(country: Country, el: HTMLInputElement): void {
    if (this.phoneNumber) {
      this.phoneNumber = this.numberInstance?.nationalNumber
    }
    if (this.resetOnChange && this.$selectedCountry() !== country) {
      this.reset()
    }

    this.$selectedCountry.set(country)
    this.countryChanged.emit(this.$selectedCountry())

    this.onPhoneNumberChange()
    el.focus()
  }

  public getCountry(code: CC): Country {
    return (this._allCountries.find((c) => c.iso2 === code.toLowerCase()) || {
      name: 'UN',
      iso2: 'UN',
      dialCode: undefined,
      priority: 0,
      areaCodes: undefined,
      flagClass: 'UN',
      placeHolder: '',
    }) as Country
  }

  public onInputKeyPress(event: any): void {
    const pattern = /[0-9+\- ]/
    if (!pattern.test(event.key)) {
      event.preventDefault()
    }
  }

  protected _initAllCountries(): Country[] {
    this._allCountries = ALL_COUNTRIES.map((c) => {
      const country: Country = {
        name: c[0].toString(),
        iso2: c[1].toString(),
        dialCode: c[2].toString(),
        priority: +c[3] || 0,
        areaCodes: (c[4] as string[]) || undefined,
        flagClass: c[1].toString().toUpperCase(),
        placeHolder: '',
      }

      if (this.enablePlaceholder) {
        country.placeHolder = this._getPhoneNumberPlaceHolder(country.iso2.toUpperCase())
      }

      return country
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

        if (!this.$selectedCountry) {
          // Init value was given
          this.$selectedCountry = signal<Country>(this.getCountry(countryCode))
        } else {
          this.$selectedCountry.set(this.getCountry(countryCode))
        }
        if (
          this.$selectedCountry().dialCode &&
          !this.preferredCountries.includes(this.$selectedCountry().iso2)
        ) {
          this.$preferredCountriesInDropDown.update((values) => {
            return [...values, this.$selectedCountry()]
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
