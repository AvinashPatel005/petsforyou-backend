const fs = require('fs');
const mongoose = require('mongoose');
const Product = require('../models/product.model.js');
const products = [
    {
      "name": "Dog Food - Premium",
      "description": "High-quality dog food with essential nutrients.",
      "price": 25.99,
      "category": "Food",
      "stock": 100,
      "images": ["https://example.com/dogfood.jpg"]
    },
    {
      "name": "Cat Food - Organic",
      "description": "Organic cat food for a healthy diet.",
      "price": 19.99,
      "category": "Food",
      "stock": 80,
      "images": ["https://example.com/catfood.jpg"]
    },
    {
      "name": "Bird Seeds Mix",
      "description": "Nutrient-rich seed mix for birds.",
      "price": 9.99,
      "category": "Food",
      "stock": 120,
      "images": ["https://example.com/birdseeds.jpg"]
    },
    {
      "name": "Fish Food Pellets",
      "description": "Floating fish pellets for all aquarium fish.",
      "price": 7.49,
      "category": "Food",
      "stock": 150,
      "images": ["https://example.com/fishfood.jpg"]
    },
    {
      "name": "Rabbit Food - Carrot Mix",
      "description": "Special carrot and hay mix for rabbits.",
      "price": 14.99,
      "category": "Food",
      "stock": 90,
      "images": ["https://example.com/rabbitfood.jpg"]
    },
    {
      "name": "Cat Toy - Mouse",
      "description": "A fun mouse toy for cats to play with.",
      "price": 5.49,
      "category": "Toys",
      "stock": 200,
      "images": ["https://example.com/cattoy.jpg"]
    },
    {
      "name": "Squeaky Dog Ball",
      "description": "Durable squeaky ball for dogs.",
      "price": 8.99,
      "category": "Toys",
      "stock": 150,
      "images": ["https://example.com/dogball.jpg"]
    },
    {
      "name": "Bird Swing Toy",
      "description": "Wooden swing toy for pet birds.",
      "price": 6.99,
      "category": "Toys",
      "stock": 120,
      "images": ["https://example.com/birdtoy.jpg"]
    },
    {
      "name": "Chew Rope for Dogs",
      "description": "Strong chew rope to keep dogs engaged.",
      "price": 10.49,
      "category": "Toys",
      "stock": 100,
      "images": ["https://example.com/chewrope.jpg"]
    },
    {
      "name": "Hamster Running Wheel",
      "description": "Exercise wheel for hamsters.",
      "price": 11.99,
      "category": "Toys",
      "stock": 130,
      "images": ["https://example.com/hamsterwheel.jpg"]
    },
    {
      "name": "Pet Shampoo",
      "description": "Organic shampoo for all pets.",
      "price": 12.99,
      "category": "Grooming",
      "stock": 50,
      "images": ["https://example.com/shampoo.jpg"]
    },
    {
      "name": "Flea & Tick Spray",
      "description": "Protects pets from fleas and ticks.",
      "price": 14.99,
      "category": "Grooming",
      "stock": 60,
      "images": ["https://example.com/fleaspray.jpg"]
    },
    {
      "name": "Dog Nail Clipper",
      "description": "Stainless steel nail clippers for dogs.",
      "price": 9.99,
      "category": "Grooming",
      "stock": 80,
      "images": ["https://example.com/nailclipper.jpg"]
    },
    {
      "name": "Pet Hair Brush",
      "description": "Soft-bristle brush for removing loose fur.",
      "price": 7.99,
      "category": "Grooming",
      "stock": 100,
      "images": ["https://example.com/hairbrush.jpg"]
    },
    {
      "name": "Cat Grooming Gloves",
      "description": "Massage and groom your cat while petting.",
      "price": 11.49,
      "category": "Grooming",
      "stock": 70,
      "images": ["https://example.com/groominggloves.jpg"]
    }
  ]
  
const MONGO_URI = '__PASTE_YOUR_OWN__';

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("DB Connection Error:", err));

const importProducts = async () => {
  try {
    await Product.insertMany(products);
    console.log("Products inserted successfully!");
  } catch (error) {
    console.error("Error inserting products:", error);
  } finally {
    mongoose.connection.close();
  }
};

importProducts();
