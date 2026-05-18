import exp from "express";
import { authenticate } from "../services/authService.js";
import { UserTypeModel } from "../models/UserModel.js";
import bcrypt from "bcryptjs";
import { verifyToken } from "../middlewares/verifyToken.js";

export const commonRouter = exp.Router();


// LOGIN
commonRouter.post("/login", async (req, res, next) => {

  try {

    // get user credentials
    let userCred = req.body;

    // authenticate user
    let { token, user } = await authenticate(userCred);

    // save token as cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    // send response
    res.status(200).json({
      message: "login success",
      payload: user,
    });

  } catch (err) {

    next(err);

  }
});


// LOGOUT
commonRouter.get("/logout", (req, res) => {

  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.status(200).json({
    message: "Logged out successfully",
  });

});


// CHANGE PASSWORD
commonRouter.put("/change-password", async (req, res, next) => {

  try {

    // get data
    const {
      role,
      email,
      currentPassword,
      newPassword,
    } = req.body;

    // prevent same password
    if (currentPassword === newPassword) {

      return res.status(400).json({
        message:
          "newPassword must be different from currentPassword",
      });
    }

    // find account
    const account = await UserTypeModel.findOne({
      email,
    });

    if (!account) {

      return res.status(404).json({
        message: "Account not found",
      });
    }

    // verify current password
    const isMatch = await bcrypt.compare(
      currentPassword,
      account.password
    );

    if (!isMatch) {

      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    // hash new password
    account.password = await bcrypt.hash(
      newPassword,
      10
    );

    await account.save();

    res.status(200).json({
      message: "Password changed successfully",
    });

  } catch (err) {

    next(err);

  }
});


// CHECK AUTH
commonRouter.get(
  "/check-auth",
  verifyToken("USER", "AUTHOR", "ADMIN"),
  async (req, res, next) => {

    try {

      const account = await UserTypeModel.findById(
        req.user.userId
      ).select("-password");

      if (!account) {

        return res.status(404).json({
          message: "User not found",
        });
      }

      res.status(200).json({
        message: "authenticated",
        payload: account,
      });

    } catch (err) {

      next(err);

    }
  }
);