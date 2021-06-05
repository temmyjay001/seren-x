const Response = require("../../models/response");
const User = require("../../models/user");

module.exports = {
	create: async ({ question, answer, user_id }) => {
		const user = await User.findOne({ user_id });
		if (!(await Response.countDocuments({ user: user.id, question }))) {
			const response = await Response.create({
				question,
				answer,
				user: user.id,
			});
			await response.save();

			const userById = await User.findById(user.id);

			userById.responses.push(response);
			await userById.save();
		}

		return false;
	},
};
