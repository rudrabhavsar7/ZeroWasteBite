import nodemailer from "nodemailer";
import asyncHandler from "./asyncHandler.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "rbhavsar1061974@gmail.com",
    pass: "vjedofhidcxkothr",
  },
});

export const sendMail = asyncHandler(async (to, subject, msg) => {
  await transporter.sendMail({
    to,
    subject,
    html: msg,
  });
});

sendMail("rbhavsar1061974@gmail.com", "Test", "HEllo");
