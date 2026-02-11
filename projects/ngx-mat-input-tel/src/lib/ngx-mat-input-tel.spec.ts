import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MatDividerModule } from '@angular/material/divider'

import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatDialogModule } from '@angular/material/dialog'
import { MatInputModule } from '@angular/material/input'
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

    it('should only have focused class on button when button has focus', () => {
      component.onDialCodeFocus()
      fixture.detectChanges()

      const button = fixture.nativeElement.querySelector('.country-selector')
      expect(button.classList.contains('focused')).toBe(true)
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

  describe('onlyCountries validation', () => {
    beforeEach(() => {
      // Set up ngControl for validation tests
      const formControl = new FormControl()
      component.ngControl = {
        control: formControl,
      } as any
      fixture.detectChanges()
    })

    it('should mark country as invalid when typing a disallowed country code', () => {
      // Restrict to only France and Germany
      component.onlyCountries = ['FR', 'DE']
      fixture.detectChanges()

      // Type Switzerland number (+41) - valid Swiss number
      component.phoneNumber = '+41 44 668 18 00' as any
      component.onPhoneNumberChange()
      fixture.detectChanges()

      // Should detect Switzerland but mark as invalid
      expect(component.$isCountryInvalid()).toBe(true)
      expect(component.$selectedCountry().iso2).toBe('CH')
      expect(component.ngControl.control?.errors).toEqual({ invalidCountry: true })
    })

    it('should mark country as valid when typing an allowed country code', () => {
      // Restrict to only France and Germany
      component.onlyCountries = ['FR', 'DE']
      fixture.detectChanges()

      // Type France number (+33) - valid French number
      component.phoneNumber = '+33 1 42 86 82 00' as any
      component.onPhoneNumberChange()
      fixture.detectChanges()

      // Should detect France and mark as valid
      expect(component.$isCountryInvalid()).toBe(false)
      expect(component.$selectedCountry().iso2).toBe('FR')
      expect(component.ngControl.control?.errors?.['invalidCountry']).toBeUndefined()
    })

    it('should clear invalid state when user manually selects an allowed country', () => {
      // Restrict to only France and Germany
      component.onlyCountries = ['FR', 'DE']
      fixture.detectChanges()

      // First, type a disallowed country - valid Swiss number
      component.phoneNumber = '+41 44 668 18 00' as any
      component.onPhoneNumberChange()
      fixture.detectChanges()
      expect(component.$isCountryInvalid()).toBe(true)

      // Now manually select France
      const france = component.$availableCountries()['FR']
      component.onCountrySelect({ key: 'FR', value: france })
      fixture.detectChanges()

      // Should clear the invalid state
      expect(component.$isCountryInvalid()).toBe(false)
      expect(component.$selectedCountry().iso2).toBe('FR')
      expect(component.ngControl.control?.errors?.['invalidCountry']).toBeUndefined()
    })

    it('should allow any country when onlyCountries is not set', () => {
      // Don't set onlyCountries (all countries available)
      component.phoneNumber = '+41 44 668 18 00' as any
      component.onPhoneNumberChange()
      fixture.detectChanges()

      // Switzerland should be valid
      expect(component.$isCountryInvalid()).toBe(false)
      expect(component.$selectedCountry().iso2).toBe('CH')
      expect(component.ngControl.control?.errors?.['invalidCountry']).toBeUndefined()
    })

    it('should clear invalid state when phone number is cleared', () => {
      // Restrict to only France and Germany
      component.onlyCountries = ['FR', 'DE']
      fixture.detectChanges()

      // Type Switzerland number - valid Swiss number
      component.phoneNumber = '+41 44 668 18 00' as any
      component.onPhoneNumberChange()
      fixture.detectChanges()
      expect(component.$isCountryInvalid()).toBe(true)

      // Clear the phone number
      component.phoneNumber = '' as any
      component.onPhoneNumberChange()
      fixture.detectChanges()

      // Should clear the invalid state
      expect(component.$isCountryInvalid()).toBe(false)
    })
  })
})
