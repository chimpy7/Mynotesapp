import {
  model,
  models,
  Schema,
  type InferSchemaType,
  type Model,
  type Types,
} from "mongoose";

const subcategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
  },
  {
    _id: true,
    timestamps: true,
  },
);

const categorySchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    subcategories: {
      type: [subcategorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

categorySchema.index({ userId: 1, name: 1 });

export type Category = InferSchemaType<typeof categorySchema> & {
  _id: Types.ObjectId;
};

export const CategoryModel =
  (models.Category as Model<Category> | undefined) ??
  model<Category>("Category", categorySchema);
