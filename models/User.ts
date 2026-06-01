import {
  model,
  models,
  Schema,
  type InferSchemaType,
  type Model,
  type Types,
} from "mongoose";

const userSchema = new Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    firstName: {
      type: String,
      default: "",
      trim: true,
    },
    lastName: {
      type: String,
      default: "",
      trim: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

export type User = InferSchemaType<typeof userSchema> & {
  _id: Types.ObjectId;
};

export const UserModel =
  (models.User as Model<User> | undefined) ?? model<User>("User", userSchema);
