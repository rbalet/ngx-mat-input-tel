export interface CountryFlag {
  flagClass: string
  dialCode: string
  name?: string
  areaCodes?: string[]
}

export interface Country extends CountryFlag {
  name: string
  iso2: string
  priority: number
  placeHolder?: string
}
