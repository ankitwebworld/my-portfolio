
import {
    Contact, BlogsModel, testimonial, Gallery, JWT_SECRET, jwt, userProfile,
    otpData, Users, notification, Newsletter, PrivacySecurity, transporter, adminEmail,
    twilioPhone, homeInfoSettings, Secret_Info_Setting,driveFile,VideocallRequest,WEB_URL
} from "../../index.js";
// import KEYFILEPATH from ''
import express from 'express';
import bcrypt from "bcryptjs";
import crypto from "crypto";
import twilio from "twilio";
import multer from "multer"; 
import session from 'express-session';
import memorystore from 'memorystore';
import {google} from 'googleapis';
import stream from 'stream';
import cookieParser from "cookie-parser";
const router = express.Router();
import helmet from "helmet";
const storage = multer.memoryStorage();
import { Id_for_Icones_logo } from './../SECRET/Auth-data.js';
import moment from "moment-timezone";
import fetch from 'node-fetch';
const MemoryStore = memorystore(session);
const upload = multer({ storage: storage, limits: { fileSize: 1024 * 1024 } });

import { accountSid, authToken} from "../SECRET/Auth-data.js"
const messageClient = new twilio(accountSid, authToken);

const uploadforDrive = multer();


router.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            frameSrc: ["'self'", "https://www.google.com","https://drive.google.com"],
            imgSrc: ["'self'", "https://drive.google.com", "https://developers.google.com"],
            scriptSrc: ["'self'", "https://cdn.socket.io","https://cdnjs.cloudflare.com"],
        },
    })
); 
const cspConfig = {
    directives: {
        defaultSrc: ["'self'"],
        frameSrc: ["'self'", "https://www.google.com","https://drive.google.com"],
        connectSrc: ["'self'", "https://accounts.google.com"],
        imgSrc: ["'self'", "https://drive.google.com", "https://developers.google.com"],
        scriptSrc: ["'self'", "https://cdn.socket.io","https://cdnjs.cloudflare.com"],
    },
};
router.use(helmet.contentSecurityPolicy(cspConfig));

import { serviceAccount } from './../SECRET/Auth-data.js';

const SCOPES = ["https://www.googleapis.com/auth/drive"];
const parsedData = JSON.parse(JSON.stringify(serviceAccount));
// console.log(parsedData)
const auth = new google.auth.GoogleAuth({ credentials: serviceAccount, scopes: SCOPES });
const drive = google.drive({ version: 'v3', auth });


router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(cookieParser());



async function pushNotification(userId, message, senderId) {
    try {
        const user = await Users.findById(userId);

        if (!user) {
            console.error('User not found');
            return;
        }

        const notification = {
            message: message,
            sender: senderId,
        };

        user.notifications.push(notification);
        await user.save();
        console.log('Notification pushed successfully');
    } catch (error) {
        console.error('Error pushing notification:', error);
    }
}

async function sendMail(email, subject, emailText) {
    const mailOptions = {
        from: adminEmail,
        to: email,
        subject,
        html: emailText,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return 'Email sent successfully';
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Error sending email');
    }
}

const isAuthenticated = (req, res, next) => {
    const token = req.cookies.adminToken;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: Missing token, Please login again' });
    }
    try {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error(error)
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });

    }
};

const generateOTP = async (userId, otp) => {
    try {

        const message = await messageClient.messages.create({
            body: `Your OTP is: ${otp}. It is valid for 10 minutes.`,
            from: twilioPhone,
            to: userId,
            channel: "sms",
        });

        console.log(`OTP sent successfully to ${userId}: ${message.sid}`);
        // console.log(`OTP sent successfully to ${+916261888524}: ${message.sid}`);
        return message.sid;
    } catch (error) {
        console.error('Error sending OTP:', error);
        throw error;
    }
};

router.get("/AdminHomePage", isAuthenticated, async (req, res) => {
    try {
        res.render("./AdminFiles/adminHomePage");
    } catch (error) {
        res.send("Internal server Error");
        console.error(error);
    }
});

router.get("/getContactInfoPage", isAuthenticated, async (req, res) => {
    try {
        res.render("./AdminFiles/contactShow");
    } catch (error) {
        res.send("Internal server Error");
        console.error(error);
    }
});

router.get("/getContactInfo", isAuthenticated, async (req, res) => {
    try {
        const data = await Contact.find();
        if (!data) {
            return res.status(404).json({ message: "Data is not available." });
        }
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Internal server Error" });
        console.error(error);
    }
});

router.post("/adminRipliedUser", isAuthenticated, async (req, res) => {
    try {
        const { ReferenceId, message, respondBy, emailAddress, phoneNo } = req.body;

        if (!ReferenceId || !message || !respondBy || !emailAddress || !phoneNo) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const data = await Contact.findOne({ ReferenceId });

        if (!data) {
            return res.status(404).json({ message: "Contact not found" });
        }

        const info = {
            message,
            respondBy
        };

        data.responses.push(info);
        await data.save();

        res.render("./AdminFiles/success");

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/AdminAbout", (req, res) => {
    try {
        res.redirect("/about");
    } catch (error) {
        res.send(error);
    }
});

router.get("/AdminServices", (req, res) => {
    try {
        res.redirect("/education/services");
    } catch (error) {
        res.send(error);
    }
});

router.get("/adminDeshBoard", isAuthenticated, (req, res) => {
    try {
        res.render("./AdminFiles/adminDeshBoard");
    } catch (error) {
        res.send(error);
    }
});

router.get("/adminProfile", isAuthenticated, (req, res) => {
    try {
        res.render("./AdminFiles/adminProfilePage");
    } catch (error) {
        res.send(error);
    }
});

router.get("/getAdminInfo", isAuthenticated, async (req, res) => {
    try {
        const data = await userProfile.find();
        if (!data) {
            return res.status(404).json({ message: "No data available" });
        }
        // console.log(data)
        res.status(200).json(data); // changed status code to 200
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/sendOtp", isAuthenticated, async (req, res) => {
    try {
        const { userId, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const userData = await userProfile.findOne({ userId });

        if (!userData) {
            return res.status(404).json({ message: "User Not Found" });
        }

        let otpUserData = await otpData.findOne({ userId });

        const randomBytes = crypto.randomBytes(3);
        const otp = parseInt(randomBytes.toString('hex'), 16) % 1000000;
        const formattedOTP = otp.toString().padStart(6, '0');

        if (!otpUserData) {
            otpUserData = await otpData.create({
                userId,
                changingPassword: hashedPassword,
                purpose: "Changing Password",
                OtpData: [{
                    OTP: formattedOTP, // Replace with the actual OTP
                }],
            });
            otpUserData.save();
            await generateOTP("+91" + userId, formattedOTP);
            res.status(302).json({ message: "OTP sent" });
        } else {

            otpUserData.changingPassword = hashedPassword;
            otpUserData.purpose = "Changing Password";
            otpUserData.OtpData = [{
                OTP: formattedOTP, // Replace with the actual OTP
            }];

            await generateOTP("+91" + userId, formattedOTP); // Replace with the actual OTP
            await otpUserData.save();

            res.status(302).json({ message: "OTP sent" });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/verifyOtp", isAuthenticated, async (req, res) => {
    try {
        const otp = req.body.otp;
        const token = req.cookies.userToken;

        const decodedToken = jwt.verify(token, JWT_SECRET);

        const userData = await userProfile.findOne({ userId: decodedToken.userId });
        const otpUserData = await otpData.findOne({ userId: userData.userId });

        if (!userData || !otpUserData) {
            return res.status(404).json({ message: "User not found" });
        }

        const getotp = otpUserData.OtpData.find((element) => element.OTP == otp && new Date() < element.expirationDate);

        if (getotp) {
            userData.password = otpUserData.changingPassword;
            await userData.save();

            // Delete the otpData after successful verification
            await otpData.findOneAndDelete({ userId: userData.userId });

            res.status(302).json({ message: "Password updated" });
        } else {
            res.status(404).json({ message: "OTP is invalid or expired" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/deleteContactInfo", async (req, res) => {
    try {
        const ReferenceId = req.body.referenceId;
        const DeletedData = await Contact.findOneAndDelete({ ReferenceId });
        if (DeletedData) {
            res.status(200).json({ message: `${ReferenceId} deleted successfully` });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/Check_via_Token_Or_Gmail", isAuthenticated, async (req, res) => {
    try {
        res.render("./AdminFiles/findContactInfo");
    } catch (error) {
        console.error(error)
        res.status(500).send(error)
    }
});

const reqURL = ['/getContactInfoByReferenceId', '/getContactInfoByEmailAddress', '/getContactInfoByPhoneNo', '/getContactInfoByDate', '/getContactInfoByName'];

router.post(reqURL, isAuthenticated, async (req, res) => {
    try {
        const { ReferenceId, emailAddress, phoneNo, date, name } = req.body;

        if (ReferenceId == '' && emailAddress == '' && phoneNo == '' && date == '' && name == '') {
            return res.status(422).json({ message: "Please enter value" });
        }

        const getData = async (key, value) => {
            const query = { [key]: value };
            const userData = await Contact.findOne(query);

            if (!userData) {
                return res.status(404).json({ message: "No information available" });
            }

            return res.status(200).json(userData);
        }

        if (ReferenceId != null) {
            await getData("ReferenceId", ReferenceId);
        }
        if (emailAddress != null) {
            await getData("emailAddress", emailAddress);
        }
        if (phoneNo != null) {
            await getData("phoneNo", phoneNo);
        }
        if (date != null) {
            await getData("date", date);
        }
        if (name != null) {
            await getData("name", name);
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get('/deleteBlogs', isAuthenticated, async (req, res) => {
    try {
        const blogsData = await BlogsModel.find();
        if (!blogsData) {
            return res.status(400).json({ message: "Blogs are not available" });
        }
        res.status(200).json({ data: blogsData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});


router.post('/deleteMyBlog/:blog_id', isAuthenticated, async (req, res) => {
    try {
        const id = req.body._id;
        // emplementing logic
        const blogsData = await BlogsModel.findOneAndDelete({ _id: id });
        if (blogsData) {
            await drive.files.delete({ fileId: blogsData.fileId });
            res.status(200).json({ message: `Image with ID ${id} deleted successfully` });
        } else {
            res.status(404).json({ error: 'Image not found in the database' });
        }
        
        console.log(id)
        res.status(200).json({ message: "blog deleted successfully" });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get('/updateBlogs', isAuthenticated, async (req, res) => {
    try {
        const blogsData = await BlogsModel.find();
        if (!blogsData) {
            return res.status(400).json({ message: "Blogs are not available" });
        }
        res.status(200).json({ data: blogsData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post('/updateMyBlog/:blog_id', isAuthenticated, async (req, res) => {
    try {
        const id = req.body._id;
        // emplementing logic

        const data = await BlogsModel.findOne({ _id: id });
        if (!data) {
            return res.status(400).json({ message: "No blogs are available" });
        }

        res.status(200).json({ message: "blog updated successfully", data });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post('/updateInformationRequest', isAuthenticated, upload.single('image'), async (req, res) => {
    try {
        const id = req.body.keyId;
        const title = req.body.title.trim() !== '' ? req.body.title.trim() : undefined;
        const content = req.body.content.trim() !== '' ? req.body.content.trim() : undefined;
        const category = req.body.category.trim() !== '' ? req.body.category.trim() : undefined;
        const date = req.body.date.trim() !== '' ? req.body.date.trim() : undefined;
        const location = req.body.location.trim() !== '' ? req.body.location.trim() : undefined;
        const photos = req.body.photos.trim() !== '' ? req.body.photos.trim() : undefined;
        const hashtags = req.body.hashtags.trim() !== '' ? req.body.hashtags.trim() : undefined;
        const codes = req.body.codes.trim() !== '' ? req.body.codes.trim() : undefined;
        const imageBuffer = req.file ? req.file.buffer : undefined;

        const blog = await BlogsModel.findOne({ _id: id });

        if (!blog) {
            return res.status(404).json({ message: "No blog found with the provided ID" });
        }

        blog.title = title !== undefined ? title : blog.title;
        blog.content = content !== undefined ? content : blog.content;
        blog.category = category !== undefined ? category : blog.category;
        blog.date = date !== undefined ? date : blog.date;
        blog.location = location !== undefined ? location : blog.location;
        blog.photos = photos !== undefined ? photos : blog.photos;
        blog.hashtags = hashtags !== undefined ? hashtags : blog.hashtags;
        blog.codes = codes !== undefined ? codes : blog.codes;
        blog.image = imageBuffer !== undefined ? imageBuffer : blog.image;

        await blog.save();

        res.status(200).json({ message: "Blog updated successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get('/testimonials', isAuthenticated, async (req, res) => {
    try {
        res.render('./AdminFiles/TestimonialsPage')
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal sever error" });
    }
});

router.post('/testimonialsInfo', isAuthenticated, async (req, res) => {
    try {
        const { clientName, clientTitle, testimonialContent, ...replybyAnkit } = req.body;

        res.status(200).json({ message: 'Form data received and processed successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/valid/Testimonials', isAuthenticated, async (req, res) => {
    try {
        console.log("hiiii")
        const data = await testimonial.find();

        if (!data) {

            return res.status(404).json({ message: "Testimonials are not available" });
        }
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/delete/Testimonials', isAuthenticated, async (req, res) => {
    try {
        const data = await testimonial.findOneAndDelete({ _id: req.body.testimonialId });

        if (data) {
            res.status(200).json({ message: "Testimonial is deleted" });
        } else {
            res.status(404).json({ message: "Testimonial not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/update/Testimonials', isAuthenticated, async (req, res) => {
    try {
        const { testimonialId, clientName, clientTitle, testimonialContent } = req.body;

        const existingTestimonial = await testimonial.findOne({ _id: testimonialId });

        if (existingTestimonial) {
            existingTestimonial.clientName = clientName || existingTestimonial.clientName;
            existingTestimonial.clientTitle = clientTitle || existingTestimonial.clientTitle;
            existingTestimonial.testimonialContent = testimonialContent || existingTestimonial.testimonialContent;

            const updatedTestimonial = await existingTestimonial.save();
            const Testimonial = await testimonial.find();
            res.status(200).json({ message: "Testimonial is updated", updatedData: Testimonial });
        } else {
            res.status(404).json({ message: "Testimonial not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/seeUsers', isAuthenticated, (req, res) => {
    try {
        res.render('./AdminFiles/seeUsersPage');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" })
    }
});

router.get('/seeUserList', isAuthenticated, async (req, res) => {
    try {
        const userData = await Users.find();

        if (userData.length === 0) {
            return res.status(404).json({ status: 404, message: "User data not found" });
        }

        res.status(200).json(userData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: "Internal Server Error", error: error.message });
    }
});

router.get('/addNotifications', isAuthenticated, async (req, res) => {
    try {
        res.render("./AdminFiles/notificationPage");
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "internal server error" });
    }
});

router.post('/addNotifications', isAuthenticated, async (req, res) => {
    try {
        const { sender, action, target, message, featureImage, createdAt, read } = req.body;
        console.log(sender, action, target, message, featureImage, createdAt, read)
        const newNotification = new notification({
            sender: {
                username: sender.username,
                profilePicture: sender.profilePicture,
            },
            action: action,
            target: target,
            message: message,
            featureImage: featureImage,
            createdAt: new Date(),
            read: false,
        });

        await newNotification.save();
        console.log("submii")
        res.status(200).json({ message: "notification added" });
    } catch (error) {
        console.error('Error adding notification:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/Privacy-and-Security', isAuthenticated, async (req, res) => {
    try {
        res.render("./AdminFiles/Privacy_and_Security_Form");
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "internal server error" });
    }
});

router.post('/submit-privacy-security-form', isAuthenticated, async (req, res) => {
    try {
        // Fetch the admin user profile
        const admin = await userProfile.findOne({ userId: req.user.userId }).select('-password').exec();

        // Extract data from the request body
        const { title, mainText, additionalInfo, videos, relatedLinks, frequentlyAskedQuestions, importantNotes, policies } = req.body;
        const policy = {
            privacyPolicy: "Our privacy policy outlines how we collect, use, disclose, and protect your personal information. It explains the types of data we collect, the purposes for which we use it, and your rights regarding your information. We are committed to transparency and ensuring that your privacy rights are respected at all times.",

            dataRetentionPolicy: "Our data retention policy defines the length of time we retain different types of data collected from users. We adhere to legal requirements and industry best practices to determine the appropriate retention periods for various data categories. This policy ensures that we only retain data for as long as necessary to fulfill the purposes for which it was collected.",

            cookiePolicy: "Our cookie policy explains how we use cookies and similar tracking technologies on our website or app. It provides details about the types of cookies we use, their purposes, and how you can manage your cookie preferences. We respect your choices regarding cookies and offer options for opting in or out of non-essential cookies.",

            securityPolicy: "Our security policy outlines the measures we have implemented to protect your data from unauthorized access, disclosure, alteration, or destruction. It covers aspects such as encryption, access controls, security monitoring, incident response, and employee training. We are committed to maintaining a secure environment for your information.",

            userAgreement: "Our user agreement or terms of service governs your use of our platform and the services we provide. It outlines your rights and responsibilities as a user, as well as our terms of use, limitations of liability, dispute resolution procedures, and other important legal terms. By using our platform, you agree to abide by these terms and conditions.",

            acceptableUsePolicy: "Our acceptable use policy sets forth the rules and guidelines for acceptable behavior and use of our platform. It defines prohibited activities, such as spamming, hacking, copyright infringement, and other forms of abuse. We enforce this policy to ensure a safe and respectful environment for all users.",

            dataProtectionPolicy: "We are committed to complying with applicable data protection laws and regulations, such as the General Data Protection Regulation (GDPR) in the European Union. Our data protection and compliance policy outlines our obligations regarding data processing, user rights, data transfers, and compliance mechanisms.",

            thirdPartyServicesPolicy: "Our third-party services policy explains how we interact with third-party service providers and partners, including how we share data with them and what measures we take to ensure their compliance with our privacy and security standards. We carefully vet and select third-party providers that meet our criteria for data protection and reliability."
        }


        // Create the data object
        const data = {
            title,
            content: {
                mainText,
                additionalInfo,
                videos: videos ? videos : [],
                relatedLinks,
                frequentlyAskedQuestions,
                importantNotes,
                policies: policy
            },
            author: admin._id,
            created_at: req.body.created_at || Date.now(),
            updated_at: req.body.updated_at || Date.now()
        };

        // Save the new PrivacySecurity document
        const newPrivacySecurity = new PrivacySecurity(data);
        await newPrivacySecurity.save();

        // Respond with success message
        res.status(200).json({ message: 'Privacy and Security data added successfully' });
    } catch (error) {
        // Handle errors
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/admin-forgot-password', async (req, res) => {
    try {
        res.render('./UserLogin/admin-forgot-password')
    } catch (error) {
        console.error('Error handling password reset request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/admin-forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const randomBytes = crypto.randomBytes(3);
        const otp = parseInt(randomBytes.toString('hex'), 16) % 1000000;
        const formattedOTP = otp.toString().padStart(6, '0');

        const userProfileData = await userProfile.findOne({ email: email.trim() }).select('-password').exec();
        if (!userProfileData) {
            return res.status(404).json({ message: 'Email does not match any records.' });
        }

        req.session.otp = formattedOTP;
        req.session.email = email;

        await sendMail(email, "Regarding password reset", resetMail(userProfileData.Fname ? userProfileData.Fname : '', userProfileData.Lname ? userProfileData.Lname : '', formattedOTP));

        res.status(202).json({ message: 'Password reset instructions have been sent to your email.' });
    } catch (error) {
        console.error('Error handling password reset request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/verify-admin-forgot-password-otp', async (req, res) => {
    try {
        const emailotp = req.body.otp;

        const sessionOtp = req.session.otp;
        const email = req.session.email;

        if (!email || !sessionOtp) {
            return res.status(400).json({ message: 'Session data not found.', success: false });
        }

        if (emailotp !== sessionOtp) {
            return res.status(400).json({ message: 'Invalid OTP. Please try again.', success: false });
        }

        delete req.session.otp;

        const userProfileData = await userProfile.findOne({ email });

        if (!userProfileData) {
            return res.status(404).json({ message: 'User profile not found.', success: false });
        }

        req.session.ableToChangePassword = true;
        res.status(200).json({ message: 'OTP verification successful.', success: true });

    } catch (error) {
        console.error('Error handling OTP verification:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/change-admin-password-reset', async (req, res) => {
    try {
        const password = req.body.password;
        const email = req.session.email;

        if (!email) {
            return res.status(400).json({ message: 'Session data not found.', success: false });
        }

        delete req.session.email;

        const userProfileData = await userProfile.findOne({ email });

        if (!userProfileData) {
            return res.status(404).json({ message: 'User profile not found.', success: false });
        }

        if (!req.session.ableToChangePassword) {
            return res.status(403).json({ message: 'User is not authorized to change password at this time.', success: false });
        }

        userProfileData.password = await bcrypt.hash(password, 10);
        await userProfileData.save();

        const token = jwt.sign({ userId: userProfileData.userId }, JWT_SECRET, { expiresIn: '1h' });

        res.cookie("adminToken", token, {
            expires: new Date(Date.now() + 9000000),
            httpOnly: true,
            secure: true,
            sameSite: true
        });
        res.status(202).json({ message: 'Password changed successfully.', success: true });

    } catch (error) {
        console.error('Error handling password change:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// router.get("", isAuthenticated, async (req, res) => {
//     try {
//         const userId = req.params.userId;
//         const emailId = req.params.emailId;
//         const page = req.params.page;
//         console.log(page)
//         const user = await Users.findOne({ $or: [{ userId: userId }, { email: emailId }] }).select('-password').exec();

//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         if(page)
//         {
//             return res.render('.')
//         }
//         //  res.status(200).json({ user });
//     } catch (error) {
//         console.error('Error fetching user details:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

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



router.post('/getUserInfo', isAuthenticated, async (req, res) => {
    try {
        const { userId, emailId } = req.body;
        const user = await Users.findOne({ $or: [{ userId }, { email: emailId }] }).select('-password').exec();
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/userUpdateInfo', isAuthenticated, async (req, res) => {
    try {
        const { userId, emailId } = req.body;
        const user = await Users.findOne({ $or: [{ userId }, { email: emailId }] }).select('-password').exec();

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Update basic user information
        if (req.body.Fname && req.body.Lname) {
            user.Fname = req.body.Fname;
            user.Lname = req.body.Lname;
            console.log(req.body.Fname)
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
            if (typeof req.body.interests === 'string') {
                user.userDetails.interests = req.body.interests.split(',').map(interest => interest.trim());
            } else if (Array.isArray(req.body.interests)) {
                user.userDetails.interests = req.body.interests;
            } else {
                return res.status(400).json({ error: "Invalid interests format" });
            }
        }
        //Add institutions
        if (req.body.institution !== undefined) {
            if (req.body.degree !== undefined && req.body.graduationYear !== undefined) {
                const data = {
                    institution: req.body.institution,
                    degree: req.body.degree,
                    graduationYear: req.body.graduationYear,
                };
                user.userDetails.education.push(data);
            }
            else {
                return res.status(400).json({ error: "Invalid education format" });
            }
        }

        //update skillSet

        if (req.body.skillSet !== undefined) {
            if (typeof req.body.skillSet === 'string') {
                user.userDetails.skillSet = req.body.skillSet.split(',').map(skill => skill.trim());
            } else if (Array.isArray(req.body.skillSet)) {
                user.userDetails.skillSet = req.body.skillSet;
            } else {
                return res.status(400).json({ error: "Invalid skill set format" });
            }
        }

        //add work Experience 
        if (req.body.company !== undefined) {
            if (req.body.position !== undefined && req.body.startDate !== undefined && req.body.endDate !== undefined) {
                const data = {
                    company: req.body.company,
                    position: req.body.position,
                    startDate: req.body.startDate,
                    endDate: req.body.endDate,
                };
                user.userDetails.workExperience.push(data);
            } else {
                return res.status(400).json({ error: "Invalid work experience format" });
            }
        }

        if (req.body.certifications !== undefined) {
            if (typeof req.body.certifications === 'string') {
                user.userDetails.certifications = req.body.certifications.split(',').map(certification => certification.trim());
            } else if (Array.isArray(req.body.certifications)) {
                user.userDetails.certifications = req.body.certifications;
            } else {
                return res.status(400).json({ error: "Invalid certifications format" });
            }
        }

        // Update projects
        if (req.body.projectName !== undefined) {
            if (req.body.description !== undefined && req.body.startDate !== undefined && req.body.endDate !== undefined) {
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
            if (typeof req.body.languages === 'string') {
                user.userDetails.languages = req.body.languages.split(',').map(language => language.trim());
            } else if (Array.isArray(req.body.languages)) {
                user.userDetails.languages = req.body.languages;
            } else {
                return res.status(400).json({ error: "Invalid languages format" });
            }
        }
        // add hobbies
        if (req.body.hobbies !== undefined) {
            if (typeof req.body.hobbies === 'string') {
                user.userDetails.hobbies = req.body.hobbies.split(',').map(hobby => hobby.trim());
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
        console.error('Error updating user information:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.post('/userUpdateEducation', isAuthenticated, async (req, res) => {
    try {
        const { institution, _id, degree, graduationYear } = req.body;

        const { userId, emailId } = req.body;
        const user = await Users.findOne({ $or: [{ userId }, { email: emailId }] }).select('-password').exec();

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }


        const educationRecord = user.userDetails.education.find(edu => edu._id.toString() === _id);

        if (!educationRecord) {
            return res.status(404).json({ error: "Education record not found" });
        }

        educationRecord.institution = institution;
        educationRecord.degree = degree;
        educationRecord.graduationYear = graduationYear;

        await user.save();

        return res.status(200).json({ message: "Education record updated successfully" });
    } catch (error) {
        console.error('Error updating education record:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
});


router.post('/deleteEducation', isAuthenticated, async (req, res) => {
    try {
        const { _id } = req.body;
        const { userId, emailId } = req.body;

        const user = await Users.findOne({ $or: [{ userId }, { email: emailId }] }).select('-password').exec();


        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const educationRecordIndex = user.userDetails.education.findIndex(edu => edu._id.toString() === _id);

        if (educationRecordIndex === -1) {
            return res.status(404).json({ error: "Education record not found" });
        }

        // Remove the education record from the array
        user.userDetails.education.splice(educationRecordIndex, 1);

        await user.save();

        return res.status(200).json({ message: "Education record deleted successfully" });
    } catch (error) {
        console.error('Error deleting education record:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.post('/updateWorkExperience', isAuthenticated, async (req, res) => {
    try {
        const { company, endDate, position, startDate, _id } = req.body;

        const { userId, emailId } = req.body;

        const user = await Users.findOne({ $or: [{ userId }, { email: emailId }] }).select('-password').exec();


        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const workExperienceRecord = user.userDetails.workExperience.find(exp => exp._id.toString() === _id);

        if (!workExperienceRecord) {
            return res.status(404).json({ error: "Work experience record not found" });
        }

        workExperienceRecord.company = company;
        workExperienceRecord.position = position;
        workExperienceRecord.startDate = startDate;
        workExperienceRecord.endDate = endDate;

        await user.save();

        return res.status(200).json({ message: "Work experience record updated successfully" });
    } catch (error) {
        console.error('Error updating work experience record:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.post('/deleteWorkExperience', isAuthenticated, async (req, res) => {
    try {

        const { _id } = req.body;

        const { userId, emailId } = req.body;

        const user = await Users.findOne({ $or: [{ userId }, { email: emailId }] }).select('-password').exec();


        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const workExperienceIndex = user.userDetails.workExperience.findIndex(exp => exp._id.toString() === _id);

        if (workExperienceIndex === -1) {
            return res.status(404).json({ error: "Work experience record not found" });
        }

        // Remove the work experience record from the array
        user.userDetails.workExperience.splice(workExperienceIndex, 1);

        await user.save();

        return res.status(200).json({ message: "Work experience record deleted successfully" });
    } catch (error) {
        console.error('Error deleting work experience record:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
});




router.post('/updateProject', isAuthenticated, async (req, res) => {
    try {
        const { description, endDate, projectName, startDate, _id } = req.body;

        const { userId, emailId } = req.body;

        const user = await Users.findOne({ $or: [{ userId }, { email: emailId }] }).select('-password').exec();


        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const projectRecord = user.userDetails.projects.find(project => project._id.toString() === _id);

        if (!projectRecord) {
            return res.status(404).json({ error: "Project record not found" });
        }

        projectRecord.projectName = projectName;
        projectRecord.description = description;
        projectRecord.startDate = startDate;
        projectRecord.endDate = endDate;

        await user.save();

        return res.status(200).json({ message: "Project record updated successfully" });
    } catch (error) {
        console.error('Error updating project record:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.post('/deleteProject', isAuthenticated, async (req, res) => {
    try {
        const { _id } = req.body;

        const { userId, emailId } = req.body;


        const user = await Users.findOne({ $or: [{ userId }, { email: emailId }] }).select('-password').exec();


        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const projectIndex = user.userDetails.projects.findIndex(project => project._id.toString() === _id);

        if (projectIndex === -1) {
            return res.status(404).json({ error: "Project record not found" });
        }

        // Remove the project record from the array
        user.userDetails.projects.splice(projectIndex, 1);

        await user.save();

        return res.status(200).json({ message: "Project record deleted successfully" });
    } catch (error) {
        console.error('Error deleting project record:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
});



router.get('/update-delete-Notifications', isAuthenticated, async (req, res) => {
    try {
        res.render('./AdminFiles/update-delete-Notifications');
    } catch (error) {
        console.error('Error rendering update-delete-Notifications page:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/update-delete-Notifications', isAuthenticated, async (req, res) => {
    try {
        const notifications = await notification.find();
        if (!notifications) {
            return res.status(401).json({ message: 'No notifications are available ' });
        }
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/update-Notifications', isAuthenticated, async (req, res) => {
    try {
        const _id = req.body._id;
        const notificationData = await notification.findOne({ _id });
        if (!notificationData) {
            return res.status(401).json({ message: 'Notification not found' });
        }
        res.status(200).json(notificationData);
    } catch (error) {

    }
});

router.post('/update-Notification-req', isAuthenticated, async (req, res) => {
    try {
        const _id = req.body._id;

        const notificationData = await notification.findOneAndUpdate(
            { _id },
            { $set: req.body }, // Assuming the entire notification object is sent in the request body
            { new: true }
        );

        if (!notificationData) {
            return res.status(401).json({ message: 'Notification not found' });
        }

        res.status(200).json({ message: 'Notification updated' });
    } catch (error) {
        console.error('Error updating notification:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/delete-Notification-req', isAuthenticated, async (req, res) => {
    try {
        const _id = req.body._id;

        const notificationData = await notification.findOneAndDelete({ _id });

        if (!notificationData) {
            return res.status(401).json({ message: 'Notification not found' });
        }

        res.status(200).json({ message: 'Notification deleted' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



router.get('/newsletter-subscribers', isAuthenticated, async (req, res) => {
    try {
        res.render('./AdminFiles/newsletter-subscribers')
    } catch (error) {
        console.error('Error fetching newsletter subscribers:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/newsletter-subscribers', isAuthenticated, async (req, res) => {
    try {
        const subscribers = await Newsletter.find();

        if (!subscribers || subscribers.length === 0) {
            return res.status(404).json({ message: 'No newsletter subscribers found' });
        }
        res.status(200).json(subscribers);
    } catch (error) {
        console.error('Error fetching newsletter subscribers:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/post-newsletter', isAuthenticated, async (req, res) => {
    try {
        const { subject, message, style } = req.body;

        const activeSubscribers = await Newsletter.find({ isActive: true }, 'email');
        const emails = activeSubscribers.map(subscriber => subscriber.email);

        // Fetch registered users with matching email addresses
        const registeredUsers = await Users.find({ email: { $in: emails } });

        // Filter out emails of registered users
        const registeredEmails = new Set(registeredUsers.map(user => user.email));
        const unregisteredEmails = emails.filter(email => !registeredEmails.has(email));

        // Send newsletter to registered users
        for (const user of registeredUsers) {
            const emailContent = newsletterMails(user.Fname, user.Lname, message, user.email, style);
            await sendMail(user.email, subject, emailContent);
        }

        // Send newsletter to unregistered subscribers
        for (const email of unregisteredEmails) {
            const emailContent = newsletterMails(null, null, message, email, style);
            await sendMail(email, subject, emailContent);
        }

        res.status(200).json({ message: 'Newsletter sent successfully' });
    } catch (error) {
        console.error('Error sending newsletter:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


function newsletterMails(Fname, Lname, message, email, style) {
    return `
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
            }
            ${style}
        </style>
    </head>
    <body>
        <div class="container">
            <p>Hello ${Fname ? Fname : email} ${Lname ? Lname : ""},</p>
            ${message}
        </div>
    </body>
    </html>
    `;
}



router.post('/restrict-form-news-or-allow', isAuthenticated, async (req, res) => {
    try {
        const { userId, allowOrRestrict } = req.body;

        if (!userId || typeof allowOrRestrict !== 'boolean') {
            return res.status(400).json({ message: 'Invalid request' });
        }

        const newsLetterData = await Newsletter.findOne({ email: userId });
        if (!newsLetterData) {
            return res.status(404).json({ message: 'Subscriber not found' });
        }

        newsLetterData.isActive = allowOrRestrict;
        await newsLetterData.save();

        const action = allowOrRestrict ? 'allowed' : 'restricted';
        res.status(200).json({ message: `Subscriber ${action} for newsletters` });
    } catch (error) {
        console.error('Error restricting/allowing subscriber:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


router.get('/view-account-deletion-Request-page', isAuthenticated, async (req, res) => {
    try {
        res.render('./AdminFiles/view-account-deletion-Request-page')
    } catch (error) {
        console.error(error)
        res.status(404).json('Internal server error');
    }
});

router.post('/view-account-deletion-requests', isAuthenticated, async (req, res) => {
    try {
        const deletionRequestData = await Users.find({ 'deletionRequest.deleteRequest': true })
            .select('-password')
            .exec();

        if (!deletionRequestData || deletionRequestData.length === 0) {
            return res.status(404).json({ message: "No deletion request data available" });
        }

        res.status(200).json(deletionRequestData);
    } catch (error) {
        console.error('Error retrieving deletion request data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.post('/delete-user-account', isAuthenticated, async (req, res) => {
    try {
        const { userId, deletePermanent, removeFromDelete } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const user = await Users.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (deletePermanent) {
            await Users.findByIdAndDelete(userId);
            return res.status(200).json({ message: 'User account deleted Permanently successfully' });

        } else if (removeFromDelete) {
            user.deletionRequest.deleteRequest = false;
            user.deletionRequest.deleteRequestDate = null;
            user.deletionRequest.deleteRequestReason = null;
            await user.save();
            return res.status(200).json({ message: 'User account removed From Deletion successfully' });

        } else {
            user.isActive = false;
            await user.save();
            return res.status(200).json({ message: 'User account soft deleted successfully' });
        }
    } catch (error) {
        console.error('Error deleting user account:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



router.post('/logout', isAuthenticated, async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.clearCookie('session');
            res.clearCookie('adminToken');
            res.status(200).json({ message: 'Logout successful' });
        });
    } catch (error) {
        console.error('Error logging out:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/add-homepage-info', isAuthenticated, async (req, res) => {
    res.render('./AdminFiles/add-homepage-info')
});

router.post('/submit-homepage-info', isAuthenticated, async (req, res) => {
    try {
        // Extract form data from request body
        const {
            contactTelPhoneNo,
            contactEmail,
            GoToWhatsappChat,
            myInformation,
            footerData,
            mapUrl
        } = req.body;

        // Check if there is existing data
        let existingData = await homeInfoSettings.findOne();

        if (existingData) {
            // Update existing document with non-empty values from request body
            existingData.contactTelPhoneNo = contactTelPhoneNo || existingData.contactTelPhoneNo;
            existingData.contactEmail = contactEmail || existingData.contactEmail;
            existingData.GoToWhatsappChat = GoToWhatsappChat || existingData.GoToWhatsappChat;
            existingData.myInformation = myInformation || existingData.myInformation;
            existingData.footerData = footerData || existingData.footerData;
            existingData.mapeUrl = mapUrl || existingData.mapeUrl;

            await existingData.save();

            res.json({ success: true, message: 'Form data updated successfully', data: existingData });
        } else {
            // Create new document
            const newHomeInfoSettings = await homeInfoSettings.create(req.body);

            res.json({ success: true, message: 'Form data submitted successfully', data: newHomeInfoSettings });
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        res.status(500).json({ success: false, message: 'An error occurred while processing the form' });
    }
});

router.get('/Secret_Info_Setting', isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.userId;
        const userData = await userProfile.findOne({ userId }).select('-password').exec();

        if (!userData) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const randomBytes = crypto.randomBytes(3);
        const otp = parseInt(randomBytes.toString('hex'), 16) % 1000000;
        const formattedOTP = otp.toString().padStart(6, '0');

        const email = userData.email;
        const Fname = userData.Fname;
        const Lname = userData.Lname;
        const subject = 'Recently requested to change your secret data';

        req.session.change = formattedOTP;
        await sendMail(email, subject, secretMail(Fname, Lname, req.session.change));

        res.render('./AdminFiles/Secret-Info-Setting');
    } catch (error) {

    }
});

function secretMail(Fname, Lname, OTP) {
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
                <p>You recently requested to change your secret data. Please use the OTP below to proceed with the changes:</p>
                <p><strong>${OTP}</strong></p>
                <p>If you did not make this request, please ignore this email.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

router.post('/verifySecretOtp', isAuthenticated, async (req, res) => {
    try {
       
        const enteredOTP = req.body.enteredOTP;
        if (enteredOTP !== req.session.change) {
            return res.status(400).json({ message: "OTP Wrong" });
        }
      
        const secretData = await Secret_Info_Setting.findOne().exec();
        if (!secretData) {
            
            const newSecretData = new Secret_Info_Setting();
            newSecretData.AdminUpdateing = true; 
            await newSecretData.save();
            return res.status(302).json({ message: "Secret data not foundhshhsh",status:302 });
        }

       secretData.AdminUpdateing = true;

        await secretData.save();

        setTimeout(async () => {
            try {
                secretData.AdminUpdateing = false;
                await secretData.save();
                delete req.session.change;
            } catch (error) {
                console.error('Error resetting AdminUpdateing flag:', error);
            }
        }, 15 * 60 * 1000); 

    res.status(200).json({ message: "OTP verified successfully",status:200 });
    
} catch (error) {
        console.error('Error verifying secret OTP:', error);
        res.status(500).json({ message: "An error occurred while verifying secret OTP" });
    }
});

router.post('/onloadScretData', isAuthenticated, async (req, res) => {
    try {
        const secretData = await Secret_Info_Setting.findOne();
        if (!secretData) {
            return res.status(404).json({ message: "Secret data not found",status:402 });
        }
        if (!secretData.AdminUpdateing) {
            return res.status(400).json({ message: "Verify yourself by OTP then you will be able to see secret data" });
        }
        res.status(200).json(secretData);
    } catch (error) {
        console.error('Error fetching secret data:', error);
        res.status(500).json({ message: "An error occurred while fetching secret data" });
    }
});

router.post('/Secret_Info_Setting', isAuthenticated, async (req, res) => {
    try { 
        // Destructure form data from the request body
        const {
            JWT_SECRET,
            mailAdminEmail,
            GOOGLE_API_KEY,
            CLIENT_SECRET,
            CLIENT_ID,
            REDIRECT_URI,
            nodemailer_User,
            nodemailer_Pass,
            TWILIO_AUTH_TOKEN,
            accountSid,
            twilioPhone,
            atlas_Connection_Auth_Id,
            atlas_Connection_Auth_Pass,
            atlas_Connection_Url,
            Admin_Registration_Access_Key,
            type,
            project_id,
            private_key_id,
            private_key,
            client_email,
            client_id,
            token_uri,
            auth_uri,
            auth_provider_x509_cert_url,
            client_x509_cert_url,
            universe_domain,
            Id_for_Icones_logo,
            Id_for_Blogs,
            Id_for_Gallery,
            WEB_URL,
        } = req.body;

        // Check if AdminUpdateing is true
        const secretData = await Secret_Info_Setting.findOne();
        if (!secretData || !secretData.AdminUpdateing) {
            return res.status(400).json({ message: "Verify yourself by OTP then you will be able to see secret data" });
        }

        // If no existing secret data, create a new record
        if (!secretData) {
            const newSecretData = new Secret_Info_Setting();
            newSecretData.AdminUpdateing = true; // Ensure AdminUpdateing is set to true for new record
            await newSecretData.save();
        }

        // Update the secret data fields
        secretData.JWT_SECRET = JWT_SECRET;
        secretData.mailAdminEmail = mailAdminEmail;
        secretData.GoogleManagement = {
            GOOGLE_API_KEY,
            CLIENT_SECRET,
            CLIENT_ID,
            REDIRECT_URI
        };
        secretData.nodeMailer = {
            nodemailer_User,
            nodemailer_Pass
        };
        secretData.MessageService = {
            TWILIO_AUTH_TOKEN,
            accountSid,
            twilioPhone
        };
        secretData.atlas_Connection = {
            atlas_Connection_Url,
            atlas_Connection_Auth_Id,
            atlas_Connection_Auth_Pass
        };
        secretData.Admin_Registration_Access_Key = Admin_Registration_Access_Key;

        secretData.driveContant = {
            type,
            project_id,
            private_key_id,
            private_key,
            client_email,
            client_id,
            token_uri,
            auth_uri,
            auth_provider_x509_cert_url,
            client_x509_cert_url,
            universe_domain,
        }

        secretData.Id_for_Icones_logo = Id_for_Icones_logo;
        secretData.Id_for_Blogs = Id_for_Blogs;
        secretData.Id_for_Gallery = Id_for_Gallery;
        secretData.WEB_URL = WEB_URL;

        // Save the updated or new secret data
        await secretData.save();

        // Respond with success message
        res.status(200).json({ message: 'Secret information updated successfully.' });
    } catch (error) {
        // Handle errors
        console.error('Error updating secret information:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/addLogo',isAuthenticated,async(req,res)=>{
    try {
        res.render('./AdminFiles/addLogo')
    } catch (error) {
        console.error('Error updating secret information:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}); 


router.post("/logo/upload", uploadforDrive.any(), async (req, res) => {
    try {
        const { files } = req;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileId = await uploadFileToDrive(file);
            await saveFileToDatabase(file, fileId); // Save file info to database
        }

        res.status(200).send("Files uploaded successfully.");
    } catch (error) {
        console.error("Error uploading files:", error);
        res.status(500).send("Error uploading files.");
    }
});


async function uploadFileToDrive(fileObject) {
    try {
        const bufferStream = new stream.PassThrough();
        bufferStream.end(fileObject.buffer);

        const { data } = await drive.files.create({
            requestBody: {
                name: fileObject.originalname,
                parents: [Id_for_Icones_logo], 
            },
            media: {
                mimeType: fileObject.mimetype,
                body: bufferStream,
            },
        });

        console.log(`Uploaded file ${data.name} (${data.id})`);
        return data.id;
    } catch (error) {
        console.error("Error uploading file:", error.message);
        throw error;
    }
}

async function saveFileToDatabase(fileObject, fileId) {
    try {
        const newFile = new driveFile({
            filename: fileObject.originalname, 
            mimetype: fileObject.mimetype,
            fileId: fileId 
        });

       await newFile.save();

        console.log(`File ${newFile.filename} saved to database.`);
    } catch (error) {
        console.error(`Error saving file ${fileObject.filename} to database:`, error);
        throw error;
    }
}

router.get('/View-drive-Image', isAuthenticated, async (req, res) => {
    try {
        res.render('./AdminFiles/viewDriveImage');
    } catch (error) {
        console.error('Error viewing images:', error);
        res.status(500).send('Error viewing images.');
    }
});

router.get('/get-drive-images',isAuthenticated, async (req, res) => {
    try {
        // const imageId = await getImageIdsFromDrive();
        // console.log(imageId)
        const imageIds = await driveFile.find().select('fileId filename').lean();
        
        const transformedData = imageIds.map(item => ({
            id: item.fileId,
            name: item.filename
        }));

        res.json(transformedData);
    } catch (error) {
        console.error('Error sending image URLs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/get-drive-image/:id',isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;

       const response = await fetch(`https://drive.google.com/uc?id=${id}`);
        
        if (response.ok) {
            const buffer = await response.buffer(); 
            res.set('Content-Type', response.headers.get('content-type'));
            res.send(buffer);
        } else {
            res.status(response.status).send('Error fetching image');
        }
    } catch (error) {
        console.error('Error fetching image:', error);
        res.status(500).send('Internal Server Error');
    }
});

async function getResumeIdsFromDrive() {
    const response = await drive.files.list({
        q: "mimeType='image/pdf'",
        fields: 'files(id, name)',
    });
    const imageFiles = response.data.files.map(file => {
        return {
            id: file.id,
            name: file.name
        };
    });

    return imageFiles;
}

async function getImageIdsFromDrive() {
    const response = await drive.files.list({
        q: "mimeType='image/png'",
        fields: 'files(id, name)',
    });
    const imageFiles = response.data.files.map(file => {
        return {
            id: file.id,
            name: file.name
        };
    });

    return imageFiles;
}
   
router.put('/update-drive-image', isAuthenticated,async (req, res) => {
    const { id, name } = req.query;
       
    try {
        const updatedImage = await driveFile.findOneAndUpdate(
            { fileId: id }, 
            { $set: { filename: name } }, 
            { new: true }
        );

        if (!updatedImage) {
            return res.status(404).json({ error: 'Image not found' });
        }

        const metadata = {
            name: name,
        };

        const driveData = await drive.files.update({
            fileId: id,
            resource: metadata,
        });
              
        
        res.status(200).json({ message: `Image with ID ${id} updated successfully with new name: ${name}` });
    } catch (error) {
        console.error('Error updating image:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/delete-drive-image',isAuthenticated, async (req, res) => {
    const { id, name } = req.query;
    try {
       const deletedFile = await driveFile.findOneAndDelete({ fileId: id });

        if (deletedFile) {
            await drive.files.delete({ fileId: id });
            res.status(200).json({ message: `Image with ID ${id} and name ${name} deleted successfully` });
        } else {
            res.status(404).json({ error: 'Image not found in the database' });
        }
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



//   getImageIdsFromDrive()
//     .then(imageUrls => {
//       console.log('Image URLs:', imageUrls);
//       // Display or process the image URLs as needed
//     })
//     .catch(error => {
//       console.error('Error:', error);
//     }); 
 









 



    // async function deleteImagesFromDrive() {
    //     try {
    //       // Retrieve image URLs from Google Drive
    //       const response = await drive.files.list({
    //         q: "mimeType='image/png'", // Filter by MIME type if needed
    //         fields: 'files(id, webViewLink)', // Specify fields to retrieve
    //       });
      
    //       // Extract image URLs from the response
    //       const imageUrls = response.data.files.map(file => file.webViewLink);
      
    //       // Delete images from Google Drive
    //       for (const imageUrl of imageUrls) {
    //         // Extract file ID from the image URL
    //         const fileId = imageUrl.match(/[-\w]{25,}/);
    //         if (fileId) {
    //           // Delete the file using the file ID
    //           await drive.files.delete({
    //             fileId: fileId[0],
    //           });
    //           console.log(`Image with ID ${fileId[0]} deleted successfully.`);
    //         }
    //       }
      
    //       return "Images deleted successfully.";
    //     } catch (error) {
    //       console.error('Error deleting images from Google Drive:', error);
    //       return "Error deleting images.";
    //     }
    //   }
      
    //   // Call the function to delete images from Google Drive
    //   deleteImagesFromDrive()
    //     .then(result => {
    //       console.log(result);
    //     })
    //     .catch(error => {
    //       console.error('Error:', error);
    //     });
      
    // async function checkImageInDrive(fileId) {
    //     try {
    //       // Call the Drive API to get information about the file
    //       const response = await drive.files.get({
    //         fileId: fileId,
    //         fields: 'id, name, webViewLink', // Specify fields to retrieve
    //       });
      
    //       // If the file is found, return its information
    //       return {
    //         found: true,
    //         fileId: response.data.id,
    //         filename: response.data.name,
    //         webViewLink: response.data.webViewLink
    //       };
    //     } catch (error) {
    //       // If the file is not found or an error occurs, handle the error
    //       if (error.response && error.response.status === 404) {
    //         return { found: false, message: 'File not found in Google Drive.' };
    //       } else {
    //         console.error('Error checking image in Google Drive:', error);
    //         return { found: false, message: 'Error checking image in Google Drive.' };
    //       }
    //     }
    //   }
      
    //   // Extract the file ID from the provided URL
    //   const url = 'https://drive.google.com/file/d/1FH3CW6uTZGtBf-mzd9A4LCf_oiJ2vQ_z/view?usp=drivesdk';
    //   const fileId = url.match(/[-\w]{25,}/);
      
    //   if (fileId) {
    //     // Call the function to check if the image is in Google Drive
    //     checkImageInDrive(fileId[0])
    //       .then(result => {
    //         if (result.found) {
    //           console.log('Image found in Google Drive:');
    //           console.log('File ID:', result.fileId);
    //           console.log('Filename:', result.filename);
    //           console.log('WebViewLink:', result.webViewLink);
    //         } else {
    //           console.log(result.message);
    //         }
    //       })
    //       .catch(error => {
    //         console.error('Error:', error);
    //       });
    //   } else {
    //     console.log('Invalid URL. Please provide a valid Google Drive URL.');
    //   }
      


router.get('/viewAllVideoCallRequestData',isAuthenticated, async (req, res) => {
        try {
            res.render('./AdminFiles/viewAllVideoCallRequestData');
        } catch (error) {
            const videoCallCss = `
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f2f2f2;
                    margin: 0;
                    padding: 20px;
                    text-align: center;
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
                    margin-bottom: 20px;
                }
                p {
                    color: #666;
                    line-height: 1.6;
                    margin-bottom: 10px;
                }
            `;
            return res.status(500).send(`
                <html>
                <head>
                    <style>
                        ${videoCallCss}
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Error 500: Internal server error</h1>
                        <p>${error.message}</p>
                    </div>
                </body>
                </html>
            `);
        }
});
    
router.post('/viewAllVideoCallRequestData', isAuthenticated, async (req, res) => {
    try {
        const requestData = await VideocallRequest.find();
        if (!requestData) {
            return res.status(400).json({ message: 'No video call requests found' });
        }
      
        res.status(200).json(requestData);
    } catch (error) {
        console.error('Error fetching video call info:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


router.get('/adminVideoCall', async (req, res) => {
    try {
        // Render the admin-video-call view file located in the AdminFiles folder
        res.render('./AdminFiles/admin-video-call');
    } catch (error) {
        // If there's an error, handle it by sending a 500 status response with an error message
        const videoCallCss = `
            body {
                font-family: Arial, sans-serif;
                background-color: #f2f2f2;
                margin: 0;
                padding: 20px;
                text-align: center;
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
                margin-bottom: 20px;
            }
            p {
                color: #666;
                line-height: 1.6;
                margin-bottom: 10px;
            }
        `;

        // Return a 500 status response with an HTML error message
        return res.status(500).send(`
            <html>
            <head>
                <style>
                    ${videoCallCss}
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Error 500: Internal server error</h1>
                    <p>${error.message}</p>
                </div>
            </body>
            </html>
        `);
    }
});

router.post('/actionOnVideoCallRequest', isAuthenticated, async (req, res) => {
    try {
        const { requestId, status, newTiming } = req.body;

        if (!requestId) {
            return res.status(400).json({ message: 'Request ID is required.' });
        }

        const videoCallData = await VideocallRequest.findOne({ requestId });

        if (!videoCallData) {
            return res.status(404).json({ message: 'Video call request not found.' });
        }
        const videocallJoinUrl = `${WEB_URL}/joinvideocall/${videoCallData.userEmail}/${videoCallData.requestId}`;
        const logoUrl = `${WEB_URL}/get-logo-from-drive/Ankitpicture.png`;
        if (status) {
            videoCallData.status = status;

            await videoCallData.save();
             await sendMail(videoCallData.userEmail, "Regarding change status", emailTextForUpdatestatus(videoCallData.userEmail, videoCallData.requesterFirstName, videoCallData.requesterLastName, videoCallData.status, videocallJoinUrl, logoUrl));
        }

        if (newTiming) {
            const newRescheduleDateTimeUTC = moment(newTiming).add(5, 'hours').add(30, 'minutes').utc().format('YYYY-MM-DDTHH:mm:ss[Z]');
        
            videoCallData.rescheduledTiming = newRescheduleDateTimeUTC;
            await videoCallData.save();
           
           await sendMail(videoCallData.userEmail, "Regarding rescheduled Timing ", emailTextForRescheduledTiming(videoCallData.userEmail, videoCallData.requesterFirstName, videoCallData.requesterLastName, videoCallData.rescheduledTiming, videocallJoinUrl, logoUrl));
           return  res.status(200).json({ message: 'new timing updated successfully.' });
        }
        
        

        res.status(200).json({ message: 'Video call request updated successfully.' });
    } catch (error) {
        console.error('Error updating video call request:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});





function emailTextForUpdatestatus(userEmail, firstName, lastName, status, videocallJoinUrl, logoUrl) {
    let message;
    let messageClass;
    if (status === 'Accepted') {
        message = `
            <p>You can join the video call using the following link:</p>
            <a href="${videocallJoinUrl}" class="video-call-link">${videocallJoinUrl}</a>
        `;
        messageClass = 'accept-message';
    } else if (status === 'Declined') {
        message = `
            <p>Please contact our team for further assistance:</p>
            <a href="${WEB_URL}/contact" class="contact-link">${WEB_URL}/contact</a>
        `;
        messageClass = 'decline-message';
    } else {
        message = `<p><a href="${WEB_URL}/login" class="contact-link">login</a> here for futher information </p>`; // Handle other status cases here if needed
        messageClass = 'pending-message';
    }

    return `
        <html>
        <head>
            <style>
                /* Your email styling goes here */
                .email-container {
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    border: 1px solid #ccc;
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .logo {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                }
                .${messageClass} {
                    background-color: #f5f5f5;
                    padding: 10px;
                    border-radius: 5px;
                    margin-top: 20px;
                }
                .video-call-link, .contact-link {
                    color: blue;
                    text-decoration: underline;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <img src="${logoUrl}" alt="Logo" class="logo">
                    <h1>Update on Video Call Status</h1>
                </div>
                <p>Hello ${firstName || userEmail} ${lastName || ''},</p>
                <p>Your video call status has been updated to: ${status}</p>
                ${message ? `<div class="${messageClass}">${message}</div>` : ''}
            </div>
        </body>
        </html>
    `;
}

function emailTextForRescheduledTiming(userEmail, firstName, lastName, rescheduledTiming, videocallJoinUrl, logoUrl) {
    const name = firstName || userEmail.split('@')[0]; // Use email if first name is not available
    function formatDate(rescheduledTiming) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const formattedDate = new Date(rescheduledTiming).toLocaleDateString('en-GB', options);
        return formattedDate.replace(/\//g, '-'); // Replace '/' with '-' for DD-MM-YYYY format
    }
    
    function formatTime(rescheduledTiming) {
        const options = { hour: '2-digit', minute: '2-digit' };
        const formattedTime = new Date(rescheduledTiming).toLocaleTimeString('en-GB', options);
        return formattedTime.replace(':', '.'); // Replace ':' with '.' for DD.MM format
    }
    
    const formattedDate = formatDate(rescheduledTiming);
    const formattedTime = formatTime(rescheduledTiming);
    const dateAndTime = `${formattedDate} at ${formattedTime}`;

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
                    background-color: #f7f7f7;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .header {
                    background-color: #007bff;
                    color: #fff;
                    padding: 10px;
                    border-radius: 8px 8px 0 0;
                }
                .content {
                    padding: 20px;
                }
                .button {
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #007bff;
                    text-decoration: none;
                    border-radius: 5px;
                    color: white;
                    font-weight: bold;
                }
                
                .info {
                    margin-top: 20px;
                }
                img{
                    border-radius: 50%;
                }
                h1{
                    display:inline-block;
                }
               
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Update on Rescheduled Video Call Timing</h1>
                    <img src="${logoUrl}" alt="Logo" style="width: 100px; height: 100px;">
                </div>
                <div class="content">
                    <p>Hello ${name} ${lastName||''}</p>
                    <p>Your video call timing has been rescheduled to: ${dateAndTime}</p>
                    <p>You can join the video call using the following link:</p>
                    <a class="button" href="${videocallJoinUrl}">Join Video Call</a>
                    <div class="info">
                        <p><strong>Meeting Details:</strong></p>
                        <ul>
                            <li><strong>Rescheduled Time:</strong> ${dateAndTime}</li>
                            <li><strong>Join URL:</strong> <a href="${videocallJoinUrl}">${videocallJoinUrl}</a></li>
                        </ul>
                    </div>
                    <br>
                    
                </div>
            </div>
        </body>
        </html>
    `;
}






export default router;
export {drive};