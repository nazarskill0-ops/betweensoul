import type {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentCallbackResult,
  PaymentProvider,
} from "../types";

/*
  WayForPay implementation — STUB.
  Same contract as LiqPay. Fill using the WayForPay API + merchant secret
  from env. Go through getPaymentProvider("wayforpay") in ../registry.ts.

  Docs: https://wiki.wayforpay.com/en/
*/
export const wayforpayProvider: PaymentProvider = {
  id: "wayforpay",

  async createPayment(
    _input: CreatePaymentInput
  ): Promise<CreatePaymentResult> {
    // TODO: build the HMAC-MD5 merchantSignature over the ordered field list,
    // return the WayForPay purchase URL/form.
    throw new Error("wayforpay.createPayment not implemented");
  },

  async verifyCallback(_request: Request): Promise<PaymentCallbackResult> {
    // TODO: verify merchantSignature on the incoming callback. Reject on mismatch.
    throw new Error("wayforpay.verifyCallback not implemented");
  },
};
