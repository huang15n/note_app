import mongoose from 'mongoose';
import slugify from 'slugify';

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 40,
    },
    slug: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

tagSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

export default mongoose.model('Tag', tagSchema);
