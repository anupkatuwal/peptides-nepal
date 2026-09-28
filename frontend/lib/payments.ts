import { apiFetch } from "./api";

export type PaymentMethods = { esewa: boolean; khalti: boolean; test_mode: boolean };

type PaymentStart = {
  gateway: "esewa" | "khalti";
  redirect_url: string | null;
  form_action: string | null;
  form_fields: Record<string, string> | null;
};

export type PaymentResult = { order_id: number; paid: boolean; detail: string };

/** Sends the browser to eSewa or Khalti for this order. Resolves only if it fails to leave. */
export async function startPayment(orderId: number, token: string | null): Promise<void> {
  const start = await apiFetch<PaymentStart>(`/api/payments/orders/${orderId}/start`, { method: "POST", token });

  if (start.gateway === "khalti" && start.redirect_url) {
    window.location.assign(start.redirect_url);
    return;
  }
  if (start.gateway === "esewa" && start.form_action && start.form_fields) {
    // eSewa takes a signed HTML form POST, not a redirect.
    const form = document.createElement("form");
    form.method = "POST";
    form.action = start.form_action;
    for (const [name, value] of Object.entries(start.form_fields)) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
  }
}

export function paymentMethodsAvailable(): Promise<PaymentMethods> {
  return apiFetch<PaymentMethods>("/api/payments/methods");
}
