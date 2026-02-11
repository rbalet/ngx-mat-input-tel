import { KeyValuePipe } from '@angular/common'
import { Component, Inject, OnInit, ViewChild, ElementRef, computed, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'
import { MatDividerModule } from '@angular/material/divider'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatListModule } from '@angular/material/list'
import { Country } from '../model/country.model'
import { NgxMatInputTelFlagComponent } from '../ngx-mat-input-tel-flag/ngx-mat-input-tel-flag'

export interface CountrySelectDialogData {
  selectedCountry: Country
  availableCountries: Record<string, Country>
  preferredCountriesInDropDown: Record<string, Country>
  enableSearch: boolean
  searchPlaceholder: string
  ariaLabel: string
}

@Component({
  selector: 'ngx-mat-country-select-dialog',
  templateUrl: './country-select-dialog.component.html',
  styleUrls: ['./country-select-dialog.component.scss'],
  imports: [
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatDividerModule,
    KeyValuePipe,
    NgxMatInputTelFlagComponent,
  ],
})
export class CountrySelectDialogComponent implements OnInit {
  @ViewChild('searchInput', { static: false }) searchInput?: ElementRef<HTMLInputElement>

  $searchCriteria = signal<string>('')

  $selectableCountries = computed(() => {
    let countries: Record<string, Country> = {}
    if (!this.$searchCriteria() || this.$searchCriteria() === '') {
      countries = this.data.availableCountries
    } else {
      countries = this._getOnSearchCountries(
        this.$searchCriteria().toLowerCase(),
        this.data.availableCountries,
      )
    }

    // Remove preferred countries from the main list by creating a new object
    const preferredKeys = Object.keys(this.data.preferredCountriesInDropDown)
    const result: Record<string, Country> = {}
    for (const [iso2, country] of Object.entries(countries)) {
      if (!preferredKeys.includes(iso2)) {
        result[iso2] = country
      }
    }

    return result
  })

  $selectablePreferredCountriesInDropDown = computed(() => {
    if (!this.$searchCriteria() || this.$searchCriteria() === '') {
      return this.data.preferredCountriesInDropDown
    }

    return this._getOnSearchCountries(
      this.$searchCriteria().toLowerCase(),
      this.data.preferredCountriesInDropDown,
    )
  })

  $showDivider = computed(() => {
    return (
      Object.entries(this.data.preferredCountriesInDropDown).length > 0 &&
      Object.entries(this.$selectableCountries()).length > 0
    )
  })

  constructor(
    public dialogRef: MatDialogRef<CountrySelectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CountrySelectDialogData,
  ) {}

  ngOnInit(): void {
    // Focus search input after view init
    if (this.data.enableSearch) {
      setTimeout(() => {
        this.searchInput?.nativeElement?.focus()
      }, 0)
    }
  }

  onCountrySelect(country: { key: string; value: Country }): void {
    this.dialogRef.close({
      ...country.value,
      iso2: country.key,
    })
  }

  onClose(): void {
    this.dialogRef.close()
  }

  private _getOnSearchCountries(
    searchTerm: string,
    countries: Record<string, Country>,
  ): Record<string, Country> {
    const result: Record<string, Country> = {}
    for (const country of Object.values(countries)) {
      if (
        country.name.toLowerCase().includes(searchTerm) ||
        country.dialCode.includes(searchTerm) ||
        (country.areaCodes && country.areaCodes.join(',').includes(searchTerm))
      ) {
        result[country.iso2] = country
      }
    }
    return result
  }
}
