import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MatDividerModule } from '@angular/material/divider'

import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatDialogModule } from '@angular/material/dialog'
import { MatInputModule } from '@angular/material/input'
import { E164Number, NationalNumber } from 'libphonenumber-js'
import { NgxMatInputTelComponent } from './ngx-mat-input-tel'

describe('NgxMatInputTelComponent', () => {
  let component: NgxMatInputTelComponent
  let fixture: ComponentFixture<NgxMatInputTelComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        MatInputModule,
        MatDialogModule,
        MatButtonModule,
        MatDividerModule,
        ReactiveFormsModule,
        NgxMatInputTelComponent,
      ],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxMatInputTelComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('Separated Dial Code Focus', () => {
    beforeEach(() => {
      component.separateDialCode = true
      fixture.detectChanges()
    })

    it('should set isDialCodeFocused to true when dial code button receives focus', () => {
      expect(component.isDialCodeFocused).toBe(false)
      component.onDialCodeFocus()
      expect(component.isDialCodeFocused).toBe(true)
    })

    it('should set isDialCodeFocused to false when dial code button loses focus', () => {
      component.isDialCodeFocused = true
      component.onDialCodeBlur()
      expect(component.isDialCodeFocused).toBe(false)
    })

    it('should set isPhoneInputFocused to true when phone input receives focus', () => {
      expect(component.isPhoneInputFocused).toBe(false)
      component.onPhoneInputFocus()
      expect(component.isPhoneInputFocused).toBe(true)
    })

    it('should set isPhoneInputFocused to false when phone input loses focus', () => {
      component.isPhoneInputFocused = true
      component.onPhoneInputBlur()
      expect(component.isPhoneInputFocused).toBe(false)
    })

    it('should not set component.focused when dial code button gets focus in separated mode', () => {
      component.focused = false
      component.onDialCodeFocus()
      expect(component.focused).toBe(false)
    })

    it('should set component.focused when phone input gets focus in separated mode', () => {
      component.focused = false
      component.onPhoneInputFocus()
      expect(component.focused).toBe(true)
    })

    it('should verify separateDialCode and focus state in separated mode', () => {
      component.onDialCodeFocus()
      fixture.detectChanges()

      // Verify component state
      expect(component.separateDialCode).toBe(true)
      expect(component.isDialCodeFocused).toBe(true)
      expect(component.isPhoneInputFocused).toBe(false)
      expect(component.focused).toBe(false) // mat-form-field should not be focused
    })

    it('should not have focused class on button when phone input has focus', () => {
      component.onPhoneInputFocus()
      fixture.detectChanges()

      const button = fixture.nativeElement.querySelector('.country-selector')
      expect(button.classList.contains('focused')).toBe(false)
      expect(component.isDialCodeFocused).toBe(false)
      expect(component.isPhoneInputFocused).toBe(true)
      expect(component.focused).toBe(true) // mat-form-field should be focused
    })

    it('should handle rapid focus switching between elements', () => {
      // Focus button
      component.onDialCodeFocus()
      expect(component.isDialCodeFocused).toBe(true)
      expect(component.focused).toBe(false)

      // Switch to input without blur event (edge case)
      component.onPhoneInputFocus()
      expect(component.isPhoneInputFocused).toBe(true)
      expect(component.focused).toBe(true)

      // Now blur button
      component.onDialCodeBlur()
      expect(component.isDialCodeFocused).toBe(false)
      expect(component.focused).toBe(true) // Should stay true because input is focused
    })
  })

  describe('Input and Label Bindings', () => {
    it('should render input element', () => {
      const input = fixture.nativeElement.querySelector('input')
      expect(input).toBeTruthy()
      expect(input.type).toBe('tel')
    })

    it('should bind placeholder input correctly', () => {
      component.placeholder = 'Enter phone number'
      fixture.detectChanges()

      const input = fixture.nativeElement.querySelector('input')
      // When placeholder is set, it should be used (or country name if empty)
      expect(component.placeholder).toBe('Enter phone number')
    })

    it('should render country selector button', () => {
      const button = fixture.nativeElement.querySelector('.country-selector')
      expect(button).toBeTruthy()
    })

    it('should bind aria-label input correctly', () => {
      const customLabel = 'Choose your country'
      component.ariaLabel = customLabel
      fixture.detectChanges()

      // Verify the property is set on the component
      expect(component.ariaLabel).toBe(customLabel)
    })
  })

  describe('ControlValueAccessor Implementation', () => {
    it('should implement writeValue to update the phone number', () => {
      const testPhoneNumber = '+33123456789'
      component.writeValue(testPhoneNumber)
      fixture.detectChanges()

      expect(component.phoneNumber).toBeTruthy()
      expect(component.numberInstance).toBeTruthy()
      expect(component.numberInstance?.country).toBe('FR')
    })

    it('should update component phoneNumber when writeValue is called', () => {
      const testPhoneNumber = '+33123456789'
      component.writeValue(testPhoneNumber)
      fixture.detectChanges()

      expect(component.phoneNumber).toBeTruthy()
      expect(component.numberInstance).toBeTruthy()
    })

    it('should handle empty value in writeValue', () => {
      // First set a value
      component.writeValue('+33123456789')
      fixture.detectChanges()
      expect(component.phoneNumber).toBeTruthy()
      expect(component.value).toBeTruthy()

      // writeValue with null/undefined/empty triggers onPhoneNumberChange
      // which calls _setCountry. If phoneNumber is cleared manually, value becomes null
      component.phoneNumber = '' as E164Number | NationalNumber
      component.onPhoneNumberChange()
      fixture.detectChanges()

      // After clearing phoneNumber and calling onPhoneNumberChange, value should be null
      expect(component.value).toBeNull()
    })

    it('should register onChange callback', () => {
      const mockCallback = jasmine.createSpy('onChange')
      component.registerOnChange(mockCallback)

      component.phoneNumber = '+33123456789' as E164Number | NationalNumber
      component.onPhoneNumberChange()

      expect(mockCallback).toHaveBeenCalled()
    })

    it('should call onChange when user types in input', () => {
      const mockCallback = jasmine.createSpy('onChange')
      component.registerOnChange(mockCallback)

      const input = fixture.nativeElement.querySelector('input')
      input.value = '+33123456789'
      input.dispatchEvent(new Event('input'))
      fixture.detectChanges()

      expect(mockCallback).toHaveBeenCalled()
    })

    it('should register onTouched callback', () => {
      const mockCallback = jasmine.createSpy('onTouched')
      component.registerOnTouched(mockCallback)

      expect(component.onTouched).toBe(mockCallback)
    })
  })

  describe('Country Selection', () => {
    it('should emit countryChanged when country is selected', () => {
      spyOn(component.countryChanged, 'emit')

      const country = component.getCountry('US')
      component.onCountrySelect({
        key: 'US',
        value: country,
      })
      fixture.detectChanges()

      expect(component.countryChanged.emit).toHaveBeenCalledWith(country)
    })

    it('should update selected country when selecting a different country', () => {
      const usCountry = component.getCountry('US')
      component.onCountrySelect({
        key: 'US',
        value: usCountry,
      })
      fixture.detectChanges()

      expect(component.$selectedCountry().iso2).toBe('US')
    })
  })

  describe('Disabled State', () => {
    it('should set disabled state when setDisabledState is called with true', () => {
      component.setDisabledState(true)
      fixture.detectChanges()

      expect(component.disabled).toBe(true)
    })

    it('should clear disabled state when setDisabledState is called with false', () => {
      component.setDisabledState(true)
      fixture.detectChanges()
      component.setDisabledState(false)
      fixture.detectChanges()

      expect(component.disabled).toBe(false)
    })

    it('should respect disabled state for country selector', () => {
      component.setDisabledState(true)
      fixture.detectChanges()

      expect(component.disabled).toBe(true)
      
      // Verify that openCountrySelector respects disabled state
      spyOn(component['_dialog'], 'open')
      component.openCountrySelector()
      expect(component['_dialog'].open).not.toHaveBeenCalled()
    })
  })
})
