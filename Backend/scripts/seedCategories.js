require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Category = require('../models/Category');

const categories = [
  { name: 'Mobiles & Tablets', description: 'Smartphones, tablets, and mobile accessories' },
  { name: 'Electronics', description: 'Gadgets, cameras, audio devices and more' },
  { name: 'Computers & Accessories', description: 'Laptops, desktops, peripherals and components' },
  { name: 'TVs & Home Appliances', description: 'Televisions, refrigerators, washing machines and more' },
  { name: 'Fashion', description: 'Clothing for men, women, and kids' },
  { name: 'Footwear', description: 'Shoes, sandals, and sneakers for everyone' },
  { name: 'Beauty & Personal Care', description: 'Skincare, cosmetics, and grooming essentials' },
  { name: 'Home & Furniture', description: 'Furniture, decor, and home essentials' },
  { name: 'Kitchen & Dining', description: 'Cookware, utensils, and dining accessories' },
  { name: 'Grocery & Food', description: 'Daily essentials, snacks, and packaged food' },
  { name: 'Baby, Kids & Toys', description: 'Baby care, kids clothing, and toys' },
  { name: 'Sports & Fitness', description: 'Exercise equipment, activewear, and outdoor gear' },
  { name: 'Books & Stationery', description: 'Books, notebooks, and office supplies' },
  { name: 'Automotive', description: 'Car and bike accessories, parts, and tools' },
  { name: 'Jewellery, Bags & Luggage', description: 'Jewellery, handbags, wallets, and travel bags' },
];

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    for (const cat of categories) {
      const exists = await Category.findOne({ name: cat.name });
      if (exists) {
        console.log(`Skipped (already exists): ${cat.name}`);
        continue;
      }
      await Category.create(cat);
      console.log(`Created: ${cat.name}`);
    }

    console.log('Done seeding categories.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error.message);
    process.exit(1);
  }
};

seedCategories();