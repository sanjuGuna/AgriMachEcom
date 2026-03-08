const Machine = require("../models/Machine");

/* CREATE MACHINE (ADMIN ONLY) POST /api/machines */
exports.createMachine = async (req, res) => {
  try {
    const { name, category, price, description, stock } = req.body;

    // Basic validation
    if (!name || !category || !price || !description || stock === undefined) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (!req.files || req.files.length < 3) {
      return res.status(400).json({
        message: "At least 3 machine images are required"
      });
    }

    const images = req.files.map(file => file.path)

    // Parse specifications if it's a string (from FormData)
    let parsedSpecifications = [];
    if (req.body.specifications) {
      try {
        parsedSpecifications = typeof req.body.specifications === 'string'
          ? JSON.parse(req.body.specifications)
          : req.body.specifications;
      } catch (err) {
        console.error("Error parsing specifications:", err);
      }
    }

    const machine = await Machine.create({
      name,
      category,
      price,
      description,
      images,//urls
      stock,
      specifications: parsedSpecifications,
      createdBy: req.user._id // admin id from JWT
    });

    res.status(201).json(machine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*  GET ALL MACHINES (PUBLIC) GET /api/machines */
exports.getMachines = async (req, res) => {
  try {
    const { keyword, category, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

    const query = {};

    // Search by name
    if (keyword) {
      query.name = { $regex: keyword, $options: "i" };
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const machines = await Machine.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Machine.countDocuments(query);

    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      machines
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* GET SINGLE MACHINE GET /api/machines/:id */
exports.getMachineById = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id)
      .populate("createdBy", "name email");

    if (!machine) {
      return res.status(404).json({ message: "Machine not found" });
    }

    res.json(machine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* UPDATE MACHINE (ADMIN ONLY) PUT /api/machines/:id */
exports.updateMachine = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);

    if (!machine) {
      return res.status(404).json({ message: "Machine not found" });
    }

    // Update allowed fields
    const fields = ["name", "category", "price", "description", "stock", "specifications"];
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'specifications' && typeof req.body[field] === 'string') {
          try {
            machine[field] = JSON.parse(req.body[field]);
          } catch (err) {
            console.error("Error parsing specifications in update:", err);
          }
        } else {
          machine[field] = req.body[field];
        }
      }
    });

    // Handle images
    let updatedImages = [];
    if (req.body.existingImages) {
      try {
        updatedImages = JSON.parse(req.body.existingImages);
      } catch (err) {
        console.error("Error parsing existingImages:", err);
        updatedImages = machine.images;
      }
    } else {
      updatedImages = machine.images;
    }

    // Add new images if uploaded
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.path);
      updatedImages = [...updatedImages, ...newImages];
    }

    machine.images = updatedImages;

    await machine.save();

    res.json(machine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* DELETE MACHINE (ADMIN ONLY) DELETE /api/machines/:id */
exports.deleteMachine = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);

    if (!machine) {
      return res.status(404).json({ message: "Machine not found" });
    }

    await machine.deleteOne();

    res.json({ message: "Machine deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};