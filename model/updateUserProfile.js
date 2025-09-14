const supabase = require("../dbConnection.js");
const { decode } = require("base64-arraybuffer");

async function updateUser(
	name,
	first_name,
	last_name,
	email,
	contact_number,
	address,
	username
) {
	let attributes = {};
	
	if (name) {
		attributes["name"] = name;
	} else if (first_name || last_name) {
		attributes["name"] = [first_name, last_name].filter(Boolean).join(" ").trim();
	}
	
	if (first_name !== undefined) {
		attributes["first_name"] = first_name;
	}
	if (last_name !== undefined) {
		attributes["last_name"] = last_name;
	}
	
	attributes["email"] = email || undefined;
	attributes["contact_number"] = contact_number || undefined;
	attributes["address"] = address || undefined;

	try {
		let { data, error } = await supabase
			.from("users")
			.update(attributes)
			.eq("email", email)
			.select(
				"user_id,name,first_name,last_name,email,contact_number,mfa_enabled,address"
			);
		
		if (error) {
			console.error("Database update error:", error);
			throw error;
		}
		
		if (data && data.length > 0) {
			if (!data[0].first_name && !data[0].last_name) {
				const fullName = data[0].name || "";
				const nameParts = fullName.trim().split(" ");
				data[0].first_name = nameParts[0] || "";
				data[0].last_name = nameParts.slice(1).join(" ") || "";
			}
			data[0].username = username || data[0].first_name?.toLowerCase().replace(/\s+/g, ".") || "";
		}
		
		return data;
	} catch (error) {
		console.error("updateUser error:", error);
		throw error;
	}
}
async function saveImage(image, user_id) {
	if (!image || !user_id) return null;
	let file_name = `users/${user_id}.png`;

	try {
		await supabase.storage.from("images").upload(file_name, decode(image), {
			cacheControl: "3600",
			upsert: true,
		});
		
		const test = {
			file_name: file_name,
			display_name: file_name,
			file_size: base64FileSize(image),
		};
		
		let { data: existingImage } = await supabase
			.from("images")
			.select("id")
			.eq("file_name", file_name)
			.single();
		
		let image_id;
		if (existingImage) {
			const { data: updatedImage } = await supabase
				.from("images")
				.update(test)
				.eq("id", existingImage.id)
				.select("id")
				.single();
			image_id = updatedImage?.id;
		} else {
			const { data: newImage } = await supabase
				.from("images")
				.insert(test)
				.select("id")
				.single();
			image_id = newImage?.id;
		}

		if (image_id) {
			await supabase
				.from("users")
				.update({ image_id: image_id })
				.eq("user_id", user_id);
		}

		return `https://mdauzoueyzgtqsojttkp.supabase.co/storage/v1/object/public/images/${file_name}`;
	} catch (error) {
		console.error("saveImage error:", error);
		throw error;
	}
}

function base64FileSize(base64String) {
	let base64Data = base64String.split(",")[1] || base64String;

	let sizeInBytes = (base64Data.length * 3) / 4;

	if (base64Data.endsWith("==")) {
		sizeInBytes -= 2;
	} else if (base64Data.endsWith("=")) {
		sizeInBytes -= 1;
	}

	return sizeInBytes;
}

module.exports = { updateUser, saveImage };
