const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');

const seedData = [
  {
    name: 'Oil Filter Premium',
    category: 'parts',
    price: 500,
    stock: 50,
    brand: 'Mobil',
    description: 'High quality oil filter for all cars',
    images: ['https://images.unsplash.com/photo-1628886139465-38b09603f389?q=80&w=800&auto=format&fit=crop'],
    isVerified: true
  },
  {
    name: 'Air Filter Pro',
    category: 'parts',
    price: 800,
    stock: 45,
    brand: 'Bosch',
    description: 'Engine air filter replacement',
    images: ['https://images.unsplash.com/photo-1608567663783-b7c06b4be7ae?q=80&w=800&auto=format&fit=crop'],
    isVerified: true
  },
  {
    name: 'Brake Pads Heavy Duty',
    category: 'parts',
    price: 2500,
    stock: 30,
    brand: 'Brembo',
    description: 'Heavy duty brake pads with superior stopping power',
    images: ['https://images.unsplash.com/photo-1566833050856-e3d2a1fdf3f7?q=80&w=800&auto=format&fit=crop'],
    isVerified: true
  },
  {
    name: 'Car Polish & Wax',
    category: 'fluids',
    price: 1200,
    stock: 60,
    brand: 'Meguiars',
    description: 'Premium car polish and wax for shine and protection',
    images: ['https://images.unsplash.com/photo-1598711090019-7db2619c1b79?q=80&w=800&auto=format&fit=crop'],
    isVerified: true
  },
  {
    name: 'Car Battery 75AH',
    category: 'electronics',
    price: 8000,
    stock: 20,
    brand: 'Exide',
    description: '75AH Car battery with 3 years warranty',
    images: ['https://images.unsplash.com/photo-1610490008888-1dfdf0b36662?q=80&w=800&auto=format&fit=crop'],
    isVerified: true
  },
  {
    name: 'Floor Mats Rubber',
    category: 'accessories',
    price: 1500,
    stock: 40,
    brand: 'Weather Tech',
    description: 'Premium rubber floor mats with anti-slip backing',
    images: ['https://images.unsplash.com/photo-1525116647962-f9239742facb?q=80&w=800&auto=format&fit=crop'],
    isVerified: true
  },
  {
    name: 'Leather Seat Covers',
    category: 'accessories',
    price: 4000,
    stock: 25,
    brand: 'LuxLine',
    description: 'Premium leather seat covers set for all car models',
    images: ['https://images.unsplash.com/photo-1611608811528-3fe9ba9363dd?q=80&w=800&auto=format&fit=crop'],
    isVerified: true
  },
  {
    name: 'LED Headlight Upgrade',
    category: 'electronics',
    price: 2000,
    stock: 35,
    brand: 'Philips',
    description: 'LED headlight upgrade kit with 6000K color temperature',
    images: ['https://images.unsplash.com/photo-1565041524513-348817bed503?q=80&w=800&auto=format&fit=crop'],
    isVerified: true
  },
  {
    name: 'Jumper Cables Heavy Duty',
    category: 'tools',
    price: 800,
    stock: 50,
    brand: 'Stanley',
    description: 'Heavy duty jumper cables with alligator clamps',
    images: ['https://images.unsplash.com/photo-1581091121526-c6e87f7f5d0d?q=80&w=800&auto=format&fit=crop'],
    isVerified: true
  },
  {
    name: 'Hydraulic Car Jack',
    category: 'tools',
    price: 3000,
    stock: 15,
    brand: 'Craftsman',
    description: '3 ton hydraulic car jack with safety valve',
    images: ['https://images.unsplash.com/photo-1614644147720-a909bf6250cb?q=80&w=800&auto=format&fit=crop'],
    isVerified: true
  },
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert new products
    const inserted = await Product.insertMany(seedData);
    console.log(`Successfully seeded ${inserted.length} products`);

    // Display summary
    const products = await Product.find().select('name price stock category');
    console.log('\nSeeded Products:');
    products.forEach(p => {
      console.log(`- ${p.name} (${p.category}): ৳${p.price} | Stock: ${p.stock}`);
    });

    mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error seeding products:', error.message);
    process.exit(1);
  }
}

seedProducts();
