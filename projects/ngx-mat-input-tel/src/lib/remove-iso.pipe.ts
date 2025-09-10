import { Pipe, PipeTransform } from '@angular/core'
import { Country } from './model/country.model'

@Pipe({
  name: 'removeIso',
})
export class RemoveIsoPipe implements PipeTransform {
  transform(country: Country): string {
    if (!country?.placeholder || !country?.dialCode) return country?.placeholder || ''

    return country.placeholder.replace(`+${country.dialCode}`, '')
  }
}
