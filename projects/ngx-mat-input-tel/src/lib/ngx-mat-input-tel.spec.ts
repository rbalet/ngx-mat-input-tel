import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MatDividerModule } from '@angular/material/divider'

import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
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

  describe('onlyCountries validation', () => {
    it('should mark country as invalid when phone number country is not in onlyCountries', () => {
      // Set onlyCountries to only US and GB
      component.onlyCountries = ['US', 'GB']
      fixture.detectChanges()

      // Enter a Swiss phone number (+41)
      component.phoneNumber = '+41 79 123 45 67' as any
      component.onPhoneNumberChange()
      fixture.detectChanges()

      // Country should be marked as invalid
      expect(component.$isCountryInvalid()).toBe(true)
    })

    it('should mark country as valid when phone number country is in onlyCountries', () => {
      // Set onlyCountries to only US and GB
      component.onlyCountries = ['US', 'GB']
      fixture.detectChanges()

      // Enter a US phone number
      component.phoneNumber = '+1 201 555 0123' as any
      component.onPhoneNumberChange()
      fixture.detectChanges()

      // Country should be marked as valid
      expect(component.$isCountryInvalid()).toBe(false)
    })

    it('should allow all countries when onlyCountries is not set', () => {
      // Don't set onlyCountries
      fixture.detectChanges()

      // Enter a Swiss phone number (+41)
      component.phoneNumber = '+41 79 123 45 67' as any
      component.onPhoneNumberChange()
      fixture.detectChanges()

      // Country should be valid since no restriction is set
      expect(component.$isCountryInvalid()).toBe(false)
    })
  })
})
