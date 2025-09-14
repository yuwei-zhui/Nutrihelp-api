let { updateUser, saveImage } = require("../model/updateUserProfile.js");
let getUser = require("../model/getUserProfile.js");

/**
 * Update User Profile
 * - Normal users can update only their own profile (based on token email).
 * - Admins can update any profile by providing email in the body.
 */
const updateUserProfile = async (req, res) => {
	try {
		if (!req.body.email) {
			return res.status(400).send("Email is required");
		}
		const user_profile = await updateUser(
			req.body.name,
			req.body.first_name,
			req.body.last_name,
			req.body.email,
			req.body.contact_number,
			req.body.address,
			req.body.username
		);


		if (!user_profile || !Array.isArray(user_profile) || user_profile.length === 0) {
			return res.status(404).json({ message: "User not found" });
		}

		const userId = user_profile[0] && user_profile[0].user_id;
		if (req.body.user_image && userId) {
			try {
				const url = await saveImage(req.body.user_image, userId);
				if (url) {
					user_profile[0].image_url = url;
				}
			} catch (e) {
				console.error("saveImage error:", e && e.message ? e.message : e);
			}
		}

    if (!targetEmail) {
      return res.status(400).json({ error: "Email is required" });
    }

    const userProfile = await updateUser(
      req.body.name,
      req.body.first_name,
      req.body.last_name,
      targetEmail,
      req.body.contact_number,
      req.body.address
    );

    if (!userProfile || userProfile.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // If user image provided, save it and update image_url
    if (req.body.user_image) {
      const url = await saveImage(req.body.user_image, userProfile[0].user_id);
      userProfile[0].image_url = url;
    }

    res.status(200).json(userProfile);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get User Profile
 * - Normal users can only fetch their own profile (from token).
 * - Admins can fetch any profile using `?email=xxx`.
 */
const getUserProfile = async (req, res) => {
	try {
		const email = (req.body && req.body.email) || (req.query && req.query.email);
		if (!email) {
			return res.status(400).send("Email is required");
		}

    let targetEmail = tokenEmail;

    // Admin can override with query email
    if (role === "admin" && queryEmail) {
      targetEmail = queryEmail;
    }

    if (!targetEmail) {
      return res.status(400).json({ error: "Email is required" });
    }

    const userProfile = await getUser(targetEmail);

    if (!userProfile) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(userProfile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { updateUserProfile, getUserProfile };