const express = require("express");

const homeRoutes = require("./story.controller.js");
const apiRoutes = require("./api");
const userRoutes = require("../user-routes");

const router = express.Router();

router.use("/", homeRoutes);
router.use("/api", apiRoutes);
router.use("/users", userRoutes);


module.exports = router;

