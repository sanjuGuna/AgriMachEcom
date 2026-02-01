const express = require("express");
const router = express.Router();
const upload=require("../middleware/uploadMiddleware")
const {
  createMachine,
  getMachines,
  getMachineById,
  updateMachine,
  deleteMachine
} = require("../controllers/machineController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", protect, adminOnly, upload.array("images",4),createMachine);
router.get("/", getMachines);
router.get("/:id", getMachineById);
router.put("/:id", protect, adminOnly, updateMachine);
router.delete("/:id", protect, adminOnly, deleteMachine);

module.exports = router;
