import request from "supertest";
import { app } from "../../app"
import { UserRole } from "@mint1312-flight-booking/common";
import { User } from "../../models/user";
import mongoose from "mongoose";

it(
  "Returns 200 when a manager get user account infomation",
  async () => {
    const customer = User.build({
      email: "customer@test.com",
      password: "password",
      role: UserRole.Customer,
      isVerified: true
    })
    await customer.save()

    const cookie = await global.signin("manager@test.com", UserRole.Manager)
    const response = await request(app)
      .get(`/api/users/${customer.id}`)
      .set("Cookie", cookie)
      .expect(200)

    expect(response.body.id).toEqual(customer.id)
    expect(response.body.email).toEqual(customer.email)
  }
)

it(
  "Returns 403 when a customer get other user account infomation",
  async () => {
    const customer = User.build({
      email: "customer@test.com",
      password: "password",
      role: UserRole.Customer
    })
    await customer.save()

    const cookie = await global.signin("manager@test.com", UserRole.Customer)
    await request(app)
      .get(`/api/users/${customer.id}`)
      .set("Cookie", cookie)
      .expect(403)
  }
)

it(
  "Returns 404 when the account does not exists",
  async () => {
    const cookie = await global.signin("manager@test.com", UserRole.Manager)

    const id = new mongoose.Types.ObjectId().toHexString()

    await request(app)
      .get(`/api/users/${id}`)
      .set("Cookie", cookie)
      .expect(404)
  }
)

it(
  "Returns 401 when user is not signed in",
  async () => {
    const id = new mongoose.Types.ObjectId().toHexString()

    await request(app)
      .get(`/api/users/${id}`)
      .expect(401)
  }
)

it(
  "Returns 404 when the customer account is not verified",
  async () => {
    const unverifiedCustomer = User.build({
      email: "unverified@test.com",
      password: "password",
      role: UserRole.Customer,
      isVerified: false
    })
    await unverifiedCustomer.save()

    const cookie = await global.signin("manager@test.com", UserRole.Manager)

    await request(app)
      .get(`/api/users/${unverifiedCustomer.id}`)
      .set("Cookie", cookie)
      .expect(404)
  }
)
