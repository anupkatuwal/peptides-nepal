// Order numbers look like DEL-PN-12345678.
// Checkout makes one before the order is saved, so the customer can see it on the
// payment card and write it in the eSewa / Khalti remarks. placeOrder then saves the
// order under that same number.
export const makeOrderNumber = (): string => {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `DEL-PN-${Date.now().toString().slice(-4)}${randomSuffix}`;
};

export const isOrderNumber = (value: string): boolean => /^DEL-PN-\d{8}$/.test(value);
