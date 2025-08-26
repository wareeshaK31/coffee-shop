import MenuItem from "../models/MenuItem.js";

// Public: GET /menu?category=Coffee
export const listMenu = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    const items = await MenuItem.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Public: GET /menu/:id
export const getMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Menu item not found" });
    res.json(item);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};


