export interface CountryFlag {
  iso2: string
  dialCode: string
  name?: string
  areaCodes?: string[]
}

export interface Country extends CountryFlag {
  name: string
  priority: number
  placeholder?: string
}
