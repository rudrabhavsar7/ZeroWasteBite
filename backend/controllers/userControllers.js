import { User } from "../models/User.js";

const registerUser = (req, res) => {
  res.status(200).json({
    message: "ok",
  });
};

export { registerUser };
