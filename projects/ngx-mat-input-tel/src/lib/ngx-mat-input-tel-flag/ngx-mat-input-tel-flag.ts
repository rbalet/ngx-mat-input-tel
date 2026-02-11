import { NgClass } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { MatTooltipModule } from '@angular/material/tooltip'
import { CountryFlag } from '../model/country.model'

@Component({
  selector: 'ngx-mat-input-tel-flag',
  imports: [NgClass, MatTooltipModule],
  template: `
    <div class="flag" [ngClass]="country.iso2"></div>

    @if (country.name) {
      <span class="country-selector-name">
        {{ country.name }}
      </span>
    }

    @if (country.dialCode) {
      <span class="country-selector-code">
        +{{ country.dialCode }}
      </span>
    }

    @if (country.areaCodes && country.areaCodes.length > 0) {
      <span 
        class="area-codes-badge"
        [matTooltip]="getAreaCodesFullList()"
        matTooltipPosition="above"
        [attr.aria-label]="'Area codes: ' + country.areaCodes.join(', ')"
      >
        {{ getAreaCodesDisplay() }}
      </span>
    }
  `,
  styleUrl: './ngx-mat-input-tel-flag.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxMatInputTelFlagComponent {
  @Input({ required: true }) country!: CountryFlag

  /**
   * Returns a compact display string for area codes
   * Examples:
   * - "Area: 201, 202 +4" (shows first 2 codes and count of remaining)
   * - "Area: 684" (shows single code)
   * - "Area: 201, 202" (shows 2 codes when there are only 2)
   */
  getAreaCodesDisplay(): string {
    if (!this.country.areaCodes || this.country.areaCodes.length === 0) {
      return ''
    }

    const codes = this.country.areaCodes
    const displayLimit = 2

    if (codes.length <= displayLimit) {
      return `Area: ${codes.join(', ')}`
    }

    const displayCodes = codes.slice(0, displayLimit).join(', ')
    const remainingCount = codes.length - displayLimit
    return `Area: ${displayCodes} +${remainingCount}`
  }

  /**
   * Returns the full list of area codes for tooltip display
   */
  getAreaCodesFullList(): string {
    if (!this.country.areaCodes || this.country.areaCodes.length === 0) {
      return ''
    }
    return `Area codes: ${this.country.areaCodes.join(', ')}`
  }
}
