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
    })

    it('should not have focused class on button when phone input has focus', () => {
      component.onPhoneInputFocus()
      fixture.detectChanges()

      const button = fixture.nativeElement.querySelector('.country-selector')
      expect(button.classList.contains('focused')).toBe(false)
      expect(component.isDialCodeFocused).toBe(false)
      expect(component.isPhoneInputFocused).toBe(true)
    })
  })
})
