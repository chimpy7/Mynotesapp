import {
  model,
  models,
  Schema,
  type InferSchemaType,
  type Model,
  type Types,
} from "mongoose";

const documentSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    content: {
      type: Schema.Types.Mixed,
      default: null,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    subcategoryId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

documentSchema.index({ userId: 1, createdAt: -1 });
documentSchema.index({ userId: 1, categoryId: 1, subcategoryId: 1 });

export type Document = InferSchemaType<typeof documentSchema> & {
  _id: Types.ObjectId;
};

export const DocumentModel =
  (models.Document as Model<Document> | undefined) ??
  model<Document>("Document", documentSchema);
