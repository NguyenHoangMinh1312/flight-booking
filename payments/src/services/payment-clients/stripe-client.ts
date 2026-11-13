import { IPaymentClient } from "./payment-client-interface";
import Stripe, { Event } from "stripe"
import { PaymentIntent, Response } from "stripe";

export class StripeClient implements IPaymentClient {
  private api: Stripe
  private webhookSecret: string

  constructor(apiKey: string, webhookSecret: string) {
    this.api = new Stripe(apiKey)
    this.webhookSecret = webhookSecret
  }

  public async pay(amount: number, currency: string, orderId: string, metadata: any): Promise<Response<PaymentIntent>> {
    return this.api.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId,
        ...metadata
      }
    })
  }

  public async refund(transactionId: string, refundAmount: number, metadata: any) {
    const refund = await this.api.refunds.create({
      payment_intent: transactionId,
      amount: refundAmount,
      metadata
    })

    return refund.status === "succeeded" ? true : false
  }

  public constructEvent(payload: any, header: any): Event {
    return this.api.webhooks.constructEvent(payload, header, this.webhookSecret)
  }

  public async retrievePaymentIntent(paymentIntentId: string): Promise<Response<PaymentIntent>> {
    return this.api.paymentIntents.retrieve(paymentIntentId);
  }
}

export const stripeClient = new StripeClient(
  process.env.STRIPE_KEY || " ",
  process.env.STRIPE_WEBHOOK_SECRET || " "
)
