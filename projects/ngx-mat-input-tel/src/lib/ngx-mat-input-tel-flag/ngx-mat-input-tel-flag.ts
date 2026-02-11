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
      <span class="country-selector-code">+{{ country.dialCode }}</span>

      @if (country.areaCodes && country.areaCodes.length > 0) {
        <span
          class="area-codes-badge"
          [matTooltip]="getFullAreaCodesText()"
          matTooltipPosition="above"
          [attr.aria-label]="'Area codes: ' + country.areaCodes.join(', ')"
        >
          {{ getCompactAreaCodesText() }}
        </span>
      }
    }
  `,
  styleUrl: './ngx-mat-input-tel-flag.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxMatInputTelFlagComponent {
  @Input({ required: true }) country!: CountryFlag

  /**
   * Returns a compact representation of area codes for display
   * Shows first 2 area codes and indicates if there are more
   */
  getCompactAreaCodesText(): string {
    if (!this.country.areaCodes || this.country.areaCodes.length === 0) {
      return ''
    }

    const codes = this.country.areaCodes
    if (codes.length <= 2) {
      return `Area: ${codes.join(', ')}`
    }

    const remaining = codes.length - 2
    return `Area: ${codes[0]}, ${codes[1]} +${remaining}`
  }

  /**
   * Returns the full list of area codes for tooltip display
   */
  getFullAreaCodesText(): string {
    if (!this.country.areaCodes || this.country.areaCodes.length === 0) {
      return ''
    }

    return `Area codes: ${this.country.areaCodes.join(', ')}`
  }
}
