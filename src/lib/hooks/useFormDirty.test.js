import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFormDirty } from "./useFormDirty";

describe("useFormDirty", () => {
  it("is clean on first render and dirty after the form changes", () => {
    const { result, rerender } = renderHook(({ form }) => useFormDirty(form), {
      initialProps: { form: { a: "1" } },
    });
    expect(result.current).toBe(false);
    rerender({ form: { a: "2" } });
    expect(result.current).toBe(true);
    rerender({ form: { a: "1" } });
    expect(result.current).toBe(false);
  });

  it("waits for ready before taking the baseline", () => {
    const { result, rerender } = renderHook(
      ({ form, ready }) => useFormDirty(form, { ready }),
      { initialProps: { form: { a: "" }, ready: false } },
    );
    expect(result.current).toBe(false);
    rerender({ form: { a: "loaded" }, ready: true }); // prefill = baseline
    expect(result.current).toBe(false);
    rerender({ form: { a: "edited" }, ready: true });
    expect(result.current).toBe(true);
  });

  it("is forced clean when disabled", () => {
    const { result, rerender } = renderHook(
      ({ form, disabled }) => useFormDirty(form, { disabled }),
      { initialProps: { form: { a: "1" }, disabled: false } },
    );
    rerender({ form: { a: "2" }, disabled: false });
    expect(result.current).toBe(true);
    rerender({ form: { a: "2" }, disabled: true });
    expect(result.current).toBe(false);
  });
});
