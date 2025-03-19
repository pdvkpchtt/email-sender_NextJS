"use server";

import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

export const sendMail = async (email = "", orgName = "") => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: process.env.EMAIL_SERVER_PORT,
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  const templatePath = path.join(process.cwd(), "public", "emailWithPDF.html");
  const htmlTemplate = fs.readFileSync(templatePath, "utf-8");

  const htmlContent = htmlTemplate.replace(/{orgName}/g, orgName);

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Сотрудничество ${orgName} & GaiQA`,
    html: htmlContent, 
    attachments: [
      {
        filename: 'Презентация.pdf',
        path: path.join(process.cwd(), "gaiqa.pdf"),                                         
        contentType: 'application/pdf'
      }]
  };

  await transporter.sendMail(mailOptions);
};
