import { AbstractControl, ValidationErrors } from '@angular/forms'
import { parsePhoneNumberFromString, PhoneNumber } from 'libphonenumber-js'

export function ngxMatInputTelValidatorFactory(onlyCountries: string[] = []) {
  return (control: AbstractControl): ValidationErrors | null => {
    const error = { validatePhoneNumber: true }
    let numberInstance: PhoneNumber | undefined

    if (control.value) {
      try {
        numberInstance = parsePhoneNumberFromString(control.value)
      } catch (e) {
        console.error(e)
        return error
      }

      if (control.value?.length <= 1 || (numberInstance && !numberInstance?.isValid())) {
        if (!control.touched) {
          control.markAsTouched()
        }
        return error
      }

      // Country validation
      if (onlyCountries.length && numberInstance?.country && !onlyCountries.includes(numberInstance.country)) {
        return { invalidCountry: true }
      }
    }
    return null
  }
}
