import type {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentCallbackResult,
  PaymentProvider,
} from "../types";

/*
  LiqPay (PrivatBank) implementation — STUB.
  A vibecoder fills these two methods using the LiqPay API + secret keys
  from env. Do not import this file directly anywhere; go through
  getPaymentProvider("liqpay") in ../registry.ts.

  Docs: https://www.liqpay.ua/en/documentation
*/
export const liqpayProvider: PaymentProvider = {
  id: "liqpay",

  async createPayment(
    _input: CreatePaymentInput
  ): Promise<CreatePaymentResult> {
    // TODO: build the base64 `data` + `signature` (sha1 of private_key+data+private_key),
    // return the LiqPay checkout URL.
    throw new Error("liqpay.createPayment not implemented");
  },

  async verifyCallback(_request: Request): Promise<PaymentCallbackResult> {
    // TODO: recompute the signature from the raw body and compare. Reject on mismatch.
    throw new Error("liqpay.verifyCallback not implemented");
  },
};
