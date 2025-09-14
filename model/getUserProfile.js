const supabase = require("../dbConnection.js");

async function getUserProfile(email) {
	try {
		let { data, error } = await supabase
			.from("users")
			.select(
				"user_id,name,first_name,last_name,email,contact_number,mfa_enabled,address,image_id"
			)
			.eq("email", email);

		if (data && data.length > 0) {
			if (!data[0].first_name && !data[0].last_name) {
				const fullName = data[0].name || "";
				const nameParts = fullName.trim().split(" ");
				data[0].first_name = nameParts[0] || "";
				data[0].last_name = nameParts.slice(1).join(" ") || "";
			}
			
			if (data[0].first_name) {
				data[0].username = data[0].first_name.toLowerCase().replace(/\s+/g, ".");
			}
			
			if (data[0].image_id != null) {
				data[0].image_url = await getImageUrl(data[0].image_id);
			}
		}

		return data;
	} catch (error) {
		console.error("getUserProfile error:", error);
		throw error;
	}
}

async function getImageUrl(image_id) {
	try {
		if (image_id == null) return "";
		let { data, error } = await supabase
			.from("images")
			.select("*")
			.eq("id", image_id);
		if (data && data[0] != null) {
			let x = `https://mdauzoueyzgtqsojttkp.supabase.co/storage/v1/object/public/images/${data[0].file_name}`;
			return x;
		}
		return "";
	} catch (error) {
		console.log(error);
		throw error;
	}
}

module.exports = getUserProfile;
