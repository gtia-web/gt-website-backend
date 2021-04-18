const express = require("express");
const router = express.Router();
const UserProfile = require("../models/UserProfile");
const GlobalVariables = require("../models/GlobalVariables");
const authentication = require("../utility/authentication");
const gcManager = require("../utility/GoogleCloudManager");
const fs = require("fs");

/**
 * Redirect to Home Page
 */
router.get("/", (req, res) => {
  res.render("sun/index.ejs");
});

router.get("/faq", (req, res) => {
  res.render("sun/faq.ejs");
});

router.get("/about", (req, res) => {
  res.render("sun/about.ejs");
});

router.get("/contact", (req, res) => {
  res.render("sun/contact.ejs", {
    success: false,
    error: false,
  });
});

router.post("/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const mailOptions = {
      from: email,
      to: "tiptracker302@gmail.com",
      subject: subject,
      text: `${name} says\n\n${message}`,
    };

    const transporter = await gcManager.getEmailTransporter();
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        res.render("sun/contact.ejs", {
          success: false,
          error: true,
        });
      }
      res.render("sun/contact.ejs", {
        success: true,
        error: false,
      });
    });
  } catch (err) {
    res.render("sun/contact.ejs", {
      success: false,
      error: true,
    });
  }
});

/**
 * Get Home Page if Logged in
 */
router.get("/home", authentication.checkAuthenticated, async (req, res) => {
  let userData = await UserProfile.findById(req.user._id);
  let profileFilePath =
    "public/" +
    userData.ProfilePicture.Path +
    "/" +
    userData.ProfilePicture.Filename;
  if (!fs.existsSync(profileFilePath)) {
    await gcManager.getImagefromDrive({
      Path: "public/" + userData.ProfilePicture.Path,
      Filename: userData.ProfilePicture.Filename,
      FileID: userData.ProfilePicture.GCImageID,
    });
  }

  let globalVariables = await GlobalVariables.findById(
    process.env.GLOBAL_VARIABLES_ID
  );
  res.render("moon/home.ejs", {
    user: userData,
    globalVariables: globalVariables,
  });
});

/**
 * Get Admin Portal Page
 */
router.get(
  "/admin",
  authentication.checkAuthenticated,
  authentication.checkAuthenticatedAdmin,
  async (req, res) => {
    let userData = await UserProfile.findById(req.user._id);
    res.render("moon/admin_portal.ejs", { user: userData });
  }
);

router.get("/image", (req, res) => {
  res.render("moon/imageUpload.ejs");
});

module.exports = router;
