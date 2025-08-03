const express = require("express");
const {
  registerUser,
  loginUser,
  getUserProfile,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const { default: passport } = require("../config/passport");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Auth Routes
router.post("/register", registerUser); // Register User
router.post("/login", loginUser); // Login User
router.get("/profile", protect, getUserProfile); // Get User Profile

router.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
    req.file.filename
  }`;
  res.status(200).json({ imageUrl });
});

router.get(
  "/login/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/login/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    try {
      if (!req.user) {
        return res.redirect(
          "http://localhost:5173/login?error=google-auth-failed"
        );
      }

      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
        // Use 'id' instead of '_id'
        expiresIn: "1d",
      });

      const responseHTML = `
        <html>
          <body>
            <script>
              // Send message to opener window with token
              window.opener.postMessage({
                type: 'google-auth-success',
                token: '${token}',
                user: ${JSON.stringify({
                  _id: req.user._id,
                  email: req.user.email,
                  name: req.user.name,
                  profileImageUrl: req.user.profileImageUrl,
                })}
              }, 'http://localhost:5173');
              window.close();
            </script>
          </body>
        </html>
      `;
      res.send(responseHTML);
    } catch (error) {
      console.error("Google auth error:", error);
      res.redirect("http://localhost:5173/login?error=google-auth-failed");
    }
  }
);
module.exports = router;
