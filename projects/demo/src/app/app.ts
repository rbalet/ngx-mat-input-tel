import { JsonPipe, KeyValuePipe } from "@angular/common";
import { AfterViewInit, Component, inject, signal } from "@angular/core";
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { FormField, FormRoot, type FieldTree, form, required } from "@angular/forms/signals";
import { MatButtonModule } from "@angular/material/button";
import { MatDialog } from "@angular/material/dialog";
import { MatDividerModule } from "@angular/material/divider";
import { MatFormFieldModule } from "@angular/material/form-field";
import { NgxMatInputTelComponent } from "../../../ngx-mat-input-tel/src/lib/ngx-mat-input-tel";
import { DialogComponent } from "./dialog/dialog";

interface requiredForm {
  phone: FormControl<string | null>;
}

interface ProfileForm {
  phone: FormControl<string | null>;
}

interface SignalProfileForm {
  phone: string | null;
}

@Component({
  selector: "ngx-root",
  templateUrl: "./app.html",
  styleUrls: ["./app.scss"],
  imports: [
    // Forms
    FormsModule,
    ReactiveFormsModule,
    FormField,
    FormRoot,
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
  readonly #matDialog = inject(MatDialog);

  requiredForm = new FormGroup<requiredForm>({
    phone: new FormControl(null, [Validators.required, Validators.maxLength(12)]),
  });

  normalForm = new FormGroup<ProfileForm>({
    phone: new FormControl(null),
  });

  signalProfileModel = signal<SignalProfileForm>({
    phone: null,
  });
  signalProfileForm = form(this.signalProfileModel, (path) => {
    required(path.phone);
  });
  signalProfilePhoneField: FieldTree<string | null> = this.signalProfileForm.phone;

  $onlyCountries = signal(["US", "DE"]);

  frCountriesName: Record<string, string> = {
    US: "États-Unis",
    FR: "France",
    DE: "Allemagne",
  };

  constructor() {
    setTimeout(() => {
      // Fake onlyCountries change - add FR
      this.$onlyCountries.set(["US", "DE", "FR"]);
    }, 1000);
  }

  onSubmit() {
    this.requiredForm.markAllAsTouched();
  }

  onReset() {
    this.requiredForm.reset();
  }

  ngAfterViewInit() {
    this.requiredForm.valueChanges.subscribe((value) => {
      // Only emitting correct number
      console.log("requiredForm.valueChanges", value);
    });

    this.normalForm.valueChanges.subscribe((value) => {
      // Only emitting correct number
      console.log("requiredForm.valueChanges", value);
    });
  }

  openDialog() {
    const dialogRef = this.#matDialog.open(DialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      console.log("The dialog was closed", result);
    });
  }
}
