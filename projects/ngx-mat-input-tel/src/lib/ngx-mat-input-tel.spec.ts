/// <reference types="vitest/globals" />
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDividerModule } from "@angular/material/divider";
import { By } from "@angular/platform-browser";
import { vi } from "vitest";

import { CommonModule } from "@angular/common";
import { Component, signal } from "@angular/core";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FormField, FormRoot, type FieldTree, form } from "@angular/forms/signals";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { E164Number, NationalNumber } from "libphonenumber-js";
import { NgxMatInputTelComponent } from "./ngx-mat-input-tel";

@Component({
  template: `
    <form [formRoot]="signalForm">
      <ngx-mat-input-tel [formField]="phoneField"></ngx-mat-input-tel>
    </form>
  `,
  imports: [NgxMatInputTelComponent, FormRoot, FormField],
})
class SignalFormHostComponent {
  phoneModel = signal<{ phone: string | null }>({ phone: null });
  signalForm = form(this.phoneModel);
  phoneField: FieldTree<string | null> = this.signalForm.phone;
}

@Component({
  template: `<ngx-mat-input-tel [formControl]="phone" format="international" />`,
  imports: [NgxMatInputTelComponent, ReactiveFormsModule],
})
class ReactiveFormHostComponent {
  phone = new FormControl<string | null>(null);
}

@Component({
  template: `
    <mat-form-field>
      <mat-label>Phone</mat-label>
      <ngx-mat-input-tel
        [formControl]="phone"
        [inputId]="inputId()"
        [required]="required()"
        [ariaInvalid]="invalid()"
        [ariaDescribedBy]="description()"
      />
      <mat-hint id="phone-hint">Include the country code</mat-hint>
      <mat-error id="phone-error">Invalid number</mat-error>
    </mat-form-field>
  `,
  imports: [NgxMatInputTelComponent, ReactiveFormsModule, MatFormFieldModule],
})
class AccessibleFormHostComponent {
  phone = new FormControl<string | null>(null);
  inputId = signal("contact-phone");
  required = signal(true);
  invalid = signal<boolean | null>(null);
  description = signal<string | null>("contact-help");
}

describe("NgxMatInputTelComponent", () => {
  let component: NgxMatInputTelComponent;
  let fixture: ComponentFixture<NgxMatInputTelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        MatInputModule,
        MatDialogModule,
        MatButtonModule,
        MatDividerModule,
        ReactiveFormsModule,
        NgxMatInputTelComponent,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxMatInputTelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("Separated Dial Code Focus", () => {
    beforeEach(() => {
      component.separateDialCode = true;
      fixture.detectChanges();
    });

    it("should set isDialCodeFocused to true when dial code button receives focus", () => {
      expect(component.isDialCodeFocused).toBe(false);
      component.onDialCodeFocus();
      expect(component.isDialCodeFocused).toBe(true);
    });

    it("should set isDialCodeFocused to false when dial code button loses focus", () => {
      component.isDialCodeFocused = true;
      component.onDialCodeBlur();
      expect(component.isDialCodeFocused).toBe(false);
    });

    it("should set isPhoneInputFocused to true when phone input receives focus", () => {
      expect(component.isPhoneInputFocused).toBe(false);
      component.onPhoneInputFocus();
      expect(component.isPhoneInputFocused).toBe(true);
    });

    it("should set isPhoneInputFocused to false when phone input loses focus", () => {
      component.isPhoneInputFocused = true;
      component.onPhoneInputBlur();
      expect(component.isPhoneInputFocused).toBe(false);
    });

    it("should not set component.focused when dial code button gets focus in separated mode", () => {
      component.focused = false;
      component.onDialCodeFocus();
      expect(component.focused).toBe(false);
    });

    it("should set component.focused when phone input gets focus in separated mode", () => {
      component.focused = false;
      component.onPhoneInputFocus();
      expect(component.focused).toBe(true);
    });

    it("should verify separateDialCode and focus state in separated mode", () => {
      component.onDialCodeFocus();
      fixture.detectChanges();

      // Verify component state
      expect(component.separateDialCode).toBe(true);
      expect(component.isDialCodeFocused).toBe(true);
      expect(component.isPhoneInputFocused).toBe(false);
      expect(component.focused).toBe(false); // mat-form-field should not be focused
    });

    it("should not have focused class on button when phone input has focus", () => {
      component.onPhoneInputFocus();
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector(".country-selector");
      expect(button.classList.contains("focused")).toBe(false);
      expect(component.isDialCodeFocused).toBe(false);
      expect(component.isPhoneInputFocused).toBe(true);
      expect(component.focused).toBe(true); // mat-form-field should be focused
    });

    it("should handle rapid focus switching between elements", () => {
      // Focus button
      component.onDialCodeFocus();
      expect(component.isDialCodeFocused).toBe(true);
      expect(component.focused).toBe(false);

      // Switch to input without blur event (edge case)
      component.onPhoneInputFocus();
      expect(component.isPhoneInputFocused).toBe(true);
      expect(component.focused).toBe(true);

      // Now blur button
      component.onDialCodeBlur();
      expect(component.isDialCodeFocused).toBe(false);
      expect(component.focused).toBe(true); // Should stay true because input is focused
    });
  });

  describe("enablePlaceholder", () => {
    it("should populate selectedCountry placeholder when enablePlaceholder is set before ngOnInit", () => {
      // Create a new fixture so we can set the input before the component initialises
      const localFixture = TestBed.createComponent(NgxMatInputTelComponent);
      const localComponent = localFixture.componentInstance;

      localComponent.enablePlaceholder = true;
      localComponent.defaultCountry = "US";

      // detectChanges triggers ngOnInit
      localFixture.detectChanges();

      expect(localComponent.$selectedCountry().placeholder).toBeTruthy();
    });

    it("should leave selectedCountry placeholder empty when enablePlaceholder is not set", () => {
      const localFixture = TestBed.createComponent(NgxMatInputTelComponent);
      const localComponent = localFixture.componentInstance;

      localComponent.defaultCountry = "US";
      localFixture.detectChanges();

      expect(localComponent.$selectedCountry().placeholder).toBeFalsy();
    });

    it("should populate placeholders when onlyCountries is set and enablePlaceholder is true", () => {
      const localFixture = TestBed.createComponent(NgxMatInputTelComponent);
      const localComponent = localFixture.componentInstance;

      localComponent.enablePlaceholder = true;
      localComponent.onlyCountries = ["US", "GB"];
      localComponent.defaultCountry = "US";
      localFixture.detectChanges();

      expect(localComponent.$selectedCountry().placeholder).toBeTruthy();
      expect(localComponent.$availableCountries().US.placeholder).toBeTruthy();
      expect(localComponent.$availableCountries().GB.placeholder).toBeTruthy();
    });
  });

  describe("Input and Label Bindings", () => {
    it("should render input element", () => {
      const input = fixture.nativeElement.querySelector("input");
      expect(input).toBeTruthy();
      expect(input.type).toBe("tel");
    });

    it("should bind placeholder input correctly", () => {
      component.placeholder = "Enter phone number";
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector("input");
      // When placeholder is set, it should be used (or country name if empty)
      expect(component.placeholder).toBe("Enter phone number");
    });

    it("should render country selector button", () => {
      const button = fixture.nativeElement.querySelector(".country-selector");
      expect(button).toBeTruthy();
    });

    it("should bind aria-label input correctly", () => {
      const customLabel = "Choose your country";
      component.ariaLabel = customLabel;
      fixture.detectChanges();

      // Verify the property is set on the component
      expect(component.ariaLabel).toBe(customLabel);
    });

    it("should forward native attributes and update the Material label", async () => {
      const host = TestBed.createComponent(AccessibleFormHostComponent);
      await host.whenStable();
      const input: HTMLInputElement = host.nativeElement.querySelector("input");
      const label: HTMLLabelElement = host.nativeElement.querySelector("label");

      expect(input.id).toBe("contact-phone");
      expect(label.control).toBe(input);
      expect(input.required).toBe(true);
      expect(input.getAttribute("aria-required")).toBe("true");
      expect(input.getAttribute("aria-invalid")).toBe("false");
      expect(input.getAttribute("aria-describedby")).toBe("contact-help phone-hint");
      expect(host.nativeElement.querySelectorAll("#contact-phone")).toHaveLength(1);

      host.componentInstance.inputId.set("updated-phone");
      await host.whenStable();

      expect(input.id).toBe("updated-phone");
      expect(label.control).toBe(input);

      host.componentInstance.required.set(false);
      host.componentInstance.invalid.set(true);
      host.componentInstance.description.set("external-error");
      await host.whenStable();

      expect(input.required).toBe(false);
      expect(input.getAttribute("aria-required")).toBe("false");
      expect(input.getAttribute("aria-invalid")).toBe("true");
      expect(input.getAttribute("aria-describedby")).toBe("external-error phone-hint");

      host.componentInstance.description.set(null);
      host.componentInstance.invalid.set(false);
      await host.whenStable();

      expect(input.getAttribute("aria-invalid")).toBe("false");
      expect(input.getAttribute("aria-describedby")).toBe("phone-hint");
    });

    it("should connect Material errors and their invalid state to the native input", async () => {
      const host = TestBed.createComponent(AccessibleFormHostComponent);
      await host.whenStable();
      host.componentInstance.phone.setErrors({ validatePhoneNumber: true });
      host.componentInstance.phone.markAsTouched();
      host.changeDetectorRef.markForCheck();
      await host.whenStable();
      const input: HTMLInputElement = host.nativeElement.querySelector("input");

      expect(input.getAttribute("aria-invalid")).toBe("true");
      expect(input.getAttribute("aria-describedby")).toBe("contact-help phone-error");
    });

    it("should remove optional descriptions outside a Material form field", async () => {
      fixture.componentRef.setInput("ariaDescribedBy", "phone-help");
      await fixture.whenStable();
      const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
      expect(input.getAttribute("aria-describedby")).toBe("phone-help");

      fixture.componentRef.setInput("ariaDescribedBy", null);
      await fixture.whenStable();
      expect(input.hasAttribute("aria-describedby")).toBe(false);
    });

    it.each([true, false])(
      "should honor initial ariaInvalid=%s on a required input",
      async (invalid) => {
        const host = TestBed.createComponent(AccessibleFormHostComponent);
        host.componentInstance.invalid.set(invalid);
        await host.whenStable();

        expect(host.nativeElement.querySelector("input").getAttribute("aria-invalid")).toBe(
          String(invalid),
        );
      },
    );
  });

  describe("ControlValueAccessor Implementation", () => {
    it("should implement writeValue to update the phone number", () => {
      const testPhoneNumber = "+33123456789";
      component.writeValue(testPhoneNumber);
      fixture.detectChanges();

      expect(component.phoneNumber).toBeTruthy();
      expect(component.numberInstance).toBeTruthy();
      expect(component.numberInstance?.country).toBe("FR");
    });

    it("should update component phoneNumber when writeValue is called", () => {
      const testPhoneNumber = "+33123456789";
      component.writeValue(testPhoneNumber);
      fixture.detectChanges();

      expect(component.phoneNumber).toBeTruthy();
      expect(component.numberInstance).toBeTruthy();
    });

    it.each([null, undefined, ""])("should clear the display on writeValue(%s)", async (value) => {
      component.writeValue("+33123456789");
      await fixture.whenStable();
      const onChange = vi.fn();
      const onTouched = vi.fn();
      component.registerOnChange(onChange);
      component.registerOnTouched(onTouched);

      component.writeValue(value);
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector("input").value).toBe("");
      expect(component.numberInstance).toBeUndefined();
      expect(component.value).toBeNull();
      expect(onChange).not.toHaveBeenCalled();
      expect(onTouched).not.toHaveBeenCalled();
    });

    it.each(["+33123456789", "+80012345678", "not a phone"])(
      "should write %s without calling onChange or onTouched",
      async (value) => {
        const onChange = vi.fn();
        const onTouched = vi.fn();
        component.registerOnChange(onChange);
        component.registerOnTouched(onTouched);

        component.writeValue(value);
        await fixture.whenStable();

        expect(fixture.nativeElement.querySelector("input").value).toBe(component.phoneNumber);
        expect(component.value).toBe(value);
        expect(onChange).not.toHaveBeenCalled();
        expect(onTouched).not.toHaveBeenCalled();
      },
    );

    it("should update reactive forms silently and clear on reset", async () => {
      const host = TestBed.createComponent(ReactiveFormHostComponent);
      await host.whenStable();
      const control = host.componentInstance.phone;
      const changes = vi.fn();
      control.valueChanges.subscribe(changes);

      control.setValue("+33123456789", { emitEvent: false });
      await host.whenStable();

      expect(host.nativeElement.querySelector("input").value).toBe("+33 1 23 45 67 89");
      expect(changes).not.toHaveBeenCalled();
      expect(control.pristine).toBe(true);
      expect(control.untouched).toBe(true);

      control.reset(null, { emitEvent: false });
      await host.whenStable();

      expect(host.nativeElement.querySelector("input").value).toBe("");
      expect(control.value).toBeNull();
      expect(changes).not.toHaveBeenCalled();
      expect(control.pristine).toBe(true);
      expect(control.untouched).toBe(true);
    });

    it("should register onChange callback", () => {
      const mockCallback = vi.fn();
      component.registerOnChange(mockCallback);

      component.phoneNumber = "+33123456789" as E164Number | NationalNumber;
      component.onPhoneNumberChange();

      expect(mockCallback).toHaveBeenCalled();
    });

    it("should parse a national write using the selected country", async () => {
      component.writeValue("+33123456789");
      component.writeValue("01 23 45 67 89");
      await fixture.whenStable();

      expect(component.value).toBe("+33123456789");
      expect(component.$selectedCountry().iso2).toBe("FR");
      expect(fixture.nativeElement.querySelector("input").value).toBe("123456789");
    });

    it("should keep an unparseable write visible after a valid number", async () => {
      component.writeValue("+33123456789");
      component.writeValue("not a phone");
      fixture.componentRef.setInput("format", "international");
      await fixture.whenStable();

      expect(component.numberInstance).toBeUndefined();
      expect(fixture.nativeElement.querySelector("input").value).toBe("not a phone");
    });

    it("should clear parsed state and emit once on an explicit reset", async () => {
      component.writeValue("+33123456789");
      const onChange = vi.fn();
      component.registerOnChange(onChange);

      component.reset();
      fixture.componentRef.setInput("format", "international");
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector("input").value).toBe("");
      expect(component.numberInstance).toBeUndefined();
      expect(onChange).toHaveBeenCalledExactlyOnceWith(null);
    });

    it("should call onChange when user types in input", () => {
      const mockCallback = vi.fn();
      component.registerOnChange(mockCallback);

      const input = fixture.nativeElement.querySelector("input");
      input.value = "+33123456789";
      input.dispatchEvent(new Event("input"));
      fixture.detectChanges();

      expect(mockCallback).toHaveBeenCalled();
    });

    it("should register onTouched callback", () => {
      const mockCallback = vi.fn();
      component.registerOnTouched(mockCallback);

      expect(component.onTouched).toBe(mockCallback);
    });
  });

  describe("Country Selection", () => {
    it("should emit countryChanged when country is selected", () => {
      vi.spyOn(component.countryChanged, "emit");

      const country = component.getCountry("US");
      component.onCountrySelect({
        key: "US",
        value: country,
      });
      fixture.detectChanges();

      expect(component.countryChanged.emit).toHaveBeenCalledWith(country);
    });

    it("should update selected country when selecting a different country", () => {
      const usCountry = component.getCountry("US");
      component.onCountrySelect({
        key: "US",
        value: usCountry,
      });
      fixture.detectChanges();

      expect(component.$selectedCountry().iso2).toBe("US");
    });
  });

  describe("Disabled State", () => {
    it("should set disabled state when setDisabledState is called with true", () => {
      component.setDisabledState(true);
      fixture.detectChanges();

      expect(component.disabled).toBe(true);
    });

    it("should clear disabled state when setDisabledState is called with false", () => {
      component.setDisabledState(true);
      fixture.detectChanges();
      component.setDisabledState(false);
      fixture.detectChanges();

      expect(component.disabled).toBe(false);
    });

    it("should respect disabled state for country selector", () => {
      component.setDisabledState(true);
      fixture.detectChanges();

      expect(component.disabled).toBe(true);

      // Verify that openCountrySelector respects disabled state
      vi.spyOn(component["_dialog"], "open");
      component.openCountrySelector();
      expect(component["_dialog"].open).not.toHaveBeenCalled();
    });
  });

  describe("Signal forms integration", () => {
    let hostFixture: ComponentFixture<SignalFormHostComponent>;
    let hostComponent: SignalFormHostComponent;
    let hostInputTel: NgxMatInputTelComponent;

    beforeEach(() => {
      hostFixture = TestBed.createComponent(SignalFormHostComponent);
      hostComponent = hostFixture.componentInstance;
      hostFixture.detectChanges();
      hostInputTel = hostFixture.debugElement.query(
        By.directive(NgxMatInputTelComponent),
      ).componentInstance;
    });

    it("should write signal form value to ngx-mat-input-tel", () => {
      hostComponent.phoneModel.set({ phone: "+33123456789" });
      hostFixture.detectChanges();

      expect(hostInputTel.numberInstance?.country).toBe("FR");
      expect(hostInputTel.phoneNumber).toBeTruthy();
    });

    it("should propagate ngx-mat-input-tel changes to signal form", () => {
      const input = hostFixture.nativeElement.querySelector("input");
      input.value = "+33123456789";
      input.dispatchEvent(new Event("input"));
      hostFixture.detectChanges();

      expect(hostComponent.phoneModel().phone).toBe("+33123456789");
    });

    it("should clear the input when the signal model is cleared", async () => {
      hostComponent.phoneModel.set({ phone: "+33123456789" });
      await hostFixture.whenStable();
      hostComponent.phoneModel.set({ phone: null });
      await hostFixture.whenStable();

      expect(hostFixture.nativeElement.querySelector("input").value).toBe("");
      expect(hostComponent.phoneModel().phone).toBeNull();
    });
  });
});
