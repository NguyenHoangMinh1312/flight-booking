import mongoose from "mongoose"

// interface that describes the properties to create a new user
interface UserAttrs {
  id: string
  email: string
}

// interface that describes the properties that a User model has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc
}

// interface that describes the properties that User document has
export interface UserDoc extends mongoose.Document {
  id: string
  email: string,
}

// User model schema
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true
    },
  },
)

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User({
    _id: attrs.id,
    email: attrs.email
  })
}

const User = mongoose.model<UserDoc, UserModel>("User", userSchema)

export { User }
