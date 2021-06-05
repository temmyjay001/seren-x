const User = require("../../models/user");

module.exports = {
	find: async (req, res) => {
		const user = await User.find().populate("responses");
		if (user) return res.send(user);

		return res.status(404).json({ message: "User Not Found" });
	},

	responseByUser: async (req, res) => {
		const { user_id } = req.params;
		const user = await User.findOne({ user_id }).populate("responses");
		if (user) return res.send(user.responses);

		return res.status(404).json({ message: "User Not Found" });
	},
};
