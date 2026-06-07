const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Product = require('../models/Product.model');
const Admin = require('../models/Admin.model');

const products = [
  {
    name: 'Lavender Soap Bar',
    subtitle: 'Handcrafted & Pure',
    category: 'soaps',
    sizes: [{ label: '100g', price: 3990 }],
    tags: ['Bestseller', 'Natural'],
    description: 'A gentle, handcrafted soap bar enriched with pure lavender and neem. Ideal for daily use, it cleanses without stripping your skin natural oils, leaving you fresh and soft.',
    ingredients: [
      { name: 'Lavender Oil', benefit: 'Soothes and calms the skin naturally.' },
      { name: 'Neem Extract', benefit: 'Known for its antibacterial properties.' },
      { name: 'Coconut Oil Base', benefit: 'Creates a rich, nourishing lather.' }
    ],
    howToUse: [
      { step: '01 Wet', detail: 'Wet your skin thoroughly with water.' },
      { step: '02 Lather', detail: 'Work the soap into a rich lather using your hands.' },
      { step: '03 Rinse', detail: 'Rinse off and pat dry with a soft towel.' }
    ],
    image: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600&q=80',
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80',
      'https://images.unsplash.com/photo-1611080541599-8c6dbde6ed28?w=600&q=80',
      'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=600&q=80'
    ],
    badges: ['100% Natural', '60-Day Guarantee', 'Handcrafted'],
    reviews: 142,
    rating: 4.8,
    sold: '300+ sold this week',
    isActive: true,
    isFeatured: true
  },
  {
    name: 'Rose Clay Face Wash',
    subtitle: 'Deep Cleanse & Glow',
    category: 'face-wash',
    sizes: [{ label: '150mL', price: 2650 }],
    tags: ['Clarifying'],
    description: 'A mild herbal face wash with rose water and kaolin clay that gently removes impurities, controls oil, and leaves your face feeling clean and refreshed.',
    ingredients: [
      { name: 'Rose Water', benefit: 'Tones and refreshes the skin.' },
      { name: 'Kaolin Clay', benefit: 'Draws out impurities gently.' },
      { name: 'Aloe Vera', benefit: 'Soothes and hydrates after cleansing.' }
    ],
    howToUse: [
      { step: '01 Wet', detail: 'Splash your face with lukewarm water.' },
      { step: '02 Apply', detail: 'Apply a small amount and work into a gentle foam.' },
      { step: '03 Rinse', detail: 'Rinse completely and pat dry.' }
    ],
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80',
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&q=80',
      'https://images.unsplash.com/photo-1570194065650-d99fb4b38f14?w=600&q=80',
      'https://images.unsplash.com/photo-1628438523059-39aed7b7efd3?w=600&q=80'
    ],
    badges: ['Gentle Formula', '60-Day Guarantee', 'Vegan'],
    reviews: 98,
    rating: 4.7,
    sold: '200+ sold this week',
    isActive: true,
    isFeatured: false
  },
  {
    name: 'Rosehip Hair Oil',
    subtitle: 'Nourish & Strengthen',
    category: 'oils',
    sizes: [{ label: '100mL', price: 5650 }],
    tags: ['Restoring'],
    description: 'A rich blend of rosehip, amla, and coconut oils designed to strengthen hair roots, reduce hair fall, and add a natural shine. Perfect for weekly deep conditioning.',
    ingredients: [
      { name: 'Rosehip Oil', benefit: 'Rich in vitamins, promotes hair health.' },
      { name: 'Amla Extract', benefit: 'Strengthens roots and prevents breakage.' },
      { name: 'Cold-Pressed Coconut Oil', benefit: 'Deeply conditions and adds lustre.' }
    ],
    howToUse: [
      { step: '01 Warm', detail: 'Gently warm a small amount between your palms.' },
      { step: '02 Apply', detail: 'Massage into scalp and work through hair lengths.' },
      { step: '03 Leave', detail: 'Leave on for at least 30 minutes before washing.' }
    ],
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&q=80',
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80',
      'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600&q=80',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80'
    ],
    badges: ['100% Natural', '60-Day Guarantee', 'Cold-Pressed'],
    reviews: 221,
    rating: 4.9,
    sold: '500+ sold this week',
    isActive: true,
    isFeatured: true
  },
  {
    name: 'Herbal Balm',
    subtitle: 'Intense Nourishment',
    category: 'balms',
    sizes: [{ label: '30g', price: 4480 }],
    tags: ['Hydrating'],
    description: 'A thick, comforting herbal balm with beeswax, calendula, and shea butter. Perfect for chapped lips, dry elbows, and rough skin patches.',
    ingredients: [
      { name: 'Calendula Extract', benefit: 'Heals and soothes irritated skin.' },
      { name: 'Shea Butter', benefit: 'Provides intense moisture and softness.' },
      { name: 'Beeswax', benefit: 'Creates a protective barrier on skin.' }
    ],
    howToUse: [
      { step: '01 Take', detail: 'Take a small amount on your fingertip.' },
      { step: '02 Warm', detail: 'Rub gently to warm the balm.' },
      { step: '03 Apply', detail: 'Apply to dry areas and massage in.' }
    ],
    image: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38f14?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1570194065650-d99fb4b38f14?w=600&q=80',
      'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=600&q=80',
      'https://images.unsplash.com/photo-1628438523059-39aed7b7efd3?w=600&q=80',
      'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600&q=80'
    ],
    badges: ['100% Natural', '60-Day Guarantee', 'Handcrafted'],
    reviews: 87,
    rating: 4.6,
    sold: '150+ sold this week',
    isActive: true,
    isFeatured: false
  },
  {
    name: 'Turmeric Face Pack',
    subtitle: 'Brightening & Glow',
    category: 'face-packs',
    sizes: [{ label: '50g', price: 1990 }],
    tags: ['Brightening'],
    description: 'A traditional turmeric and sandalwood face pack that brightens complexion, reduces blemishes, and gives your skin a natural healthy glow in just 20 minutes.',
    ingredients: [
      { name: 'Turmeric Powder', benefit: 'Brightens and evens skin tone.' },
      { name: 'Sandalwood Powder', benefit: 'Cools and smoothens the skin.' },
      { name: 'Rose Powder', benefit: 'Tones skin and adds a subtle fragrance.' }
    ],
    howToUse: [
      { step: '01 Mix', detail: 'Mix with rose water to form a smooth paste.' },
      { step: '02 Apply', detail: 'Apply evenly to face and neck.' },
      { step: '03 Rinse', detail: 'Leave for 15-20 mins, then rinse with cool water.' }
    ],
    image: 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=600&q=80',
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80',
      'https://images.unsplash.com/photo-1570194065650-d99fb4b38f14?w=600&q=80',
      'https://images.unsplash.com/photo-1628438523059-39aed7b7efd3?w=600&q=80'
    ],
    badges: ['100% Natural', '60-Day Guarantee', 'Vegan'],
    reviews: 64,
    rating: 4.7,
    sold: '120+ sold this week',
    isActive: true,
    isFeatured: false
  },
  {
    name: 'Hibiscus Shampoo Bar',
    subtitle: 'Refresh & Shine',
    category: 'shampoos',
    sizes: [{ label: '80g', price: 3490 }],
    tags: ['Refreshing'],
    description: 'A zero-waste, solid shampoo bar made with hibiscus and shikakai. Gently cleanses your scalp, adds volume, and leaves hair soft, shiny, and tangle-free.',
    ingredients: [
      { name: 'Hibiscus Extract', benefit: 'Promotes hair growth and adds shine.' },
      { name: 'Shikakai Powder', benefit: 'Traditional cleanser that strengthens hair.' },
      { name: 'Argan Oil', benefit: 'Conditions and adds lustre.' }
    ],
    howToUse: [
      { step: '01 Wet', detail: 'Wet hair thoroughly.' },
      { step: '02 Lather', detail: 'Rub the bar between your palms or directly on scalp.' },
      { step: '03 Rinse', detail: 'Rinse well and follow with a conditioner if needed.' }
    ],
    image: 'https://images.unsplash.com/photo-1628438523059-39aed7b7efd3?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1628438523059-39aed7b7efd3?w=600&q=80',
      'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600&q=80',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80',
      'https://images.unsplash.com/photo-1570194065650-d99fb4b38f14?w=600&q=80'
    ],
    badges: ['Zero Waste', '60-Day Guarantee', 'Vegan'],
    reviews: 56,
    rating: 4.5,
    sold: '100+ sold this week',
    isActive: true,
    isFeatured: false
  }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    await Admin.deleteMany({});
    console.log('🗑️  Cleared existing admins');

    // Insert products
    const inserted = await Product.insertMany(products);
    console.log(`✅ Inserted ${inserted.length} products:`);
    inserted.forEach(p => console.log(`   - ${p.name} (${p.category}) — ₹${p.price}`));

    // Create default admin
    const admin = await Admin.create({
      name: 'Subhasree Giridhari',
      email: 'sgherbals@admin.com',
      password: 'sgherbals@2026',
      role: 'admin',
    });
    console.log(`\n✅ Created admin user:`);
    console.log(`   Email:    ${admin.email}`);
    console.log(`   Password: sgherbals@2026`);
    console.log(`   Role:     ${admin.role}`);

    console.log('\n🌱 Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
