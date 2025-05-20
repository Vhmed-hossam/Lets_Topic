import User from "../models/userModel.js";
export async function generateUsername(name, maxAttempts = 10) {
  if (!name) return "";

  let username = name.trim().toLowerCase();
  username = username.replace(/\s+/g, "_");

  const generateWithRandomDigits = () => {
    const randomDigits = Array.from({ length: 6 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");
    return `${username}_${randomDigits}`;
  };

  let newUsername = generateWithRandomDigits();
  let attempts = 0;

  while (attempts < maxAttempts) {
    const existingUser = await User.findOne({ username: newUsername });
    if (!existingUser) {
      return newUsername;
    }
    newUsername = generateWithRandomDigits();
    attempts++;
  }

  throw new Error(
    "Unable to generate a unique username after maximum attempts"
  );
}
