const Item = require('../models/Item');

// GET /api/items
// supports pagination: ?page=1&limit=10 and optional search ?q=...
exports.getItems = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.max(1, parseInt(req.query.limit || '10', 10));
  const q = (req.query.q || '').trim();

  const filter = {};
  if (q) {
    // basic search in title or description
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Item.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Item.countDocuments(filter)
  ]);

  res.json({
    page, limit, totalPages: Math.ceil(total / limit), total, items
  });
};

// GET /api/items/:id
exports.getItemById = async (req, res) => {
  const item = await Item.findById(req.params.id).lean();
  if (!item) return res.status(404).json({ message: 'Item not found' });
  res.json(item);
};

// POST /api/items
// Protected route (requires token). Creates a new item.
exports.createItem = async (req, res) => {
  const { title, description, price, imageUrl, tags } = req.body;
  if (!title || price == null) return res.status(400).json({ message: 'title and price are required' });
  const item = new Item({
    title,
    description: description || '',
    price: Number(price),
    imageUrl: imageUrl || '',
    tags: Array.isArray(tags) ? tags : (typeof tags === 'string' && tags ? tags.split(',').map(t => t.trim()) : [])
  });
  await item.save();
  res.status(201).json(item);
};