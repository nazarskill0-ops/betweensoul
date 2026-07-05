import type { PaymentProvider, PaymentProviderId } from "./types";
import { liqpayProvider } from "./providers/liqpay";
import { wayforpayProvider } from "./providers/wayforpay";

/*
  The one place that knows which gateways exist.
  Everywhere else asks for a provider by id and gets back the interface.
*/
const providers: Record<PaymentProviderId, PaymentProvider> = {
  liqpay: liqpayProvider,
  wayforpay: wayforpayProvider,
};

export function getPaymentProvider(id: PaymentProviderId): PaymentProvider {
  const provider = providers[id];
  if (!provider) throw new Error(`Unknown payment provider: ${id}`);
  return provider;
}

export function listPaymentProviders(): PaymentProviderId[] {
  return Object.keys(providers) as PaymentProviderId[];
}
