import { AbstractControl, ValidationErrors } from '@angular/forms'
import { parsePhoneNumberFromString, PhoneNumber } from 'libphonenumber-js'

export const ngxMatInputTelValidator = (control: AbstractControl): ValidationErrors | null => {
  const error = { validatePhoneNumber: true }
  let numberInstance: PhoneNumber | undefined

  if (control.value) {
    try {
      numberInstance = parsePhoneNumberFromString(control.value)
    } catch (e) {
      console.error(e)
      return error
    }

    if ((control.value || numberInstance) && !numberInstance?.isValid()) {
      if (!control.touched) {
        control.markAsTouched()
      }
      return error
    }
  }
  return null
}
