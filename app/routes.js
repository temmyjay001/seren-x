const express = require("express");
const router = new express.Router();
const User = require("./controllers/user/user");

router.get("/", (req, res) => res.json({}));
// user routes
// router.post('/user',User.create);
router.get("/users", User.find);
router.get("/users/:user_id/responses", User.responseByUser);

module.exports = router;
