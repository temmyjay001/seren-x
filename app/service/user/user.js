const User = require("../../models/user");

module.exports = {
	create: async ({ user_name, user_id }) => {
		if (!(await User.countDocuments({ user_id })))
			return (user = await User.create({
				user_name,
				user_id,
			}));

		return false;
	},
};
