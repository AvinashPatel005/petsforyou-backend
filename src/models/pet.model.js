const mongoose = require('mongoose');

const PetSchema = new mongoose.Schema({
  species: { type: String, enum: ["Dog", "Cat", "Bird", "Fish", "Rabbit", "Other"], required: true },
  breed: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ["Male", "Female","Other"], required: true },
  status: { type: String, enum: ["Available", "Adopted", "Sold"], default: "Available" },
  price: { type: Number, default: 0 ,min:0},
  description: { type: String },
  images: [{ type: String }],
  vaccinations: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model("Pet", PetSchema);
