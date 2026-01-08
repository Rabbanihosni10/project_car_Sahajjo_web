const mongoose = require('mongoose');

// @desc    List MongoDB collections with document counts
// @route   GET /api/admin/collections
// @access  Private (Admin only)
exports.getCollections = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      return res.status(500).json({ message: 'Database connection not available' });
    }

    const collInfos = await db.listCollections().toArray();
    const collections = await Promise.all(
      collInfos.map(async (info) => {
        const count = await db.collection(info.name).estimatedDocumentCount();
        return { name: info.name, count };
      })
    );

    res.json({
      success: true,
      database: mongoose.connection.name,
      collections,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
