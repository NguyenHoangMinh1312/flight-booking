export const stripe = {
  paymentIntents: {
    retrieve: jest.fn(),
    create: jest.fn(),
  },
  refunds: {
    create: jest.fn(),
  },
  webhooks: {
    constructEvent: jest.fn(),
  },
}
