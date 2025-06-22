import { NgClass } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { CountryFlag } from '../model/country.model'

@Component({
  selector: 'ngx-mat-input-tel-flag',
  imports: [NgClass],
  template: `<div class="flag" [ngClass]="country.flagClass"></div>

    @if (country.name) {
      {{ country.name }}
    }

    @if (country.dialCode) {
      <span class="country-selector-code"
        >+{{ country.dialCode }}

        @if (country.areaCodes) {
          {{ country.areaCodes.join(', ') }}
        }
      </span>
    }`,
  styleUrl: './ngx-mat-input-tel-flag.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxMatInputTelFlagComponent {
  @Input({ required: true }) country!: CountryFlag
}
