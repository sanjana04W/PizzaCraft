/**
 * PizzaCraft - Database Seeder
 * Seeds demo user and initial blog posts to MongoDB.
 * Usage: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { connectDB } = require('./config/db');
const User = require('./models/User');
const Blog = require('./models/Blog');
const Order = require('./models/Order');

const DEMO_USERS = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'pizza123',
    phone: '+91 98765 43210',
    address: '12 Pepperoni Avenue, Gourmet City',
    loyaltyPoints: 350
  },
  {
    name: 'Chef Marco Rossi',
    email: 'marco@pizzacraft.com',
    password: 'chef2024',
    phone: '+39 02 1234 5678',
    address: 'Via Napoli 42, Milan, Italy',
    loyaltyPoints: 1200
  }
];

const DEMO_BLOGS = [
  {
    title: 'The Secret Behind Perfect Neapolitan Pizza Dough',
    category: 'Baking Secrets',
    author: 'Chef Marco Rossi',
    avatar: 'https://ui-avatars.com/api/?name=Marco+Rossi&background=FF3838&color=fff',
    date: 'Nov 10, 2024',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80',
    content: `The art of Neapolitan pizza dough lies in patience and precision. True Neapolitan masters use 00 flour, fresh yeast, sea salt, and pure water—nothing more. The magic happens during the long cold fermentation (24-72 hours) which develops complex flavors and that characteristic airy, leopard-spotted crust.\n\nTemperature matters enormously: dough should be worked at room temperature around 20-22°C. When you stretch the dough, never use a rolling pin—your hands are the only tools a true pizzaiolo needs. The dough should be almost translucent at the edges, thick in the center for the cornicione (crust border).\n\nBaking at 450-500°C in a wood-fired oven for 60-90 seconds creates that perfect char and chew that no home oven can fully replicate, but understanding these principles brings you much closer to the original.`,
    likes: 42
  },
  {
    title: 'Italian Heritage: How Pizza Became the World\'s Favorite Food',
    category: 'Italian Heritage',
    author: 'Sofia Bianchi',
    avatar: 'https://ui-avatars.com/api/?name=Sofia+Bianchi&background=FF8C00&color=fff',
    date: 'Nov 5, 2024',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    content: `Pizza's story begins not in a trendy restaurant, but on the streets of Naples in the 18th century, where flatbreads topped with tomatoes, garlic, oil, and cheese were sold to the working poor.\n\nThe pivotal moment came in 1889 when pizzaiolo Raffaele Esposito created the Margherita pizza for Queen Margherita of Savoy, using the colors of the Italian flag: red tomato, white mozzarella, green basil. This royal endorsement catapulted pizza from street food to cultural icon.\n\nItalian immigrants brought their recipes to America in the late 1800s, and New York's coal-fired ovens created a new style. After World War II, soldiers returning from Italy spread the pizza gospel across America. Today, over 5 billion pizzas are eaten annually worldwide.`,
    likes: 38
  },
  {
    title: 'Pro Chef Tips: Choosing the Best Mozzarella for Your Pizza',
    category: 'Chef Tips',
    author: 'Chef Luca Ferretti',
    avatar: 'https://ui-avatars.com/api/?name=Luca+Ferretti&background=22C55E&color=fff',
    date: 'Oct 28, 2024',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800&auto=format&fit=crop&q=80',
    content: `Not all mozzarella is created equal, and understanding the differences can transform your pizza game. Fresh Mozzarella di Bufala Campana (buffalo mozzarella) with its PDO certification is the gold standard—creamy, slightly tangy, and incredibly melty.\n\nHowever, its high water content (60-65%) means it must be drained and sliced thick to prevent a soggy crust. Fior di latte (cow's milk fresh mozzarella) has less water and a milder flavor, making it more forgiving for home bakers.\n\nFor the ultimate approach: use a mix of low-moisture for structure and coverage, then add torn fresh mozzarella in the last 2 minutes of baking for creamy pockets of flavor.`,
    likes: 55
  }
];

async function seed() {
  console.log('\n🌱 PizzaCraft Database Seeder\n' + '='.repeat(40));

  const connected = await connectDB();
  if (!connected) {
    console.error('❌ Cannot seed — MongoDB is not running. Start MongoDB and retry.\n');
    process.exit(1);
  }

  try {
    // ── Seed Users ───────────────────────────────────────────────────────────
    console.log('\n👤 Seeding users...');
    let seededUsers = 0;
    for (const userData of DEMO_USERS) {
      const exists = await User.findOne({ email: userData.email });
      if (!exists) {
        await User.create(userData); // pre-save hook hashes password
        console.log(`   ✅ Created user: ${userData.email}`);
        seededUsers++;
      } else {
        console.log(`   ⏭️  Skipped (already exists): ${userData.email}`);
      }
    }
    console.log(`   → ${seededUsers} new users created`);

    // ── Seed Blogs ───────────────────────────────────────────────────────────
    console.log('\n📝 Seeding blogs...');
    const blogCount = await Blog.countDocuments();
    if (blogCount === 0) {
      await Blog.insertMany(DEMO_BLOGS);
      console.log(`   ✅ Inserted ${DEMO_BLOGS.length} blog posts`);
    } else {
      console.log(`   ⏭️  Skipped — ${blogCount} blogs already exist`);
    }

    // ── Summary ──────────────────────────────────────────────────────────────
    const totalUsers = await User.countDocuments();
    const totalBlogs = await Blog.countDocuments();
    const totalOrders = await Order.countDocuments();

    console.log('\n📊 Database Summary:');
    console.log(`   👤 Users:  ${totalUsers}`);
    console.log(`   📝 Blogs:  ${totalBlogs}`);
    console.log(`   📦 Orders: ${totalOrders}`);
    console.log('\n✅ Seeding complete!\n');

  } catch (err) {
    console.error('\n❌ Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected.\n');
    process.exit(0);
  }
}

seed();
