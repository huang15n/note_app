import mongoose from 'mongoose';
import slugify from 'slugify';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 60,
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      maxlength: 300,
      default: '',
    },
    color: {
      type: String,
      default: '#6366f1',
    },
  },
  { timestamps: true }
);

categorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

export default mongoose.model('Category', categorySchema);
