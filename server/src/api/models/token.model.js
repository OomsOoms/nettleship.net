const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema(
  {
    jti: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: '1h',
    },
  },
  { collection: 'tokens' }
);

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;
