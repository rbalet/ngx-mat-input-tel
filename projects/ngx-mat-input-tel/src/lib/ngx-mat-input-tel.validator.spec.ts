import { FormControl, Validators } from "@angular/forms";
import { describe, expect, it, vi } from "vitest";
import { ngxMatInputTelValidatorFactory } from "./ngx-mat-input-tel.validator";

describe("ngxMatInputTelValidatorFactory", () => {
  const validator = ngxMatInputTelValidatorFactory();

  it.each(["not a phone", "++", "1", "+33123", "   "])(
    "should reject %s without touching the control",
    (value) => {
      const control = new FormControl(value);

      expect(validator(control)).toEqual({ validatePhoneNumber: true });
      expect(control.untouched).toBe(true);
    },
  );

  it.each([null, undefined, "", "+33123456789"])("should accept %s", (value) => {
    const control = new FormControl(value);

    expect(validator(control)).toBeNull();
    expect(control.untouched).toBe(true);
  });

  it.each([0, false, {}])("should reject non-string value %s", (value) => {
    const logError = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const control = new FormControl(value);
      expect(validator(control)).toEqual({ validatePhoneNumber: true });
      expect(control.untouched).toBe(true);
    } finally {
      logError.mockRestore();
    }
  });

  it("should preserve country restrictions", () => {
    const restrictedValidator = ngxMatInputTelValidatorFactory(["US"]);
    const control = new FormControl("+33123456789");

    expect(restrictedValidator(control)).toEqual({ invalidCountry: true });
    expect(control.untouched).toBe(true);
    expect(restrictedValidator(new FormControl("+12025550123"))).toBeNull();
  });

  it("should preserve touched state and leave required validation to Angular", () => {
    const control = new FormControl("", [Validators.required, validator]);
    control.markAsTouched();
    control.updateValueAndValidity();

    expect(control.errors).toEqual({ required: true });
    expect(control.touched).toBe(true);
  });
});
