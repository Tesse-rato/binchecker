const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  origin: {
    type: String,
    required: true
  },
  binNumber: {
    type: String,
    unique: false,
    required: true
  },
  number: {
    length: Number,
    luhn: Boolean
  },
  scheme: {
    type: String,
    required: true,
  },
  type: {
    type: String,
  },
  bank: {
    name: String,
    url: String,
    phone: String,
    city: String
  }
});

module.exports = mongoose.model('cardSchema', cardSchema);