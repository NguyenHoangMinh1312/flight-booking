import mongoose from "mongoose"
import { Password } from "../utils/password"
import { UserRole } from "@mint1312-flight-booking/common"

// interface that describes the properties to create a new user
interface UserAttrs {
  email: string,
  password: string,
  role: UserRole,
  isVerified?: boolean
}

// interface that describes the properties that a User model has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc
}

// interface that describes the properties that User document has
interface UserDoc extends mongoose.Document {
  id: string
  email: string,
  password: string,
  role: UserRole,
  isVerified: boolean
}

// User model schema
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    toJSON: {
      transform(_doc, ret) {
        return {
          id: ret._id,
          email: ret.email,
          role: ret.role
        }
      }
    }
  }
)

// hash password before saving to db
userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"))
    this.set("password", hashed)
  }
})

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs)
}

const User = mongoose.model<UserDoc, UserModel>("User", userSchema)

export { User }
