export interface IPaymentClient {
  pay(amount: number, currency: string, orderId: string, metadata: any): Promise<any>
  refund(transactionId: string, refundAmount: number, metadata: any): Promise<boolean>
}