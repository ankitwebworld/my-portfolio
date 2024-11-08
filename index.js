import express from "express";
import path from "path";
import bodyParser from "body-parser";
import helmet from "helmet";
import ngrok from "ngrok";
import cookieParser from "cookie-parser";
import schedule from "node-schedule";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import session from "express-session";
import memorystore from "memorystore";
import {
  twilioPhone,
  accountSid,
  authToken,
} from "./Private/SECRET/Auth-data.js";
import educationRouter from "./public/APIs/educationPurpose.js";
import AdminAPIs from "./Private/APIs/AdminRouter.js";
import {
  BlogsModel,
  Contact,
  userProfile,
  TokenIdsModel,
  testimonial,
  Gallery,
  otpData,
  Users,
  notification,
  Newsletter,
  PrivacySecurity,
  homeInfoSettings,
  Secret_Info_Setting,
  driveFile,
  VideocallRequest,
} from "./Private/db/db_Schema.js";
import {
  GOOGLE_API_KEY,
  CLIENT_SECRET,
  CLIENT_ID,
  REDIRECT_URI,
  JWT_SECRET,
  googleAuthUrl,
  transporter,
  adminEmail,
  DERIVED_ACCESS_KEY,
  WEB_URL,
} from "./Private/SECRET/Auth-data.js";
import { OAuth2Client } from "google-auth-library";
import moment from "moment-timezone";
import fetch from "node-fetch";
import SimplePeer from "simple-peer";
import http from "http";
const app = express();

import { v4 as uuidv4 } from "uuid";

const uuid = uuidv4();

const MemoryStore = memorystore(session);
const client = new OAuth2Client({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  redirectUri: REDIRECT_URI,
});

// Middleware
app.set("view engine", "ejs");
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(express.static(path.resolve(path.resolve(), "views")));
app.use(express.static(path.resolve(path.resolve(), "public")));
app.use(express.static(path.resolve(path.resolve(), "Private")));
app.use("/Scripts", express.static(path.resolve(path.resolve(), "Scripts")));
app.use(
  "/StyleSheet",
  express.static(path.resolve(path.resolve(), "StyleSheet"))
);
app.use("/Images", express.static(path.resolve(path.resolve(), "Images")));
app.use("/APIs", express.static(path.resolve(path.resolve(), "APIs")));
app.use(
  "/AdminScripts",
  express.static(path.resolve(path.resolve(), "AdminScripts"))
);
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: JWT_SECRET,
    resave: false,
    saveUninitialized: true,
    store: new MemoryStore({
      checkPeriod: 86400000, // 1 day
    }),
    httpOnly: true,
    secure: true,
    sameSite: true,
  })
);

app.use("/education", educationRouter);
app.use("/admin", AdminAPIs);

const assignToken = (userId) => {
  const token = jwt.sign({ userId }, JWT_SECRET);
  return token;
};

async function sendMail(email, subject, emailText) {
  const mailOptions = {
    from: adminEmail,
    to: email,
    subject,
    html: emailText,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return "Email sent successfully";
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Error sending email");
  }
}

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      frameSrc: [
        "'self'",
        "https://www.google.com",
        "https://drive.google.com",
      ],
      imgSrc: [
        "'self'",
        "https://drive.google.com",
        "https://developers.google.com",
      ],
    },
  })
);
const cspConfig = {
  directives: {
    defaultSrc: ["'self'"],
    frameSrc: ["'self'", "https://www.google.com", "https://drive.google.com", "https://vercel.com"],
    connectSrc: [
      "'self'",
      "https://accounts.google.com",
      "https://cdn.socket.io",
       "https://vercel.com"
    ],
    scriptSrc: [
      "'self'",
      "https://cdn.socket.io",
      "https://cdnjs.cloudflare.com",
      "https://cdn.jsdelivr.net",
      "https://webrtc.github.io",
      "https://vercel.com"
    ],
    imgSrc: [
      "'self'",
      "https://drive.google.com",
      "https://developers.google.com",
       "https://vercel.com"
    ],
  },
};

app.use(helmet.contentSecurityPolicy(cspConfig));

// Routes
app.get(["/", "/home"], async (req, res) => {
  try {
    // res.cookie('yourCookieName', 'cookieValue', { sameSite: 'None', secure: true });
    res.render("home");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/login", async (req, res) => {
  try {
    res.render("./UserLogin/login");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/userRegistration", async (req, res) => {
  try {
    res.render("./UserLogin/registration");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/userRegistration", async (req, res) => {
  try {
    const { userId, password, Fname, Lname, accessKey } = req.body;
    const existUser = await userProfile.findOne({ userId });
    if (existUser) {
      return res.status(202).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (accessKey == DERIVED_ACCESS_KEY) {
      const createdUser = await userProfile.create({
        userId,
        password: hashedPassword,
        Fname,
        Lname,
      });

      if (createdUser) {
        const token = jwt.sign({ userId: createdUser.userId }, JWT_SECRET, {
          expiresIn: "1h",
        });
        res.status(200).json({ message: "New user registered", token });
      } else {
        return res.status(400).json({ message: "User not registered" });
      }
    } else {
      return res.status(200).json({ message: "Access Key is wrong" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const isAuthenticated = (req, res, next) => {
  const token = req.cookies.adminToken;
  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Missing token, Please login again" });
  }
  try {
    const decodedToken = jwt.verify(token, JWT_SECRET);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

const isUserAuthenticated = async (req, res, next) => {
  try {
    const jwtToken = req.cookies.userToken;

    if (!jwtToken) {
      return res
        .status(401)
        .json({
          message: "Unauthorized: Missing token, Please login again",
          error: "Unauthorized: Missing token, Please login again",
        });
    }

    const decodedToken = jwt.verify(jwtToken, JWT_SECRET);

    if (!decodedToken || !decodedToken.userId) {
      return res
        .status(401)
        .json({
          message: "Unauthorized: Invalid token, Please login again",
          error: "Unauthorized: Invalid token, Please login again",
        });
    }

    const userId = decodedToken.userId;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "User Id is missing", error: "User Id is missing" });
    }

    const userData = await Users.findOne({ _id: userId });

    if (!userData) {
      return res
        .status(404)
        .json({ message: "User not found", error: "User not found" });
    }

    if (userId !== userData._id.toString()) {
      return res
        .status(404)
        .json({
          message: "Some technical issue, please contact",
          error: "Some technical issue, please contact",
        });
    }

    req.userVerify = userId;

    next();
  } catch (error) {
    console.error(error);

    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({
          message: "Unauthorized: Invalid token, Please login again",
          error: "Unauthorized: Invalid token, Please login again",
        });
    }

    res
      .status(500)
      .json({
        message: "Internal server error",
        error: "Internal server error",
      });
  }
};

app.get("/contact", async (req, res) => {
  try {
    res.render("contact");
  } catch (error) {
    console.log(error);
  }
});

app.post("/userLogin", async (req, res) => {
  try {
    const { userId, password } = req.body;

    const userData = await userProfile.findOne({ userId });

    if (!userData) {
      return res.status(404).json({ status: 404, message: "Invalid user" });
    }

    const isPasswordValid = await bcrypt.compare(password, userData.password);

    if (!isPasswordValid) {
      return res.status(400).json({ status: 400, message: "Invalid password" });
    }

    const token = assignToken(userId);

    res.cookie("adminToken", token, {
      expires: new Date(Date.now() + 9000000),
      httpOnly: true,
      secure: true,
      sameSite: true,
    });

    return res
      .status(200)
      .json({
        status: 200,
        message: "Login successful",
        data: userData.userId,
      });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: 500, message: "Internal server error" });
  }
});

app.get("/about", async (req, res) => {
  try {
    res.render("./UserLogin/aboutMe");
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

async function getUniqueReferenceId() {
  try {
    const tokenData = await TokenIdsModel.findOne({
      "tokenIds.ReferenceId": generateUniqueId(),
    });

    if (tokenData) {
      return getUniqueReferenceId();
    } else {
      return generateUniqueId();
    }
  } catch (error) {
    console.error("Error in getUniqueReferenceId:", error);
    throw error;
  }
}

function generateUniqueId() {
  const randomNumber = Math.floor(1000000 + Math.random() * 9000000);

  const uniqueId = `#REF${randomNumber}`;

  return uniqueId;
}

app.post("/contactus", async (req, res) => {
  try {
    const { name, address, phoneNo, subject, message, purpose } = req.body;

    // Generate a unique reference ID
    const ReferenceId = await getUniqueReferenceId();

    const newContact = new Contact({
      name,
      ReferenceId,
      emailAddress: address,
      phoneNo,
      subject,
      message,
    });

    // Check if there is existing token data for the given email address
    const existingTokenData = await TokenIdsModel.findOne({
      emailAddress: address,
    });

    if (existingTokenData) {
      // If token data exists, push the new ReferenceId with its purpose
      existingTokenData.tokenIds.push({
        ReferenceId,
        purpose,
      });
      await existingTokenData.save();
    } else {
      // If no token data exists, create a new TokenIdsModel document
      const newToken = new TokenIdsModel({
        emailAddress: address,
        tokenIds: [
          {
            ReferenceId,
            purpose,
          },
        ],
      });
      await newToken.save();
    }

    // Save the new contact document to the database
    await newContact.save();

    // Send a success response to the client
    res.json({ message: "Contact form submitted successfully!" });
  } catch (error) {
    console.error("Error in /contactus:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/home/Testimonials", async (req, res) => {
  try {
    const Testimonials = await testimonial.find();

    if (!Testimonials) {
      return res
        .status(404)
        .json({ message: "Testimonials are not available" });
    }
    res.status(200).json(Testimonials);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.route("/userAccountRegistration")
  .get(async (req, res) => {
    try {
      const googleLogo =
        "https://developers.google.com/identity/images/g-logo.png";
      res.render("./UserLogin/normalUserRegistration", { googleLogo });
    } catch (error) {
      console.error(error);
      res.send(error);
    }
  })
  .post(async (req, res) => {
    try {
      const { firstName, lastName, phoneNumber, email, password } = req.body;
      const existingUser = await Users.findOne({
        $or: [{ userId: phoneNumber }, { email: email }],
      });
      const hashedPassword = await bcrypt.hash(password, 10);

      if (existingUser) {
        return res.status(400).json({ message: "User already registered" });
      } else {
        const newUser = new Users({
          Fname: firstName,
          Lname: lastName,
          userId: phoneNumber,
          email,
          password: hashedPassword,
        });

        await newUser.save();

        const token = await jwt.sign({ userId: newUser._id }, JWT_SECRET, {
          expiresIn: "1h",
        });

        res.cookie("userToken", token, {
          expires: new Date(Date.now() + 9000000),
          httpOnly: true,
          secure: true,
          sameSite: true,
        });

        await sendMail(
          email,
          "Thank you for Registering with us",
          RegistrationThankyou(
            email,
            firstName ? firstName : "",
            lastName ? lastName : "",
            `${WEB_URL}/login`,
            `${WEB_URL}/get-logo-from-drive/Ankitpicture.png`,
            WEB_URL
          )
        );

        return res
          .status(200)
          .json({ message: "Registration successful", token });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

function RegistrationThankyou(
  email,
  firstName,
  lastName,
  loginUrl,
  imageUrl,
  HomePageUrl
) {
  const emailText = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Registration Thank You</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f2f2f2;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #fff;
                    padding: 20px;
                    border-radius: 5px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                h1 {
                    color: #333;
                    text-align: center;
                }
                p {
                    color: #666;
                    line-height: 1.6;
                }
                .button {
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #007bff;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    color: white;
                    font-weight: bold;
                } 
                .button:hover {
                    background-color: #0056b3;
                }
                .image-container {
                    text-align: center;
                    margin-bottom: 20px;
                    overflow: hidden;
                    border-radius: 50%; 
                    width: 200px; 
                    height: 200px; 
                    margin: 0 auto; 
                }
                .image-container img {
                    max-width: 100%;
                    height: auto;
                    display: block;
                    margin: 0 auto;
                    border-radius: 50%; 
                }
                .message {
                    background-color: #f9f9f9;
                    padding: 15px;
                    border-radius: 5px;
                    margin-bottom: 20px;
                }
                .message h2 {
                    color: #333;
                    font-size: 18px;
                    margin-bottom: 10px;
                }
                .message p {
                    font-size: 16px;
                    margin-bottom: 10px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Thank You for Registering!</h1>
                <div class="image-container">
                    <img src="${imageUrl}" alt="Ankit's Picture">
                </div>
                <p class="message">Dear ${firstName ? firstName : email} ${
    lastName ? lastName : ""
  },</p>
                <div class="message">
                    <h2>Thank you for registering with us!</h2>
                    <p>We're excited to have you join our community. You can now explore our services.</p>
                    <p>If you have any questions or need assistance, feel free to contact our support team.</p>
                </div>
                <p>We look forward to seeing you!</p>
                <p>Click the button below to login:</p>
                <p><a class="button" href="${loginUrl}">Login</a></p>
                <p>Click the button below to visit the Home page:</p>
                <p><a class="button" href="${HomePageUrl}">Visit</a></p>
            </div>
        </body>
        </html>
    `;
  return emailText;
}

app.post("/normalUserLogin", async (req, res) => {
  try {
    const { userId, password } = req.body;
    const userData = await Users.findOne({
      $or: [{ email: userId }, { userId }],
    });

    if (!userData) {
      return res
        .status(401)
        .json({ message: "Invalid credentials", status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Invalid credentials", status: 401 });
    }
    const token = await jwt.sign({ userId: userData._id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("userToken", token, {
      expires: new Date(Date.now() + 9000000),
      httpOnly: true,
      secure: true,
      sameSite: true,
    });

    res.status(200).json({ message: "Login successful", status: 200 });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal error", status: 500 });
  }
});

app.get("/userhomepage", isUserAuthenticated, async (req, res, next) => {
  try {
    res.render("./UserLogin/userHomePage");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/userHomePageInfo", isUserAuthenticated, async (req, res) => {
  try {
    const user = await Users.findOne({ _id: req.userVerify })
      .select("-password")
      .exec();

    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in /userHomePageInfo route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/getUserInfo", isUserAuthenticated, async (req, res) => {
  try {
    const user = await Users.findOne({ _id: req.userVerify })
      .select("-password")
      .exec();
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/userUpdateInfo", isUserAuthenticated, async (req, res) => {
  try {
    const user = await Users.findOne({ _id: req.userVerify })
      .select("-password")
      .exec();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update basic user information
    if (req.body.Fname && req.body.Lname) {
      user.Fname = req.body.Fname;
      user.Lname = req.body.Lname;
    }

    // Update additional user details
    if (req.body.bio !== undefined) {
      user.userDetails.bio = req.body.bio;
    }

    if (req.body.dateOfBirth !== undefined) {
      user.userDetails.dateOfBirth = req.body.dateOfBirth;
    }

    if (req.body.phoneNumber !== undefined) {
      user.userDetails.phoneNumber = req.body.phoneNumber;
    }

    // Update address information
    if (req.body.street !== undefined) {
      user.userDetails.address.street = req.body.street;
    }

    if (req.body.city !== undefined) {
      user.userDetails.address.city = req.body.city;
    }

    if (req.body.state !== undefined) {
      user.userDetails.address.state = req.body.state;
    }

    if (req.body.postalCode !== undefined) {
      user.userDetails.address.postalCode = req.body.postalCode;
    }

    // Update interests
    if (req.body.interests !== undefined) {
      if (typeof req.body.interests === "string") {
        user.userDetails.interests = req.body.interests
          .split(",")
          .map((interest) => interest.trim());
      } else if (Array.isArray(req.body.interests)) {
        user.userDetails.interests = req.body.interests;
      } else {
        return res.status(400).json({ error: "Invalid interests format" });
      }
    }
    //Add institutions
    if (req.body.institution !== undefined) {
      if (
        req.body.degree !== undefined &&
        req.body.graduationYear !== undefined
      ) {
        const data = {
          institution: req.body.institution,
          degree: req.body.degree,
          graduationYear: req.body.graduationYear,
        };
        user.userDetails.education.push(data);
      } else {
        return res.status(400).json({ error: "Invalid education format" });
      }
    }

    //update skillSet

    if (req.body.skillSet !== undefined) {
      if (typeof req.body.skillSet === "string") {
        user.userDetails.skillSet = req.body.skillSet
          .split(",")
          .map((skill) => skill.trim());
      } else if (Array.isArray(req.body.skillSet)) {
        user.userDetails.skillSet = req.body.skillSet;
      } else {
        return res.status(400).json({ error: "Invalid skill set format" });
      }
    }

    //add work Experience
    if (req.body.company !== undefined) {
      if (
        req.body.position !== undefined &&
        req.body.startDate !== undefined &&
        req.body.endDate !== undefined
      ) {
        const data = {
          company: req.body.company,
          position: req.body.position,
          startDate: req.body.startDate,
          endDate: req.body.endDate,
        };
        user.userDetails.workExperience.push(data);
      } else {
        return res
          .status(400)
          .json({ error: "Invalid work experience format" });
      }
    }

    if (req.body.certifications !== undefined) {
      if (typeof req.body.certifications === "string") {
        user.userDetails.certifications = req.body.certifications
          .split(",")
          .map((certification) => certification.trim());
      } else if (Array.isArray(req.body.certifications)) {
        user.userDetails.certifications = req.body.certifications;
      } else {
        return res.status(400).json({ error: "Invalid certifications format" });
      }
    }

    // Update projects
    if (req.body.projectName !== undefined) {
      if (
        req.body.description !== undefined &&
        req.body.startDate !== undefined &&
        req.body.endDate !== undefined
      ) {
        const data = {
          projectName: req.body.projectName,
          description: req.body.description,
          startDate: req.body.startDate,
          endDate: req.body.endDate,
        };
        user.userDetails.projects.push(data);
      } else {
        return res.status(400).json({ error: "Invalid project format" });
      }
    }
    //add languages
    if (req.body.languages !== undefined) {
      if (typeof req.body.languages === "string") {
        user.userDetails.languages = req.body.languages
          .split(",")
          .map((language) => language.trim());
      } else if (Array.isArray(req.body.languages)) {
        user.userDetails.languages = req.body.languages;
      } else {
        return res.status(400).json({ error: "Invalid languages format" });
      }
    }
    // add hobbies
    if (req.body.hobbies !== undefined) {
      if (typeof req.body.hobbies === "string") {
        user.userDetails.hobbies = req.body.hobbies
          .split(",")
          .map((hobby) => hobby.trim());
      } else if (Array.isArray(req.body.hobbies)) {
        user.userDetails.hobbies = req.body.hobbies;
      } else {
        return res.status(400).json({ error: "Invalid hobbies format" });
      }
    }

    //add and update-social-media links

    // Update social media
    if (req.body.linkedin !== undefined) {
      user.userDetails.socialMedia.linkedin = req.body.linkedin.trim();
    }

    if (req.body.twitter !== undefined) {
      user.userDetails.socialMedia.twitter = req.body.twitter.trim();
    }

    if (req.body.github !== undefined) {
      user.userDetails.socialMedia.github = req.body.github.trim();
    }

    // add or update personal Website
    if (req.body.personalWebsite !== undefined) {
      user.userDetails.personalWebsite = req.body.personalWebsite.trim();
    }
    await user.save();

    return res.status(200).json({ message: "Information Updated" });
  } catch (error) {
    console.error("Error updating user information:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/userUpdateEducation", isUserAuthenticated, async (req, res) => {
  try {
    const { institution, _id, degree, graduationYear } = req.body;

    const user = await Users.findOne({ _id: req.userVerify })
      .select("-password")
      .exec();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const educationRecord = user.userDetails.education.find(
      (edu) => edu._id.toString() === _id
    );

    if (!educationRecord) {
      return res.status(404).json({ error: "Education record not found" });
    }

    educationRecord.institution = institution;
    educationRecord.degree = degree;
    educationRecord.graduationYear = graduationYear;

    await user.save();

    return res
      .status(200)
      .json({ message: "Education record updated successfully" });
  } catch (error) {
    console.error("Error updating education record:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});


app.post("/deleteEducation", isUserAuthenticated, async (req, res) => {
  try {
    const { _id } = req.body;

    const user = await Users.findOne({ _id: req.userVerify })
      .select("-password")
      .exec();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const educationRecordIndex = user.userDetails.education.findIndex(
      (edu) => edu._id.toString() === _id
    );

    if (educationRecordIndex === -1) {
      return res.status(404).json({ error: "Education record not found" });
    }

    // Remove the education record from the array
    user.userDetails.education.splice(educationRecordIndex, 1);

    await user.save();

    return res
      .status(200)
      .json({ message: "Education record deleted successfully" });
  } catch (error) {
    console.error("Error deleting education record:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/updateWorkExperience", isUserAuthenticated, async (req, res) => {
  try {
    const { company, endDate, position, startDate, _id } = req.body;

    const user = await Users.findOne({ _id: req.userVerify })
      .select("-password")
      .exec();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const workExperienceRecord = user.userDetails.workExperience.find(
      (exp) => exp._id.toString() === _id
    );

    if (!workExperienceRecord) {
      return res
        .status(404)
        .json({ error: "Work experience record not found" });
    }

    workExperienceRecord.company = company;
    workExperienceRecord.position = position;
    workExperienceRecord.startDate = startDate;
    workExperienceRecord.endDate = endDate;

    await user.save();

    return res
      .status(200)
      .json({ message: "Work experience record updated successfully" });
  } catch (error) {
    console.error("Error updating work experience record:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/deleteWorkExperience", isUserAuthenticated, async (req, res) => {
  try {
    const { _id } = req.body;

    const user = await Users.findOne({ _id: req.userVerify })
      .select("-password")
      .exec();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const workExperienceIndex = user.userDetails.workExperience.findIndex(
      (exp) => exp._id.toString() === _id
    );

    if (workExperienceIndex === -1) {
      return res
        .status(404)
        .json({ error: "Work experience record not found" });
    }

    // Remove the work experience record from the array
    user.userDetails.workExperience.splice(workExperienceIndex, 1);

    await user.save();

    return res
      .status(200)
      .json({ message: "Work experience record deleted successfully" });
  } catch (error) {
    console.error("Error deleting work experience record:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/updateProject", isUserAuthenticated, async (req, res) => {
  try {
    const { description, endDate, projectName, startDate, _id } = req.body;

    const user = await Users.findOne({ _id: req.userVerify })
      .select("-password")
      .exec();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const projectRecord = user.userDetails.projects.find(
      (project) => project._id.toString() === _id
    );

    if (!projectRecord) {
      return res.status(404).json({ error: "Project record not found" });
    }

    projectRecord.projectName = projectName;
    projectRecord.description = description;
    projectRecord.startDate = startDate;
    projectRecord.endDate = endDate;

    await user.save();

    return res
      .status(200)
      .json({ message: "Project record updated successfully" });
  } catch (error) {
    console.error("Error updating project record:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/deleteProject", isUserAuthenticated, async (req, res) => {
  try {
    const { _id } = req.body;

    const user = await Users.findOne({ _id: req.userVerify })
      .select("-password")
      .exec();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const projectIndex = user.userDetails.projects.findIndex(
      (project) => project._id.toString() === _id
    );

    if (projectIndex === -1) {
      return res.status(404).json({ error: "Project record not found" });
    }

    // Remove the project record from the array
    user.userDetails.projects.splice(projectIndex, 1);

    await user.save();

    return res
      .status(200)
      .json({ message: "Project record deleted successfully" });
  } catch (error) {
    console.error("Error deleting project record:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/getUserMessageContact", isUserAuthenticated, async (req, res) => {
  try {
    const user = await Users.findOne({ _id: req.userVerify })
      .select("-password")
      .exec();

    const contactData = await Contact.find({
      $or: [
        { emailAddress: user.email },
        { phoneNo: user.userId || user.userDetails.phoneNo },
      ],
    });

    if (contactData.length === 0) {
      return res.status(404).json({ message: "No contact data available" });
    }

    res.status(200).json(contactData);
  } catch (error) {
    console.error("Error fetching contact data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/sendingMessageReply", isUserAuthenticated, async (req, res) => {
  try {
    const { message, referenceId, respondBy } = req.body;

    const contactData = await Contact.findOne({ ReferenceId: referenceId });

    if (!contactData) {
      return res.status(404).json({ error: "Contact not found" });
    }

    contactData.responses.push({
      respondBy: respondBy,
      message: message,
      timestamp: new Date(),
    });

    await contactData.save();

    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/getNotifications", isUserAuthenticated, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;
    const notifications = await notification
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/loadMoreNotifications", isUserAuthenticated, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 2;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const skip = (page - 1) * pageSize;

    const moreNotifications = await notification
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);
    res.json(moreNotifications);
  } catch (error) {
    console.error("Error fetching more notifications:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/getVerification", isUserAuthenticated, async (req, res) => {
  try {
    const user = await Users.findOne({ _id: req.userVerify })
      .select("-password")
      .exec();
    res.status(200).json({ message: "success", email: user.email });
  } catch (error) {
    console.error(error);
  }
});

app.post("/sendOtpRequest", isUserAuthenticated, async (req, res) => {
  try {
    const email = req.body.email;
    const user = await Users.findOne({ _id: req.userVerify })
      .select("-password")
      .exec();

    if (!user) {
      return res.status(404).json({ message: "User not found", status: 404 });
    }

    const sendedOtp = Math.floor(
      100000 + crypto.randomBytes(3).readUIntBE(0, 3)
    );
    const emailContent = emailText(sendedOtp, user.Fname, user.Lname);

    await sendMail(email, "Account Verification OTP", emailContent);

    req.session.otp = sendedOtp;
    res.status(200).json({ message: "OTP sent successfully", status: 200 });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

app.post("/verifyOtp", isUserAuthenticated, async (req, res) => {
  try {
    const formOtp = req.body.otp;
    const sessionOtp = req.session.otp;

    const user = await Users.findOne({ _id: req.userVerify })
      .select("-password")
      .exec();

    if (!user) {
      return res.status(404).json({ message: "User not found", status: 404 });
    }

    if (formOtp !== sessionOtp.toString() || !sessionOtp || !formOtp) {
      res.status(401).json({ message: "OTP verification failed" });
    } else {
      delete req.session.otp;
      user.verifiedByGoogle = true;
      user.save();
      res.status(200).json({ message: "OTP verification successful" });
    }
  } catch (error) {
    console.log(error.message);
    console.error("Error verifying OTP:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

function emailText(otp, Fname, Lname) {
  const emailText = `
    <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
        <p>Hello, ${Fname} ${Lname}</p>
        <p>Thank you for registering with our service. Your OTP for account verification is:</p>
        <h2 style="font-size: 24px; color: #007bff; margin-top: 20px; margin-bottom: 10px;">${otp}</h2>
        <p>Please use this OTP to verify your account. It is valid for a limited time period.</p>
        <p>If you didn't request this OTP, please ignore this email.</p>
        
        <p>Best regards,</p>
        <p>Your Service Team</p>
    </div>
`;

  return emailText;
}

app.post("/subscribe", async (req, res) => {
  const email = req.body.email;
  try {
    const existingSubscription = await Newsletter.findOne({ email: email });

    if (existingSubscription) {
      return res.status(200).json({ error: "Email already subscribed" });
    }

    const newSubscription = new Newsletter({
      email: email,
    });

    await newSubscription.save();

    const user = await Users.findOne({ email }).select("-password").exec();

    if (user) {
      const emailContent = EmailForSubscription(user.Fname, user.Lname, email);
      await sendMail(email, "Subscription Confirmation", emailContent);
    } else {
      const emailContent = EmailForSubscription(null, null, email);
      await sendMail(email, "Subscription Confirmation", emailContent);
    }

    res.status(200).json({ message: "Subscription successful" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

function EmailForSubscription(Fname, Lname, email) {
  const emailText = `
    <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; line-height: 1.6;">
        <p>Hello, ${Fname ? Fname : email} ${Lname ? Lname : ""}</p>
        <p>Thank you for subscribing to updates from my personal portfolio. I'm excited to have you on board!</p>
        
        <h3 style="margin-bottom: 10px;">What to Expect:</h3>
        <ul style="margin-left: 20px;">
            <li>Exclusive updates on my latest projects and creations</li>
            <li>Insights and behind-the-scenes looks into my creative process</li>
            <li>Announcements about upcoming events or collaborations</li>
            <li>Opportunities to engage with me directly through Q&A sessions or feedback forms</li>
        </ul>
        
        <h3 style="margin-bottom: 10px;">Stay Connected:</h3>
        <p>Connect with me on social media for more updates and behind-the-scenes content:</p>
        <ul style="margin-left: 20px;">
            <li><a href="https://x.com/APcreations13?t=3Dx2gBQgpmwjU7cTuqeo9w&s=09" target="_blank" style="text-decoration: none; color: #007bff;">x.com</a></li>
            <li><a href="https://www.facebook.com/ankit.ankitpatel.1694/" target="_blank" style="text-decoration: none; color: #007bff;">Facebook</a></li>
            <li><a href="https://www.instagram.com/vairagya_a/" target="_blank" style="text-decoration: none; color: #007bff;">Instagram</a></li>
            <li><a href="https://www.linkedin.com/in/ankit-patel-6516a3219" target="_blank" style="text-decoration: none; color: #007bff;">Linkedin</a></li>
        </ul>
        
        <div style="background-color: #f4f4f4; padding: 20px; margin-top: 20px;">
            <p style="margin-bottom: 5px;"><strong>Need Help?</strong></p>
            <p style="margin-bottom: 5px;">Feel free to reach out if you have any questions or need assistance:</p>
            <p style="margin-bottom: 0;">Email: ankitlodhi239@gmail.com</p>
        </div>
        
        <h3 style="margin-bottom: 10px; margin-top: 20px;">We Value Your Feedback:</h3>
        <p>Your feedback is important to me. Don't hesitate to share your thoughts or ideas!</p>
        
        <p style="margin-top: 20px;">Thank you once again for subscribing. I look forward to sharing my journey with you!</p>
        
        <p style="margin-top: 20px;">Best regards,</p>
        <p>Ankit Patel</p>
    </div>
    `;
  return emailText;
}

app.get("/visit/PrivacySecurity", async (req, res) => {
  try {
    res.render("./PrivacySecurity/PrivacySecurity");
  } catch (error) {
    console.error("Error rendering Privacy and Security page:", error);
    res.status(500).send("Internal Server Error");
  }
});

// const authenticateToken = (req, res, next) => {
//     const authHeader = req.headers['authorization'];
//     console.log(authHeader)
//     const token = authHeader && authHeader.split(' ')[1];
//     if (!token) return res.sendStatus(401); // Unauthorized

//     jwt.verify(token, SECRET_KEY, (err, user) => {
//         if (err) return res.sendStatus(403); // Forbidden
//         req.user = user;
//         next();
//     });
// };

// Middleware for role-based access control
// const authorizeRole = (requiredRole) => {
//     return (req, res, next) => {
//         if (req.user.role !== requiredRole) return res.sendStatus(403); // Forbidden
//         next();
//     };
// };

// Protect the /loadPrivacySecurity endpoint with authentication and authorization
app.get("/loadPrivacySecurity", async (req, res) => {
  try {
    const privacySecurityData = await PrivacySecurity.find()
      .select("-author")
      .exec();
    if (!privacySecurityData) {
      return res
        .status(404)
        .json({ message: "Privacy and Security data not available" });
    }

    res.status(200).json(privacySecurityData);
  } catch (error) {
    console.error("Error loading Privacy and Security data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/user-forgot-password", async (req, res) => {
  try {
    res.render("./UserLogin/user-forgot-password");
  } catch (error) {
    console.error("Error handling password reset request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/user-forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const randomBytes = crypto.randomBytes(3);
    const otp = parseInt(randomBytes.toString("hex"), 16) % 1000000;
    const formattedOTP = otp.toString().padStart(6, "0");

    const userProfileData = await Users
      .findOne({ email: email.trim() })
      .select("-password")
      .exec();
    if (!userProfileData) {
      return res
        .status(404)
        .json({ message: "Email does not match any records." });
    }

    req.session.otp = formattedOTP;
    req.session.email = email;
    await sendMail(
      email,
      "Regarding password reset",
      resetMail(
        userProfileData.Fname ? userProfileData.Fname : "",
        userProfileData.Lname ? userProfileData.Lname : "",
        formattedOTP
      )
    );

    res
      .status(202)
      .json({
        message: "Password reset instructions have been sent to your email.",
      });
  } catch (error) {
    console.error("Error handling password reset request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/verify-user-forgot-password-otp", async (req, res) => {
  try {
    const emailotp = req.body.otp;

    const sessionOtp = req.session.otp;
    const email = req.session.email;

    if (!email || !sessionOtp) {
      return res
        .status(400)
        .json({ message: "Session data not found.", success: false });
    }

    if (emailotp !== sessionOtp) {
      return res
        .status(400)
        .json({ message: "Invalid OTP. Please try again.", success: false });
    }

    delete req.session.otp;

    const userProfileData = await Users.findOne({ email });

    if (!userProfileData) {
      return res
        .status(404)
        .json({ message: "User profile not found.", success: false });
    }

    req.session.ableToChangePassword = true;
    res
      .status(200)
      .json({ message: "OTP verification successful.", success: true });
  } catch (error) {
    console.error("Error handling OTP verification:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/change-user-password-reset", async (req, res) => {
  try {
    const password = req.body.password;
    const email = req.session.email;

    if (!email) {
      return res
        .status(400)
        .json({ message: "Session data not found.", success: false });
    }

    delete req.session.email;

    const userProfileData = await Users.findOne({ email });

    if (!userProfileData) {
      return res
        .status(404)
        .json({ message: "User profile not found.", success: false });
    }

    if (!req.session.ableToChangePassword) {
      return res
        .status(403)
        .json({
          message: "User is not authorized to change password at this time.",
          success: false,
        });
    }

    userProfileData.password = await bcrypt.hash(password, 10);
    await userProfileData.save();

    const token = jwt.sign({ userId: userProfileData._id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("userToken", token, {
      expires: new Date(Date.now() + 9000000),
      httpOnly: true,
      secure: true,
      sameSite: true,
    });
    res
      .status(202)
      .json({ message: "Password changed successfully.", success: true });
  } catch (error) {
    console.error("Error handling password change:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

function resetMail(Fname, Lname, OTP) {
  return `
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                border: 1px solid #ccc;
            }
            .logo {
                text-align: center;
                margin-bottom: 20px;
                font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
            }
            .logo img {
                width: 150px;
            }
            .message {
                margin-bottom: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">
              <h3>ANKIT PATEL</h3>
            </div>
            <div class="message">
                <p>Dear ${Fname} ${Lname},</p>
                <p>We have received a request to reset your password. Please use the following One Time Password (OTP) to complete the password reset process:</p>
                <p><strong>${OTP}</strong></p>
                <p>If you did not request a password reset, please ignore this email.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

app.post("/account-deletion-Request", isUserAuthenticated, async (req, res) => {
  try {
    const user = await Users.findOne({ _id: req.userVerify })
      .select("-password")
      .exec();

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(404).json("Internal server error");
  }
});

app.post(
  "/submit-account-delete-request",
  isUserAuthenticated,
  async (req, res) => {
    try {
      const { deleteRequestReason, deleteRequestDate, deleteRequest } =
        req.body;
      const update = {
        "deletionRequest.deleteRequest": deleteRequest,
        "deletionRequest.deleteRequestDate": deleteRequest
          ? new Date(deleteRequestDate) || Date.now()
          : null,
        "deletionRequest.deleteRequestReason": deleteRequestReason,
      };

      // If the user cancels the deletion request, set deleteRequest to false
      if (!deleteRequest) {
        update["deletionRequest.deleteRequest"] = false;
        update["deletionRequest.deleteRequestDate"] = null;
        update["deletionRequest.deleteRequestReason"] = null;
      }

      await Users.findByIdAndUpdate(req.userVerify, update);
      if (deleteRequest) {
        res
          .status(200)
          .json({ message: "Deletion request submitted successfully" });
      } else {
        res
          .status(200)
          .json({ message: "Deletion request withdrawn successfully" });
      }
    } catch (error) {
      console.error("Error submitting deletion request:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

app.post("/logout", isUserAuthenticated, async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      res.clearCookie("session");
      res.clearCookie("userToken");
      res.status(200).json({ message: "Logout successful" });
    });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/auth/google", (req, res) => {
  res.redirect(googleAuthUrl);
});

// app.get("/auth/google/callback", async (req, res) => {
//   try {
//     const code = req.query.code;
//     const { tokens } = await client.getToken(code);

//     const userInfo = await client.verifyIdToken({
//       idToken: tokens.id_token,
//       audience: CLIENT_ID,
//     });

//     const payload = userInfo.getPayload();
//     const firstName = payload.given_name;
//     const lastName = payload.family_name;
//     const email = payload.email;
//     const phoneNumber = payload.phone_number;

//     const existingUser = await Users.findOne({ email: email });

//     if (existingUser) {
//       req.session.userId = existingUser._id;
//       return res.redirect("/login");
//     } else {
//       const newUser = new Users({
//         Fname: firstName,
//         Lname: lastName,
//         userId: phoneNumber,
//         email:email,
//         verifiedByGoogle: true,
//       });

//       await newUser.save();

//       const token = await jwt.sign({ userId: newUser._id }, JWT_SECRET, {
//         expiresIn: "1h",
//       });

// const decodeToken =  jwt.verify(token,JWT_SECRET)
// console.log("/auth/google/callback decode :  "+ decodeToken);
//       res.cookie("userToken", token, {
//         expires: new Date(Date.now() + 9000000),
//         httpOnly: true,
//         secure: true,
//         sameSite: true,
//       });
//       const jwtToken = req.cookies.userToken;
//       console.log("/auth/google/callback jwtToken : "+jwtToken)
//       const savedUser = await newUser.save();
//       req.session.userId = savedUser._id;
//       res.redirect("/enter-password");
//     }
//   } catch (error) {
//     console.error("Error exchanging authorization code for token:", error);
//     res.status(500).send("Error exchanging authorization code for token");
//   }
// });

// app.get("/auth/google/callback", async (req, res) => {
//   try {
//     const code = req.query.code;
//     const { tokens } = await client.getToken(code);

//     const userInfo = await client.verifyIdToken({
//       idToken: tokens.id_token,
//       audience: CLIENT_ID,
//     });

//     const payload = userInfo.getPayload();
//     const firstName = payload.given_name;
//     const lastName = payload.family_name;
//     const email = payload.email;
//     const phoneNumber = payload.phone_number;

//     const existingUser = await Users.findOne({ email: email });

//     if (existingUser) {
//       req.session.userId = existingUser._id;
//       return res.redirect("/login");
//     } else {
//       const newUser = new Users({
//         Fname: firstName,
//         Lname: lastName,
//         userId: phoneNumber,
//         email: email,
//         verifiedByGoogle: true,
//       });

//       await newUser.save();

//       const token = await jwt.sign({ userId: newUser._id }, JWT_SECRET, {
//         expiresIn: "1h",
//       });

     
//       res.cookie("userToken", token, {
//         expires: new Date(Date.now() + 9000000),
//         httpOnly: true,
//         secure: ,
//         sameSite: 'lax',
//       });

//       req.session.userId = newUser._id;
//       res.redirect("/enter-password");
//     }
//   } catch (error) {
//     console.error("Error exchanging authorization code for token:", error);
//     res.status(500).send("Error exchanging authorization code for token");
//   }
// });

app.get("/auth/google/callback", async (req, res) => {
  try {
    const code = req.query.code;
    const { tokens } = await client.getToken(code);

    const userInfo = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: CLIENT_ID,
    });

    const payload = userInfo.getPayload();
    const firstName = payload.given_name;
    const lastName = payload.family_name;
    const email = payload.email;
    const phoneNumber = payload.phone_number;

    const existingUser = await Users.findOne({ email: email });

    if (existingUser) {
      req.session.userId = existingUser._id;
      return res.redirect("/login");
    } else {
      const newUser = new Users({
        Fname: firstName,
        Lname: lastName,
        userId: phoneNumber,
        email: email,
        verifiedByGoogle: true,
      });

      await newUser.save();

      const token = await jwt.sign({ userId: newUser._id }, JWT_SECRET, {
        expiresIn: "1h",
      });

      res.cookie("userToken", token, {
        expires: new Date(Date.now() + 9000000),
        httpOnly: true,
        secure: false,
        sameSite: 'lax', 
      });
       
      req.session.userId = newUser._id;
      res.redirect("/enter-password");
    }
  } catch (error) {
    console.error("Error exchanging authorization code for token:", error);
    res.status(500).send("Error exchanging authorization code for token");
  }
});   
 

app.get("/enter-password", isUserAuthenticated, async (req, res) => {
  res.render("./UserLogin/password-entry-form");
});

app.post("/enter-password", isUserAuthenticated, async (req, res) => {
  try {
    const { password, PhoneNo } = req.body;
    const userId = req.session.userId;
    const cookieId = req.userVerify;

    if (!userId && !cookieId) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = await Users.findByIdAndUpdate(userId, {
      password: hashedPassword,
      userId: PhoneNo,
    });

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    delete req.session.userId;
    await sendMail(
      userData.email,
      "Thank you for Registering with us",
      RegistrationThankyou(
        userData.email,
        userData.Fname ? userData.Fname : "",
        userData.Lname ? userData.Lname : "",
        `${WEB_URL}/login`,
        `${WEB_URL}/get-logo-from-drive/Ankitpicture.png`,
        WEB_URL
      )
    );

    return res
      .status(200)
      .json({ message: "Password and phone number updated successfully" });
  } catch (error) {
    console.error("Error updating password and phone number:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/normalUserLoginPutEmail", async (req, res) => {
  try {
    const userId = req.session.userId;
    const cookieId = req.userVerify;
    if (!userId && !cookieId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const userData = await Users.findById(userId || cookieId)
      .select("-password")
      .exec();
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ email: userData.email });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/get-homepage-info", async (req, res) => {
  try {
    const homepageInfo = await homeInfoSettings.findOne();
    res.status(200).json(homepageInfo);
  } catch (error) {
    console.error("Error fetching homepage information:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "An error occurred while fetching homepage information",
      });
  }
});

app.get("/get-logo-from-drive/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const imageId = await driveFile
      .findOne({ filename: name })
      .select("fileId")
      .lean();
    const response = await fetch(
      `https://drive.google.com/uc?id=${imageId.fileId}`
    );

    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      res.set("Content-Type", response.headers.get("content-type"));
      res.send(buffer);
    } else {
      res.status(response.status).send("Error fetching image");
    }
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/get-resume-from-drive/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const imageId = await driveFile
      .findOne({ filename: name })
      .select("fileId")
      .lean();
    const response = await fetch(
      `https://drive.google.com/uc?id=${imageId.fileId}`
    );

    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      res.set("Content-Type", response.headers.get("content-type"));
      res.set("Content-Disposition", `attachment; filename="${name}"`);
      res.send(buffer);
    } else {
      res.status(response.status).send("Error fetching resume");
    }
  } catch (error) {
    console.error("Error fetching resume:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/get-drive-image/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const response = await fetch(`https://drive.google.com/uc?id=${id}`);

    if (response.ok) {
      const buffer = await response.buffer();
      res.set("Content-Type", response.headers.get("content-type"));
      res.send(buffer);
    } else {
      res.status(response.status).send("Error fetching image");
    }
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/videocallaccess", isUserAuthenticated, async (req, res) => {
  try {
    const userId = req.userVerify;
    const userData = await Users.findById(userId).select("-password").exec();

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    const videocallRequestData = await VideocallRequest.find({
      $or: [{ userId: userId }, { userEmail: userData.email }],
    });

    res.status(200).json({ userData, videocallRequestData });
  } catch (error) {
    console.error("Error accessing video call page:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/send-video-call-info", isUserAuthenticated, async (req, res) => {
  try {
    const { email, requesterFirstName, requesterLastName, timing } = req.body;
    const userId = req.userVerify;
    // Generate a unique ID for requestId
    let requestId = null;
    async function getRequestId() {
      requestId = uuid;
      const findRequestId = await VideocallRequest.findOne({ requestId });
      if (findRequestId) {
        getRequestId();
      } else {
        return requestId;
      }
    }
   requestId = await getRequestId();
    console.log(requestId)

    const newVideocallRequest = new VideocallRequest({
      requestId,
      userId,
      userEmail: email,
      requesterFirstName,
      requesterLastName,
      timing: new Date(timing),
      status: "Pending",
    });

        await newVideocallRequest.save();

        const videocallJoinUrl = `${WEB_URL}/joinvideocall/${email}/${requestId}`;

        const logoUrl = `${WEB_URL}/get-logo-from-drive/Ankitpicture.png`;

       await sendMail(email, 'Information regarding join videocall', videocallReqmail(email, requesterFirstName, requesterLastName, timing, videocallJoinUrl,logoUrl))

    res
      .status(201)
      .json({ message: "Videocall request created successfully", requestId });
  } catch (error) {
    console.error("Error creating videocall request:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

function videocallReqmail(
  email,
  requesterFirstName,
  requesterLastName,
  timing,
  videocallJoinUrl,
  logoUrl,
  adminEmail
) {
  function formatDate(date) {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    const formattedDate = new Date(date).toLocaleDateString("en-GB", options);
    return formattedDate.replace(/\//g, "-"); // Replace '/' with '-' for DD-MM-YYYY format
  }

  function formatTime(date) {
    const options = { hour: "2-digit", minute: "2-digit" };
    const formattedTime = new Date(date).toLocaleTimeString("en-GB", options);
    return formattedTime.replace(":", "."); // Replace ':' with '.' for DD.MM format
  }

  const formattedDate = formatDate(timing);
  const formattedTime = formatTime(timing);
  const dateAndTime = `${formattedDate} at ${formattedTime}`;

  return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Videocall Request Information</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f2f2f2;
                    margin: 0;
                    padding: 20px;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #fff;
                    padding: 20px;
                    border-radius: 5px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .logo {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .logo img {
                    height: 250px; 
                    width: 250px;
                    border-radius: 50%; 
                }
                .email-info {
                    background-color: #f9f9f9;
                    padding: 15px;
                    border-radius: 5px;
                    margin-bottom: 20px;
                }
                .email-info p {
                    margin: 5px 0;
                }
                .join-link {
                    text-align: center;
                    margin-top: 20px;
                }
                .footer {
                    margin-top: 20px;
                    text-align: center;
                }
                .footer ul {
                    list-style-type: none;
                    padding: 0;
                    margin: 10px 0;
                }
                .footer ul li {
                    margin-bottom: 5px;
                }
                .footer ul li a {
                    color: #007bff;
                    text-decoration: none;
                }
                .footer ul li a:hover {
                    text-decoration: underline;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Videocall Request Information</h1>
                </div>
                <div class="logo">
                    <img src="${logoUrl}" alt="Logo">
                </div>
                <div class="email-info">
                    <p>Hello ${
                      requesterFirstName ? requesterFirstName : email
                    } ${requesterLastName || ""},</p>
                    <p>You have requested to join a videocall scheduled for ${dateAndTime}.</p>
                    <p>Please use the following link to join the videocall:</p>
                    <p><a href="${videocallJoinUrl}">Join Call</a></p>
                    <p>If you encounter any issues, copy and paste the following URL into your browser:</p>
                    <p><a href="${videocallJoinUrl}">${videocallJoinUrl}</a></p>
                </div>
                <div class="footer">
                    <ul>
                        <li>This is an automated email, please do not reply.</li>
                        <li>If you encounter any issues, please contact support at <a href="${WEB_URL}/contact">Contact</a> and email ${adminEmail}.</li>
                        <li>For more information, visit our website at <a href="${WEB_URL}">${WEB_URL}</a>.</li>
                        <li>You can manage your videocall settings and preferences by logging into your account.</li>
                    </ul>
                </div>
            </div>
        </body>
        </html>
    `;
}

app.post("/reschedule/videoCall", isUserAuthenticated, async (req, res) => {
  try {
    const { rescheduleDateTime, requestId, userEmail } = req.body;

    if (!requestId || !userEmail) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    const videoCallData = await VideocallRequest.findOne({
      $or: [{ requestId: requestId }, { userEmail: userEmail }],
    });

    if (!videoCallData) {
      return res.status(404).json({ message: "Video call request not found" });
    }

    const newRescheduleDateTimeUTC = moment(rescheduleDateTime)
      .add(5, "hours")
      .add(30, "minutes")
      .utc()
      .format("YYYY-MM-DDTHH:mm:ss[Z]");

    videoCallData.rescheduledTiming = newRescheduleDateTimeUTC;

    await videoCallData.save();
    const videocallJoinUrl = `${WEB_URL}/joinvideocall/${videoCallData.userEmail}/${videoCallData.requestId}`;

    const logoUrl = `${WEB_URL}/get-logo-from-drive/Ankitpicture.png`;

    await sendMail(
      videoCallData.userEmail,
      "Regarding Reschedule of the Video Call",
      emailTextForReschedule(
        videoCallData.userEmail,
        videoCallData.requesterFirstName,
        videoCallData.requesterLastName,
        videoCallData.rescheduledTiming,
        videocallJoinUrl,
        logoUrl
      )
    );
    res
      .status(200)
      .json({
        message: "Reschedule successful",
        rescheduleDateTime: newRescheduleDateTimeUTC,
      });
  } catch (error) {
    console.error("Error processing reschedule request:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

function emailTextForReschedule(
  userEmail,
  requesterFirstName,
  requesterLastName,
  rescheduledTiming,
  videocallJoinUrl,
  logoUrl
) {
  const websiteUrl = `${WEB_URL}`;
  const loginUrl = `${WEB_URL}/login`;

  function formatDate(rescheduledTiming) {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    const formattedDate = new Date(rescheduledTiming).toLocaleDateString(
      "en-GB",
      options
    );
    return formattedDate.replace(/\//g, "-"); // Replace '/' with '-' for DD-MM-YYYY format
  }

  function formatTime(rescheduledTiming) {
    const options = { hour: "2-digit", minute: "2-digit" };
    const formattedTime = new Date(rescheduledTiming).toLocaleTimeString(
      "en-GB",
      options
    );
    return formattedTime.replace(":", "."); // Replace ':' with '.' for DD.MM format
  }

  const formattedDate = formatDate(rescheduledTiming);
  const formattedTime = formatTime(rescheduledTiming);
  const dateAndTime = `${formattedDate} at ${formattedTime}`;

  return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Videocall Reschedule Information</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f2f2f2;
                    margin: 0;
                    padding: 20px;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #fff;
                    padding: 20px;
                    border-radius: 5px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                h1 {
                    color: #333;
                    text-align: center;
                    margin-bottom: 20px;
                }
                p {
                    color: #666;
                    line-height: 1.6;
                    margin-bottom: 10px;
                }
                a {
                    color: #007bff;
                    text-decoration: none;
                }
                a:hover {
                    text-decoration: underline;
                }
                .logo {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .logo img {
                    width: 200px;
                    height: 200px;
                    border-radius: 50%;
                }
                .info-section {
                    margin-top: 20px;
                    padding: 10px;
                    background-color: #f9f9f9;
                    border-radius: 5px;
                }
                .info-section p {
                    margin: 5px 0;
                }
                .footer {
                    margin-top: 20px;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">
                    <img src="${logoUrl}" alt="Logo">
                </div>
                <h1>Videocall Reschedule Information</h1>
                <p>Hello ${
                  requesterFirstName ? requesterFirstName : userEmail
                } ${requesterLastName || ""},</p>
                <p>Your videocall has been successfully rescheduled.</p>
                <p>New Timing: ${dateAndTime}</p>
                <p>Please use the following link to join the videocall:</p>
                <a href="${videocallJoinUrl}">${videocallJoinUrl}</a>
                <div class="info-section">
                    <p>For more information and updates, please visit our website:</p>
                    <a href="${websiteUrl}">${websiteUrl}</a>
                    <p>To access your account and manage videocall preferences, please log in here:</p>
                    <a href="${loginUrl}">${loginUrl}</a>
                </div>
                <div class="footer">
                    <p>Thank you!</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

app.get("/adminjoinvideocall", (req, res) => {
  res.render("./AdminFiles/admin-video-call",{roomId : "12345"});
});
app.get("/userjoinvideocall", (req, res) => {
  res.render("./videocall/userVideoCallPage",{roomId : "12345"});
});

// app.get('/joinvideocall/:userEmail/:requestId', async (req, res) => {
//     try {
//         const { userEmail, requestId } = req.params;
//         const videoCallCss = ` body {
//             font-family: Arial, sans-serif;
//             background-color: #f2f2f2;
//             margin: 0;
//             padding: 20px;
//             text-align: center;
//         }
//         .container {
//             max-width: 600px;
//             margin: 20px auto;
//             background-color: #fff;
//             padding: 20px;
//             border-radius: 5px;
//             box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
//         }
//         h1 {
//             color: #333;
//             margin-bottom: 20px;
//         }
//         p {
//             color: #666;
//             line-height: 1.6;
//             margin-bottom: 10px;
//         }`
//         const userData = await Users.findOne({ email: userEmail });

//         if (!userData || !userData.verifiedByGoogle || !userData.isActive) {

//             return res.status(400).send(`
//                 <html>
//                 <head>
//                     <style>
//                        ${videoCallCss}
//                     </style>
//                 </head>
//                 <body>
//                     <div class="container">
//                         <h1>Error 400: Bad Request</h1>
//                         <p>Your request is invalid. Please <a href="${WEB_URL}/login">login</a> and verify yourself by Google and make sure your account is Active.</p>
//                     </div>
//                 </body>
//                 </html>
//             `);
//         }

//         // Find the video call request based on userEmail or requestId
//         const videoData = await VideocallRequest.findOne({ $or: [{ userEmail }, { requestId }] });
//         if (!videoData) {
//             return res.status(404).send(`
//                 <html>
//                 <head>
//                     <style>
//                     ${videoCallCss}
//                     </style>
//                 </head>
//                 <body>
//                     <div class="container">
//                         <h1>Error 404: Not Found</h1>
//                         <p>Video call request not found.</p>
//                     </div>
//                 </body>
//                 </html>
//             `);
//         }

//         req.session.userEmail = userEmail;
//         req.session.requestId = requestId;
//         res.render('./AdminFiles/admin-video-call');
//     } catch (error) {
//         console.error('Error joining video call:', error);
//         res.status(500).send(`
//             <html>
//             <head>
//                 <style>
//                 ${videoCallCss}
//                 </style>
//             </head>
//             <body>
//                 <div class="container">
//                     <h1>Error 500: Internal Server Error</h1>
//                     <p>An internal server error occurred.</p>
//                 </div>
//             </body>
//             </html>
//         `);
//     }
// });

app.get("/getJoinVideoCallInfo", async (req, res) => {
  try {
    const userEmail = req.session.userEmail;
    const requestId = req.session.requestId;

    if (!userEmail || !requestId) {
      return res
        .status(400)
        .json({ message: "User email or request ID not found in session" });
    }

    res.status(200).json({ userEmail, requestId });
  } catch (error) {
    console.error("Error fetching video call info:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

import { Server as SocketIOServer } from "socket.io";
// import { ExpressPeerServer } from "peer";
// import cors from "cors";
const server = http.createServer(app);
const io = new SocketIOServer(server);
// const peerServer = ExpressPeerServer(server, { debug: true });

// app.use(cors());
// app.use("/peerjs", peerServer);

// const peers = new Map();
// io.on('connection', (socket) => {
//   console.log("A user connected:", socket.id);

//   socket.on("joinRoom", (roomName) => {
//     socket.join(roomName);
//     console.log(`User ${socket.id} joined room: ${roomName}`);
//   });

//   socket.on("signal", (data) => {
//     const { roomName, signalData } = data;
//     socket.to(roomName).emit("signal", signalData);
//   });

//   // Handle customMessage event
//   socket.on("customMessage", (message) => {
//     console.log(`Received custom message from user ${socket.id}:`, message);
//   });

//   // Handle disconnect event
//   socket.on("disconnect", () => {
//     console.log("A user disconnected:", socket.id);
//   });
// });

io.on('connection', socket => {
    // When someone attempts to join the room
    socket.on('joinRoom', (roomId, userId) => {
        socket.join(roomId)  // Join the room
        socket.broadcast.emit('user-connected', userId) // Tell everyone else in the room that we joined
        
        // Communicate the disconnection
        socket.on('disconnect', () => {
            socket.broadcast.emit('user-disconnected', userId)
        })
    })
})
const deleteAccountsTask = schedule.scheduleJob("0 0 * * *", async () => {
  try {
    const accountsToDelete = await Users.find({
      deleteRequest: true,
      deleteRequestDate: {
        $lt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
    });

    // Delete accounts
    for (const account of accountsToDelete) {
      await Users.findByIdAndDelete(account._id);
    }

    console.log(`${accountsToDelete.length} accounts deleted.`);
  } catch (error) {
    console.error("Error deleting accounts:", error);
  }
});

const deleteOtpTask = schedule.scheduleJob("0 0 * * * *", async () => {
  try {
    const otpToDelete = await otpData.find({
      "OtpData.date": { $lt: new Date(Date.now() - 15 * 60 * 1000) },
    });
    console.log(otpToDelete);
    for (const otp of otpToDelete) {
      await otpData.findByIdAndDelete(otp._id);
    }

    console.log(`${otpToDelete.length} OTP documents deleted.`);
  } catch (error) {
    console.error("Error deleting OTP documents:", error);
  }
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

// var usersf = false
// if (!usersf) {
//     (async function () {
//         const url = await ngrok.connect({
//             authtoken: '2U5nti4yPy3pbhFYgj0IaW4XDwy_6FcWKnmFJtiyhU2FYz2ki',
//             addr: 3000,
//             region: 'us'
//         });
//         console.log('Ngrok URL:', url);
//     })();
//     usersf = true;
// }

export {
  isAuthenticated,
  BlogsModel,
  testimonial,
  Gallery,
  JWT_SECRET,
  jwt,
  Contact,
  userProfile,
  bcrypt,
  otpData,
  Users,
  notification,
  Newsletter,
  PrivacySecurity,
  transporter,
  twilioPhone,
  accountSid,
  authToken,
  adminEmail,
  homeInfoSettings,
  Secret_Info_Setting,
  driveFile,
  VideocallRequest,
  WEB_URL,
};



export default app;


