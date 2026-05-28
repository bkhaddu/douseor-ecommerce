const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/douseor';
const JWT_SECRET = process.env.JWT_SECRET || 'douseor_editorial_jwt_secret_token_2026';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Support larger base64 file uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database Connection
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected to:', MONGODB_URI);
    seedDatabase();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// --- database schemas ---

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' }, // 'user' or 'admin'
  address: { type: String, default: '' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Product Schema
const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  cat: { type: String, required: true },
  img: { type: String, required: true }, // Base64 or Image URL
  desc: { type: String, default: '' },
  thumbs: [String],
  sizes: { type: [String], default: ['XS', 'S', 'M', 'L'] },
  unavailableSizes: { type: [String], default: ['L'] }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

// --- seed database ---
async function seedDatabase() {
  try {
    // 1. Seed Products if empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const seedProducts = [
        { id: 1, title: 'STRUCTURED BLAZER', price: 850, cat: 'OUTERWEAR', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnypeDgqgS63bGBweLV16iprewU2vxLzFIw1yZwpfs442JlY612_U77T_uYW81ZCGwlfDKbUg1Oi8vfm3m_mVWePX4Mzz1cA0Ez8h7Si0OvH0fCVeqTndktzcJ5VDhgV0Joz0wx3HD3OkTwVpY3vqi2uAZgZfi3VZun4d1xW1X1ARL4uKXeFh0vmdvSMvyWvwlgbWcXVhC6QSpOobL81UuBjaJ0mUCczaGz1rSIYHdkYiQ7l-SK8no1J-Nb1ZxzBUfwaJNWTDo5wQ', desc: 'CONSTRUCTED FROM BRUTALIST MINIMALIST SHAPES. EXTREME ATTENTION TO SILHOUETTE. DESIGNED TO STAND OUT IN MODERN GEOMETRIC PLAZAS.' },
        { id: 2, title: 'ASYMMETRIC SHIRT', price: 450, cat: 'SHIRTING', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxaC3TGYZHvSEBnNJwg1lS7CNson4j5O6N4-hvv39PCvcg51Qcb1V2UhfZxl0AXaGonQWfEHhewVnIEJwDANDNlZjp8Floyc0owSRiW5fG0IL9kvnGAS7O3B5XbvO28IDklf1Hsy4JauBHnBYweCTFcaNR8JQnkVfqW0H2UmZkqNopHYfG3szn1O77ZvfgruQE66SPddhadP3rlNUZdW9mPGFOoxqyNPRlJQdPshaJdKqe82bW7eQovgFqlF7in8HveV9IlB5zV3M', desc: 'CONSTRUCTED FROM BRUTALIST MINIMALIST SHAPES. EXTREME ATTENTION TO SILHOUETTE. DESIGNED TO STAND OUT IN MODERN GEOMETRIC PLAZAS.' },
        { id: 3, title: 'WIDE LEG TROUSER', price: 480, cat: 'BOTTOMS', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxJGwo4tQyNSf5-3jORESnseHpA1Xirs9bpyl6bmg0Bbt3Wk5hSxlrbTOoOfeNdGswmKPAnWKodyvSUgdItAPVQsoWVEAo0PJm2GG7VgS3gpbkWGYm0qKXaDwGD46yRzTfL-bckInPy7-VJei-m6jdQ19Hk8FgkQvlYOdkuAa_cOKeTBLC2vviEOmZXdsmmWC3CTTh2EGxas9oxBtSpYupJJDcIOik_50T73sp5HBpEcZls9Ljl4ayswhV6lzROn3Nf5jjXlI_hpw', desc: 'CONSTRUCTED FROM BRUTALIST MINIMALIST SHAPES. EXTREME ATTENTION TO SILHOUETTE. DESIGNED TO STAND OUT IN MODERN GEOMETRIC PLAZAS.' },
        { id: 4, title: 'SQUARE BOOT', price: 1100, cat: 'FOOTWEAR', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDH3AXFTmx6hZguqW-Pp4b6uWSsw5KTm_c9T1MGLo19tpx2gURumWcfs1s5UWmB1tXl-0P6H08ciN6E7qDDkrMOGBBqIxfurFTzkTsiYwgsGkR77c88V4VoJRmwdJXgnLnZA-Czj2WNAgjDn0FPzlaoLS6qBsbVqcQmZokVMi_cDT6SFY95aztltXN3D962E_y2o-_nqtvxtBJnhPbCy1NsoHZWaWK4TvzU_20PBqc8RoSw5p62ZNFrxRZCDNincYZPPEYWoMAgQOw', desc: 'CONSTRUCTED FROM BRUTALIST MINIMALIST SHAPES. EXTREME ATTENTION TO SILHOUETTE. DESIGNED TO STAND OUT IN MODERN GEOMETRIC PLAZAS.' },
        { id: 5, title: 'HEAVY KNIT', price: 680, cat: 'KNITWEAR', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0_6j8AOqutq5g8YRZLzttxcntkkaGk19y6l_OVbtBsUMJEn397lNs9PU-hzLmPDXUtKmeWJZ7PV0DbSwpHMNcQ2rCRox4Rca55ufhIuM302xaYUpg6o1g9g7zxylmUdXSb2XAd5_V9gUG-CV5xQ5ARRJJyFlrkAPXZbnasAAwIB5mrM2wmigOVOAVYcYmH6zfswDw_AxL9L8Iba_qWlnEfFquIShsLfBGjYE3ShLPETUaZILdDzi7Uh0z0Ewvrrh_LoeKia3ahEQ', desc: 'CONSTRUCTED FROM BRUTALIST MINIMALIST SHAPES. EXTREME ATTENTION TO SILHOUETTE. DESIGNED TO STAND OUT IN MODERN GEOMETRIC PLAZAS.' },
        { id: 6, title: 'COLUMN DRESS', price: 950, cat: 'DRESSES', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAu_VxljTM_74Dsr6WHDBaMrtickc-L9NctaGOujBXr2q9-hP_va7uwXwiAT1VahEgvskLWymy2Zj0Q1meUEQD5FSEunf2Itm4wJJzBCsHU303E1pt0rZRQkHJIHPfphTyESPjxh8nUu61n_m7yXujxUH6h6zZwN8Aii6hUy1JZ4Ndmos1-R3KTu3U7vCM2A18KVF85Qj_crOAqiP_Tg0EnSQPf2TapI33tejsc3tBVPK11kS71WU1H1ZhTwhXaTF_kaEYyE2CaPLw', desc: 'CONSTRUCTED FROM BRUTALIST MINIMALIST SHAPES. EXTREME ATTENTION TO SILHOUETTE. DESIGNED TO STAND OUT IN MODERN GEOMETRIC PLAZAS.' },
        { id: 7, title: 'BOX BAG', price: 1200, cat: 'ACCESSORIES', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDUCKBE3CvlK_TpfGW8AS9DlN2xcCpXIOpHU2SJ-yZLjAJBqtLizGrb6ipcmnT19ih6EB8sCoPk_ghU3VViz311ovKI2Q85qfRR1EBBdXIOpQWI6UaZqeQFbD2f0GQhS4tSkKUpA4DXxiBcXSmwPWbEKTm9IhI-EMkoxNPUR2ZC231QSUKZ29g5DySuSPJt_0T27tIidyQAlx3zfnVgD-b22Z6EHO2ZWIjvorhoWNtWnAap5F5CdIcNMK4dXQ15z07iCDm7dfV6Ko', desc: 'CONSTRUCTED FROM BRUTALIST MINIMALIST SHAPES. EXTREME ATTENTION TO SILHOUETTE. DESIGNED TO STAND OUT IN MODERN GEOMETRIC PLAZAS.' },
        { id: 8, title: 'OVERSIZED BLAZER', price: 1050, cat: 'TAILORING', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyEvpJaKB5Tpx3Wr4-oQeOhu60Ck-j_rqBwm4wCj9Z_TnNzpog2IloJWkLvlR7z9koIJNJIa2ehOpzc7AMieoFLr802QGjIU3BKGkFCNPdyivr_F1J3HFxNWTuuhyuF2G-mnGG2-ZcN8uW3nLUT6ZyMoDuXYXIetPS3F5qz1HkXR9RpmiW-hXs6LCvv1bg2ZXo9X4eUVNrucjca1H0ixW7p0vWg3EnIEzKxkXyN3sHBjPoS8pBpJxoUozxCx8BoMjygML5YqqRyIc', desc: 'CONSTRUCTED FROM BRUTALIST MINIMALIST SHAPES. EXTREME ATTENTION TO SILHOUETTE. DESIGNED TO STAND OUT IN MODERN GEOMETRIC PLAZAS.' },
        {
          id: 101,
          title: 'OBSIDIAN WOOL TRENCH',
          price: 1250,
          cat: 'OUTERWEAR / STRUCTURAL',
          img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5pb_qupVAv6BIrc-162PloKENHcUGvDz2i-A-foC3Sa-8Hj_Sbr9_ZS81wX6V2SfZXwUXgHpzzhk4qnNBRNDswy1n7dMu9h2NE1UtewKKwNaCaeP_dmo8pp8qgfmiAm_QIjcGjzHyjLc6t9ACzK9FGh9d-apeiA37iAqwNXVy-v81aiq7adk94k7-NgpulGpjKaeju2fAy2fYnGrHR1sVgCXWTiZ-PchFCoQ0zb_cTpB-BoIStMSCCsw8CzEYI6kIDGUdIB-2H6k',
          desc: 'A severely structural take on the classic trench. Constructed from heavyweight obsidian wool, this garment forces a rigid silhouette. Features include concealed brutalist snap closures, zero-allowance shoulder padding, and a raw hem. Designed to impose authority over the surrounding environment.',
          thumbs: [
            'https://lh3.googleusercontent.com/aida-public/AB6AXuD6Lyy2mVR1UyX7JH0b8F6JzFJhv0ANM_MkxDQZ_rQCpFJoNr2XBZjq2qcU2YYuqZPegP3opDhoun2wckJJO-0Lx-a_Suxvs6rPWCn-iRYafPjLjm_ajDDQemSBk5BiUn6A_xG7PaDLQKEfQ5uSs7M4SFx7CC2liLPyycHV8YLg8CunrC-iiVrdkldcVGsjB8U40G3Db5DjZMAW3w3cSYHQDlwBryM5CNFlx5NyiA1C_0j98-pbWO7pTYSDtYgdwGsxZtznbuKJVB0',
            'https://lh3.googleusercontent.com/aida-public/AB6AXuDF4Lh-gbs7-RuHTs8-SrfAoQKQd3YZmY9yy02ySR9ipvUHJpgiQJUcxuEv0xfddmMduaKZOTRlFijt8ricN-5nx8-mTgePIDDREZEAisb304il3y-qoJsj8ZgOawxgBsmlqjj2YukPBvmR9l08fO7luz-c-xOH17P7N84xPNUAW4DQe3urR1H--7Z490QiIDQWUFWLg-DKQanBqU0yqj3uRWcSQtNmXvF3BPkYB94WWdj5UrSNqt3BAAkmk3Zluv1fNhBxy0lWDn0',
            'https://lh3.googleusercontent.com/aida-public/AB6AXuC3LdH8M2ZSjAGC5aEet8SDgoLXvw8BMlPeP9l77BquE0G1ZTr891r2UXiDeUuBB0L0dSacxRPJySeIuy9jjI7MJ0yNZeYElvHhcBc_UYgxo8Nk6tORdcsfDTiQLXzPyFzgnHXUlf1g35P_r5TkBcNy1yH6r4ob1yHPq8q0vKraIFSQ5npDNxxdAeA2ZB-2thgCa7zs-dftcSzlxJd9nqKuLbjwpAO3P3bYxHDH-VUDrkzTuJRM3o-jiQxWxCwGlptIAC4hAIefkt8'
          ],
          sizes: ['XS', 'S', 'M', 'L'],
          unavailableSizes: ['L']
        }
      ];
      await Product.insertMany(seedProducts);
      console.log('Seeded database with default product catalog.');
    }

    // 2. Seed Admin User if empty
    const adminEmail = 'admin@douseor.com';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('douseor123', 10);
      const adminUser = new User({
        name: 'SYSTEM ADMIN',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        address: 'DOUSEOR HEADQUARTERS, BRUTALIST ARCH 12, METROPOLIS'
      });
      await adminUser.save();
      console.log('Seeded database with default Admin credentials.');
    }
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}

// --- middlewares ---

// Authentication Guard Middleware
const auth = async (req, res, next) => {
  try {
    const header = req.header('Authorization');
    if (!header) return res.status(401).json({ error: 'No token, authorization denied.' });
    
    const token = header.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ error: 'User does not exist.' });
    
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is invalid or expired.' });
  }
};

// Admin Role Guard Middleware
const adminAuth = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
};

// --- api routes ---

// Auth Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, address } = req.body;
    
    // Check if user exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ error: 'Email address is already registered.' });
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'user',
      address: address || ''
    });
    
    await user.save();
    
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auth Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ error: 'Invalid credentials.' });
    
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials.' });
    
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auth Get Me (Session Verification)
app.get('/api/auth/me', auth, async (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    address: req.user.address
  });
});

// Auth Update Profile (e.g. shipping address)
app.put('/api/auth/profile', auth, async (req, res) => {
  try {
    const { address, name } = req.body;
    
    if (address !== undefined) req.user.address = address;
    if (name !== undefined) req.user.name = name;
    
    await req.user.save();
    
    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      address: req.user.address
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ id: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Specific Product
app.get('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const product = await Product.findOne({ id });
    if (!product) return res.status(404).json({ error: 'Product not found.' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Product (Admin Only)
app.post('/api/products', auth, adminAuth, async (req, res) => {
  try {
    const { title, price, cat, img, desc, thumbs, sizes, unavailableSizes } = req.body;
    
    // Automatically generate unique numeric product ID
    const maxProd = await Product.findOne().sort({ id: -1 });
    const newId = maxProd && maxProd.id ? maxProd.id + 1 : 1;
    
    const product = new Product({
      id: newId,
      title,
      price,
      cat,
      img,
      desc: desc || '',
      thumbs: thumbs || [],
      sizes: sizes || ['XS', 'S', 'M', 'L'],
      unavailableSizes: unavailableSizes || []
    });
    
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit Product (Admin Only)
app.put('/api/products/:id', auth, adminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, price, cat, img, desc, thumbs, sizes, unavailableSizes } = req.body;
    
    const product = await Product.findOne({ id });
    if (!product) return res.status(404).json({ error: 'Product not found.' });
    
    if (title !== undefined) product.title = title;
    if (price !== undefined) product.price = price;
    if (cat !== undefined) product.cat = cat;
    if (img !== undefined && img !== null) product.img = img;
    if (desc !== undefined) product.desc = desc;
    if (thumbs !== undefined) product.thumbs = thumbs;
    if (sizes !== undefined) product.sizes = sizes;
    if (unavailableSizes !== undefined) product.unavailableSizes = unavailableSizes;
    
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Product (Admin Only)
app.delete('/api/products/:id', auth, adminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const product = await Product.findOneAndDelete({ id });
    if (!product) return res.status(404).json({ error: 'Product not found.' });
    
    res.json({ message: 'Product successfully deleted.', product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- serve static frontend assets ---
app.use(express.static(__dirname));

// Send main index.html for all other non-api calls
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server executing successfully on port http://localhost:${PORT}`);
});
