import { DialogModule } from '@angular/cdk/dialog'
import { ChangeDetectionStrategy, Component } from '@angular/core'
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatDialogModule } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { NgxMatInputTelComponent } from 'projects/ngx-mat-input-tel/src/public-api'

@Component({
  selector: 'ngx-dialog',
  imports: [
    // Forms
    ReactiveFormsModule,
    MatFormFieldModule,

    // Mat
    DialogModule,
    MatButtonModule,
    MatDialogModule,

    // Components
    NgxMatInputTelComponent,
  ],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent {
  phoneForm = new FormGroup({
    phone: new FormControl(null, [Validators.required, Validators.maxLength(12)]),
  })
}
