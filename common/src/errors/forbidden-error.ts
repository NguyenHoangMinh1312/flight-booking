import { CustomError } from "./custom-error"

export class ForbiddenError extends CustomError {
  statusCode = 403

  constructor() {
    super("You are not permitted")
    Object.setPrototypeOf(this, ForbiddenError.prototype)
  }

  serializeErrors() {
    return [{ message: this.message }]
  }
}