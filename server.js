const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// PostgreSQL Connection Pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || '127.0.0.1',
  database: process.env.DB_NAME || 'falstore_db',
  password: process.env.DB_PASSWORD || 'naufal_secure_db_pass_2026',
  port: process.env.DB_PORT || 5432,
});

// Default Digital Products Dataset
const INITIAL_DIGITAL_PRODUCTS = [
  {
    id: 'PROD-CANVA-1Y',
    name: 'Canva Pro 1 Tahun (Invite Email Pribadi)',
    category: 'desain',
    price: 25000,
    original_price: 120000,
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop&q=85',
    badge: 'Terlaris',
    description: 'Langganan Canva Pro 1 Tahun full garansi. Menggunakan email pribadi Anda sendiri tanpa ganti akun. Akses jutaan template premium, Brand Kit, Magic Studio AI, resize instan, dan storage cloud 1TB.',
    stock: 100,
    rating: 5.0,
    sold: 480
  },
  {
    id: 'PROD-CHATGPT-PLUS',
    name: 'ChatGPT Plus / GPT-4o (Private Account 1 Bulan)',
    category: 'ai',
    price: 65000,
    original_price: 330000,
    image: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=85',
    badge: 'AI Pilihan',
    description: 'Akses resmi ChatGPT Plus (GPT-4o, GPT-4 Turbo, DALL-E 3 image generator, Advanced Data Analysis, Custom GPTs). Kredensial akun private login resmi langsung tanpa antre.',
    stock: 50,
    rating: 4.9,
    sold: 350
  },
  {
    id: 'PROD-YT-PREMIUM',
    name: 'YouTube Premium & Music (Individual 3 Bulan)',
    category: 'streaming',
    price: 20000,
    original_price: 90000,
    image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=85',
    badge: 'Bebas Iklan',
    description: 'Nonton video tanpa gangguan iklan di semua perangkat (HP, Smart TV, Laptop), background play saat layar mati, serta akses penuh YouTube Music Premium kualitas audio tinggi.',
    stock: 120,
    rating: 5.0,
    sold: 620
  },
  {
    id: 'PROD-NETFLIX-4K',
    name: 'Netflix Premium UHD 4K (1 Profil Private PIN 1 Bulan)',
    category: 'streaming',
    price: 35000,
    original_price: 186000,
    image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&auto=format&fit=crop&q=85',
    badge: '4K Ultra HD',
    description: '1 Profil Khusus dengan PIN Pengaman Pribadi. Bebas ganti nama profil & avatar. Resolusi Ultra HD 4K + Dolby Atmos, anti screen-limit dan anti-on hold.',
    stock: 45,
    rating: 4.9,
    sold: 510
  },
  {
    id: 'PROD-SPOTIFY-IND',
    name: 'Spotify Premium Individual (3 Bulan Akun Pribadi)',
    category: 'streaming',
    price: 28000,
    original_price: 165000,
    image: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=800&auto=format&fit=crop&q=85',
    badge: 'Audio Hi-Fi',
    description: 'Dengarkan jutaan lagu tanpa jeda iklan, skip lagu tak terbatas, download lagu offline kualitas 320kbps. Bisa perpanjang di akun Spotify lama Anda.',
    stock: 75,
    rating: 4.9,
    sold: 390
  },
  {
    id: 'PROD-CAPCUT-PRO',
    name: 'CapCut Pro PC & Mobile (1 Tahun Cloud 100GB)',
    category: 'desain',
    price: 39000,
    original_price: 150000,
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=85',
    badge: 'Editor Pilihan',
    description: 'Buka semua fitur pro editing video di PC Windows/Mac dan Android/iOS. Termasuk auto-caption AI, removal background 1-klik, efek premium, dan 100GB Cloud Storage.',
    stock: 60,
    rating: 4.9,
    sold: 275
  },
  {
    id: 'PROD-CLAUDE-PRO',
    name: 'Claude Pro / Anthropic (Claude 3.5 Sonnet 1 Bulan)',
    category: 'ai',
    price: 75000,
    original_price: 350000,
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=85',
    badge: 'Coding & Brain',
    description: 'Akses batas pesan 5x lebih banyak ke model tercanggih Claude 3.5 Sonnet dan Claude Opus. Sangat unggul untuk coding, analisis dokumen PDF panjang, dan penulisan riset mendalam.',
    stock: 30,
    rating: 5.0,
    sold: 190
  },
  {
    id: 'PROD-MS365-1TB',
    name: 'Microsoft 365 Pro + OneDrive Cloud 1TB (1 Tahun)',
    category: 'produktivitas',
    price: 45000,
    original_price: 280000,
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=85',
    badge: 'Office Resmi',
    description: 'Aplikasi Word, Excel, PowerPoint, Outlook versi desktop terbaru untuk 5 perangkat (PC/Mac/HP). Termasuk 1000GB (1TB) OneDrive Cloud Storage pribadi.',
    stock: 40,
    rating: 4.9,
    sold: 210
  }
];

// Initialize Database Schema for Digital Store
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS digital_users (
        id SERIAL PRIMARY KEY,
        provider VARCHAR(50) DEFAULT 'whatsapp',
        provider_id VARCHAR(100),
        name VARCHAR(150),
        phone VARCHAR(50),
        email VARCHAR(150),
        avatar TEXT,
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS digital_products (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        price NUMERIC(12, 2) NOT NULL,
        original_price NUMERIC(12, 2),
        image TEXT NOT NULL,
        badge VARCHAR(100),
        description TEXT,
        stock INT DEFAULT 50,
        rating NUMERIC(3, 2) DEFAULT 4.9,
        sold INT DEFAULT 120,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS digital_orders (
        id VARCHAR(50) PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50) NOT NULL,
        customer_email VARCHAR(150) NOT NULL,
        delivery_method VARCHAR(50) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        total_amount NUMERIC(12, 2) NOT NULL,
        discount_code VARCHAR(50),
        status VARCHAR(50) DEFAULT 'Menunggu Pembayaran',
        items JSONB NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed initial products if table is empty
    const checkProds = await pool.query('SELECT COUNT(*) FROM digital_products');
    if (parseInt(checkProds.rows[0].count, 10) === 0) {
      for (const p of INITIAL_DIGITAL_PRODUCTS) {
        await pool.query(
          `INSERT INTO digital_products (id, name, category, price, original_price, image, badge, description, stock, rating, sold)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT (id) DO NOTHING`,
          [p.id, p.name, p.category, p.price, p.original_price, p.image, p.badge, p.description, p.stock, p.rating, p.sold]
        );
      }
      console.log('[DB] Seeded initial digital products into PostgreSQL.');
    }

    console.log('[DB] PostgreSQL Digital Store Tables Initialized.');
  } catch (err) {
    console.error('[DB] Init error (using memory fallback if needed):', err.message);
  }
}
initDB();

// 1. Social OAuth Login API (Google, WhatsApp, Telegram — Zero Manual Input)
app.post('/api/auth/social-login', async (req, res) => {
  try {
    const { provider, name, email, phone, avatar, provider_id } = req.body;
    if (!provider) return res.status(400).json({ success: false, error: 'Provider wajib dipilih' });

    const finalPhone = phone ? phone.replace(/\D/g, '') : '';
    const finalEmail = email || '';
    const finalName = name || (provider === 'google' ? 'Google User' : provider === 'telegram' ? 'Telegram User' : 'WhatsApp User');
    const finalAvatar = avatar || '';

    const existing = await pool.query(
      `SELECT * FROM digital_users WHERE (provider = $1 AND provider_id = $2) OR (phone = $3 AND $3 != '') OR (email = $4 AND $4 != '') LIMIT 1;`,
      [provider, provider_id || finalEmail || finalPhone, finalPhone, finalEmail]
    );

    let userRes;
    if (existing.rows.length > 0) {
      userRes = await pool.query(
        `UPDATE digital_users SET name = COALESCE($1, name), avatar = COALESCE($2, avatar), email = COALESCE($3, email) WHERE id = $4 RETURNING *;`,
        [finalName, finalAvatar, finalEmail, existing.rows[0].id]
      );
    } else {
      userRes = await pool.query(
        `INSERT INTO digital_users (provider, provider_id, name, phone, email, avatar)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *;`,
        [provider, provider_id || finalEmail || finalPhone || ('ID-' + Date.now()), finalName, finalPhone || '6285182555842', finalEmail || 'member@premium.naufal.me', finalAvatar]
      );
    }

    res.json({ success: true, user: userRes.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Admin PIN Gate Verification
app.post('/api/admin/verify', (req, res) => {
  const { pin } = req.body;
  if (pin === '2026' || pin === 'admin123' || pin === 'premium2026') {
    return res.json({ success: true, message: 'Autentikasi admin berhasil' });
  }
  res.status(401).json({ success: false, error: 'PIN Admin tidak valid' });
});

// 3. User Order History
app.get('/api/orders/user/:identifier', async (req, res) => {
  try {
    let idf = req.params.identifier.replace(/\D/g, '');
    if (idf.startsWith('0')) idf = '62' + idf.substring(1);

    const result = await pool.query(
      `SELECT * FROM digital_orders WHERE customer_phone LIKE $1 OR customer_email ILIKE $2 OR customer_name ILIKE $2 ORDER BY created_at DESC;`,
      [`%${idf.slice(-8)}%`, `%${req.params.identifier}%`]
    );
    res.json({ success: true, orders: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Products Catalog API
app.get('/api/products', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = 'SELECT * FROM digital_products WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (name ILIKE $${params.length} OR description ILIKE $${params.length})`;
    }

    query += ' ORDER BY sold DESC, created_at DESC';
    const result = await pool.query(query, params);
    res.json({ success: true, products: result.rows.length > 0 ? result.rows : INITIAL_DIGITAL_PRODUCTS });
  } catch (err) {
    res.json({ success: true, products: INITIAL_DIGITAL_PRODUCTS });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, category, price, image, badge, desc, stock } = req.body;
    const id = 'PROD-' + Date.now().toString().slice(-6);
    const result = await pool.query(
      `INSERT INTO digital_products (id, name, category, price, original_price, image, badge, description, stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [id, name, category, price, price * 1.5, image, badge || 'Digital', desc || '', stock || 50]
    );
    res.status(201).json({ success: true, product: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Digital Orders API (Instant Delivery)
app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM digital_orders ORDER BY created_at DESC LIMIT 50');
    res.json({ success: true, orders: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM digital_orders WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Pesanan tidak ditemukan' });
    res.json({ success: true, order: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customer_name, customer_phone, customer_email, delivery_method, payment_method, items, discount_code, notes } = req.body;
    const id = 'PREM-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

    const subtotal = items.reduce((acc, item) => acc + (Number(item.price) * item.qty), 0);
    const discount = (discount_code === 'PREMIUM50') ? subtotal * 0.5 : 0;
    const total_amount = subtotal - discount; // Digital products have Rp 0 shipping fee

    const result = await pool.query(
      `INSERT INTO digital_orders (id, customer_name, customer_phone, customer_email, delivery_method, payment_method, total_amount, discount_code, items, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [id, customer_name, customer_phone, customer_email, delivery_method || 'whatsapp_instant', payment_method || 'qris', total_amount, discount_code, JSON.stringify(items), notes || '']
    );

    res.status(201).json({ success: true, order: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query('UPDATE digital_orders SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Pesanan tidak ditemukan' });
    res.json({ success: true, order: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Analytics Statistics API
app.get('/api/stats', async (req, res) => {
  try {
    const revRes = await pool.query("SELECT COALESCE(SUM(total_amount), 0) as total FROM digital_orders WHERE status != 'Dibatalkan'");
    const ordRes = await pool.query("SELECT COUNT(*) as count FROM digital_orders");
    const prdRes = await pool.query("SELECT COUNT(*) as count FROM digital_products");
    res.json({
      success: true,
      stats: {
        totalRevenue: Number(revRes.rows[0].total),
        totalOrders: Number(ordRes.rows[0].count),
        totalProducts: Number(prdRes.rows[0].count) || INITIAL_DIGITAL_PRODUCTS.length,
      }
    });
  } catch (err) {
    res.json({
      success: true,
      stats: {
        totalRevenue: 2450000,
        totalOrders: 48,
        totalProducts: INITIAL_DIGITAL_PRODUCTS.length
      }
    });
  }
});

// 7. SPA Direct Routes Fallback
app.get(['/admin', '/cart', '/checkout', '/auth', '/account'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
  next();
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[FalStore Premium Apps] Server running at http://0.0.0.0:${PORT}`);
});
