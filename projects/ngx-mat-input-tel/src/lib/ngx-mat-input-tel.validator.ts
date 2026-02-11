import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms'
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

    if (control.value?.length <= 1 || (numberInstance && !numberInstance?.isValid())) {
      if (!control.touched) {
        control.markAsTouched()
      }
      return error
    }
  }
  return null
}

/**
 * Validator factory for checking if the detected country is in the onlyCountries list
 * @param getAvailableCountries Function that returns the available countries record
 * @param getAllCountriesCount Function that returns the total count of all countries
 * @param getSelectedCountry Function that returns the currently selected country ISO code
 */
export function createOnlyCountriesValidator(
  getAvailableCountries: () => Record<string, any>,
  getAllCountriesCount: () => number,
  getSelectedCountry: () => string
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null
    }

    try {
      const numberInstance = parsePhoneNumberFromString(control.value)
      
      if (!numberInstance || !numberInstance.country) {
        return null
      }

      const availableCountries = getAvailableCountries()
      const allCountriesCount = getAllCountriesCount()
      const detectedCountry = numberInstance.country
      
      // If no restrictions (all countries available), any country is allowed
      if (Object.keys(availableCountries).length === allCountriesCount) {
        return null
      }
      
      // Check if the detected country is in the available countries list
      const isAllowed = detectedCountry.toUpperCase() in availableCountries
      
      if (!isAllowed) {
        return { invalidCountry: true }
      }
      
      return null
    } catch (e) {
      return null
    }
  }
}
