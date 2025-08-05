import { JsonPipe, KeyValuePipe } from '@angular/common'
import { AfterViewInit, Component, inject, signal } from '@angular/core'
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatDialog } from '@angular/material/dialog'
import { MatDividerModule } from '@angular/material/divider'
import { MatFormFieldModule } from '@angular/material/form-field'
import { NgxMatInputTelComponent } from '../../../ngx-mat-input-tel/src/lib/ngx-mat-input-tel.component'
import { DialogComponent } from './dialog/dialog.component'

interface PhoneForm {
  phone: FormControl<string | null>
}

interface ProfileForm {
  phone: FormControl<string | null>
}

@Component({
  selector: 'ngx-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    // Forms
    ReactiveFormsModule,
    MatFormFieldModule,

    // Components
    NgxMatInputTelComponent,

    // Pipes
    JsonPipe,
    KeyValuePipe,

    // Mat
    MatButtonModule,
    MatDividerModule,
  ],
})
export class AppComponent implements AfterViewInit {
  readonly #matDialog = inject(MatDialog)

  phoneForm = new FormGroup<PhoneForm>({
    phone: new FormControl(null, [Validators.required, Validators.maxLength(12)]),
  })

  profileForm = new FormGroup<ProfileForm>({
    phone: new FormControl(null),
  })

  $onlyCountries = signal(['us', 'cl', 've'])

  constructor() {
    setTimeout(() => {
      // Fake onlyCountries change
      this.$onlyCountries.set(['us', 'cl'])
    }, 1000)
  }

  onSubmit() {
    this.phoneForm.markAllAsTouched()
  }

  onReset() {
    this.phoneForm.reset()
  }

  ngAfterViewInit() {
    this.phoneForm.valueChanges.subscribe((value) => {
      // Only emitting correct number
      console.log('phoneForm.valueChanges', value)
    })

    this.profileForm.valueChanges.subscribe((value) => {
      // Only emitting correct number
      console.log('phoneForm.valueChanges', value)
    })
  }

  openDialog() {
    const dialogRef = this.#matDialog.open(DialogComponent)

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed', result)
    })
  }
}
