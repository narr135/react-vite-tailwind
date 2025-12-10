// server/scripts/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

// adjust path if you keep models in a different folder
const User = require(path.join(__dirname, '..', 'src', 'models', 'User'));
const Item = require(path.join(__dirname, '..', 'src', 'models', 'Item'));

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI not found in .env. Create a .env file with MONGO_URI.');
  process.exit(1);
}

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'AdminPass123'; // change after seeding for security

const sampleItems = [
  {
    title: 'Classic Wristwatch',
    description: 'A timeless analog wristwatch with leather strap and water resistance.',
    price: 79.99,
    imageUrl: 'https://picsum.photos/seed/watch/600/400',
    tags: ['accessories', 'watch']
  },
  {
    title: 'Wireless Earbuds',
    description: 'True wireless earbuds with noise reduction and 24h battery life.',
    price: 49.99,
    imageUrl: 'https://picsum.photos/seed/earbuds/600/400',
    tags: ['electronics', 'audio']
  },
  {
    title: 'Vintage Backpack',
    description: 'Durable canvas backpack with padded laptop compartment and multiple pockets.',
    price: 59.5,
    imageUrl: 'https://picsum.photos/seed/backpack/600/400',
    tags: ['bags', 'travel']
  },
  {
    title: 'Ceramic Mug Set',
    description: 'Set of 2 ceramic mugs — dishwasher safe and microwave friendly.',
    price: 19.99,
    imageUrl: 'https://picsum.photos/seed/mug/600/400',
    tags: ['home', 'kitchen']
  },
  {
    title: 'Yoga Mat Pro',
    description: 'Non-slip yoga mat with extra cushioning — ideal for all practice levels.',
    price: 29.99,
    imageUrl: 'https://picsum.photos/seed/yogamat/600/400',
    tags: ['fitness', 'wellness']
  }
];

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected.');

    // Create admin user if not exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      console.log(`Admin user already exists: ${ADMIN_EMAIL}`);
    } else {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, salt);

      const adminUser = new User({
        name: 'Admin',
        email: ADMIN_EMAIL,
        passwordHash,
        role: 'admin'
      });
      await adminUser.save();
      console.log(`Created admin user: ${ADMIN_EMAIL} (password: ${ADMIN_PASSWORD})`);
      console.log('⚠️  For security, change this password after first login or delete this user and create your own.');
    }

    // Insert sample items (skip duplicates by title)
    for (const it of sampleItems) {
      const exists = await Item.findOne({ title: it.title });
      if (exists) {
        console.log(`Item already exists, skipping: "${it.title}"`);
        continue;
      }
      const item = new Item({
        title: it.title,
        description: it.description,
        price: it.price,
        imageUrl: it.imageUrl,
        tags: it.tags
      });
      await item.save();
      console.log(`Inserted item: "${it.title}"`);
    }

    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

run();