import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    sender: {
        username: String,
        profilePicture: String,
    },
    action: String,
    target: String,
    message: String,
    createdAt: { type: Date, default: Date.now },
    featureImage: String,
    read: { type: Boolean, default: false },
});


//for admin
const userProfileSchema = new mongoose.Schema({
    userId: String,
    email: String,
    password: String,
    Fname: String,
    Lname: String,
    notifications: [notificationSchema],
});

//for users
const normalUser = new mongoose.Schema({
    userId: String,
    email: String,
    verifiedByGoogle: { type: Boolean, required: true, default: false },
    password: String,
    Fname: String,
    Lname: String,
    userDetails: {
        bio: String,
        dateOfBirth: Date,
        phoneNumber: String,
        address: {
            street: String,
            city: String,
            state: String,
            postalCode: String,
        },
        interests: [String],
        education: [
            {
                institution: String,
                degree: String,
                graduationYear: Number,
            },
        ],
        skillSet: [String],
        workExperience: [
            {
                company: String,
                position: String,
                startDate: Date,
                endDate: Date,
            },
        ],
        certifications: [String],
        projects: [
            {
                projectName: String,
                description: String,
                startDate: Date,
                endDate: Date,
            },
        ],
        languages: [String],
        hobbies: [String],
        socialMedia: {
            linkedin: String,
            twitter: String,
            github: String,
        },
        personalWebsite: String,

    },
    notifications: [notificationSchema],

    deletionRequest: {
        deleteRequest: { type: Boolean, default: false },
        deleteRequestDate: { type: Date },
        deleteRequestReason: { type: String, default: null },
        accountDeleted: { type: Boolean, default: false }
    },

    isActive: { type: Boolean, default: true }


});

const contactSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
    },
    ReferenceId: String,
    emailAddress: {
        type: String,
        required: true,
    },
    phoneNo: {
        type: String,
        required: true,
    },
    subject: {
        type: String,

    },
    message: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    responses: [
        {
            message: String,
            respondBy: String,
            timestamp: {
                type: Date,
                default: Date.now,
            },
        },
    ],
});

const tokenIdsSchema = new mongoose.Schema({
    emailAddress: {
        type: String,
    },
    tokenIds: [{
        ReferenceId: {
            type: String,
        },
        purpose: {
            type: String,
        },
        Date: {
            type: Date,
            default: Date.now
        }
    }],
});

const BlogsSchema = new mongoose.Schema({
    title: String,
    content: String,
    category: String,
    date: Date,
    location: String,
    photos: [String],
    hashtags: [String],
    codes: String,
    filename: {
        type: String,
    },
    mimetype: {
        type: String,
    },
    fileId: {
        type: String,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const testimonialSchema = new mongoose.Schema({
    clientName: String,
    clientTitle: String,
    testimonialContent: String,
    projectDetails: String,
    date: {
        type: Date,
        default: Date.now,
    },
    markedByAnkit: {
        type: Boolean,
        default: false,
    },
    replybyAnkit: {
        type: String,
        default: null,
    }

});

const gallerySchema = new mongoose.Schema({
    galleryName: String,
    description: String,
    author: String,
    date: { type: Date, default: Date.now },
    galleryImage: String,
    filename: String,
    mimetype: String,
    fileId: String,
});

const otpverifySchema = new mongoose.Schema({
    userId: String,
    changingPassword: String,
    purpose: String,
    OtpData: [{
        OTP: String,
        expirationDate: { type: Date, default: () => Date.now() + 10 * 60 * 1000 },
        date: { type: Date, default: Date.now }
    }],

});

const newsletterSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    subscribedAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

const privacySecuritySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        mainText: {
            type: String,
            required: true
        },
        additionalInfo: String,
        videos: [String],
        attachments: [String],
        relatedLinks: [{
            title: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }],
        frequentlyAskedQuestions: [{
            question: {
                type: String,
                required: true
            },
            answer: {
                type: String,
                required: true
            }
        }],
        importantNotes: [String],
        policies: mongoose.Schema.Types.Mixed
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userData'
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

const homeInfoSettingsSchema = new mongoose.Schema({

    contactTelPhoneNo: String,
    contactEmail: String,
    GoToWhatsappChat: String,
    myInformation: String,
    footerData: String,
    mapeUrl: String,

});

const Secret_Info_Setting_Schema = new mongoose.Schema({

    AdminUpdateing: { type: Boolean, default: false },
    lastUpdate: {
        type: Date,
        default: Date.now
    },

    JWT_SECRET: String,
    mailAdminEmail: String,

    GoogleManagement: {
        GOOGLE_API_KEY: String,
        CLIENT_SECRET: String,
        CLIENT_ID: String,
        REDIRECT_URI: String
    },
    nodeMailer: {
        nodemailer_User: String,
        nodemailer_Pass: String,
    },
    MessageService: {
        TWILIO_AUTH_TOKEN: String,
        accountSid: String,
        twilioPhone: String,
    },

    atlas_Connection: {
        atlas_Connection_Url: String,
        atlas_Connection_Auth_Id: String,
        atlas_Connection_Auth_Pass: String

    },
    Admin_Registration_Access_Key: String,

    driveContant: {
        type: { type: String, trim: true },
        project_id: { type: String, trim: true },
        private_key_id: { type: String, trim: true },
        private_key: { type: String, trim: true },
        client_email: { type: String, trim: true },
        client_id: { type: String, trim: true },
        auth_uri: { type: String, trim: true },
        token_uri: { type: String, trim: true },
        auth_provider_x509_cert_url: { type: String, trim: true },
        client_x509_cert_url: { type: String, trim: true },
        universe_domain: { type: String, trim: true }

    },

    Id_for_Icones_logo: String,
    Id_for_Blogs: String,
    Id_for_Gallery: String,

    WEB_URL: String

});

const fileSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    mimetype: {
        type: String,
        required: true
    },
    fileId: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const videocallRequestSchema = new mongoose.Schema({
    requestId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'normalUser',
        required: true
    },
    userEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    requesterFirstName: {
        type: String,
        required: true,
        trim: true
    },
    requesterLastName: {
        type: String,
        required: false,
        trim: true
    },
    timing: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Declined'],
        default: 'Pending'
    },
    requestDate : {
        type: Date,
        default: Date.now

    },
    rescheduledTiming: {
        type: Date,
        default: null
    }
}, 
{
    timestamps: true
});


const BlogsModel = mongoose.model('Information', BlogsSchema);
const Contact = mongoose.model('Contact', contactSchema);
const userProfile = mongoose.model('userData', userProfileSchema);
const TokenIdsModel = mongoose.model('TokenIdsModel', tokenIdsSchema);
const testimonial = mongoose.model('TestimonialCollection', testimonialSchema);
const Gallery = mongoose.model('Gallery', gallerySchema);
const otpData = mongoose.model('OTPLibrary', otpverifySchema);
const Users = mongoose.model('normalUser', normalUser);
const notification = mongoose.model('notifications', notificationSchema);
const Newsletter = mongoose.model('Newsletter', newsletterSchema);
const PrivacySecurity = mongoose.model('PrivacySecurity', privacySecuritySchema);
const homeInfoSettings = mongoose.model('homeInfoSettings', homeInfoSettingsSchema);
const Secret_Info_Setting = mongoose.model('Secret_Info_Setting', Secret_Info_Setting_Schema);
const driveFile = mongoose.model('DriveFile', fileSchema);
const VideocallRequest = mongoose.model('VideocallRequest', videocallRequestSchema);


export {
    BlogsModel, Contact, userProfile,
    TokenIdsModel, testimonial, Gallery,
    otpData, Users, notification, Newsletter,
    PrivacySecurity, homeInfoSettings,
    Secret_Info_Setting,
    driveFile,
    VideocallRequest
};
