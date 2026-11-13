export const stripeClient = {
  pay: jest.fn(),
  refund: jest.fn(),
  constructEvent: jest.fn(),
  retrievePaymentIntent: jest.fn()
}
