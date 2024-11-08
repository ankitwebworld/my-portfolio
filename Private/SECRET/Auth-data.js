
import dotenv from "dotenv"

dotenv.config();

import nodemailer from "nodemailer";
import mongoose from "mongoose";
import { Secret_Info_Setting } from "../db/db_Schema.js";

const mongoURI = process.env.MONGODB_URI;
const atlasConnectionString = mongoURI;

await mongoose.connect(mongoURI).then(
    () => console.log("Database Connected"),
    (error) => console.error("Database Connection Error", error)
);



async function getData(field, nestedField = null) {
    try {
        const data = await Secret_Info_Setting.findOne();
        if (nestedField) {
            return data ? data[field][nestedField] : null;
        } else {
            return data ? data[field] : null;
        }
    } catch (error) {
        console.error(`Error retrieving ${field}:`, error);
        return null;
    }
}

const JWT_SECRET = await getData('JWT_SECRET') ;

const adminEmail = await getData('mailAdminEmail');

const GOOGLE_API_KEY = await getData('GoogleManagement', 'GOOGLE_API_KEY');
const CLIENT_SECRET = await getData('GoogleManagement', 'CLIENT_SECRET');
const CLIENT_ID = await getData('GoogleManagement', 'CLIENT_ID');
const REDIRECT_URI = await getData('GoogleManagement', 'REDIRECT_URI');

// const REDIRECT_URI = 'http://localhost:3000/auth/google/callback';

console.log(REDIRECT_URI)
const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=openid%20email%20profile%20phone`;

const nodemailer_User = await getData('nodeMailer', 'nodemailer_User');
const nodemailer_Pass = await getData('nodeMailer', 'nodemailer_Pass');

  


const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: nodemailer_User,
        pass: nodemailer_Pass
    }
});



const TWILIO_AUTH_TOKEN = await getData('MessageService', 'TWILIO_AUTH_TOKEN');
const accountSid = await getData('MessageService', 'accountSid');
const authToken = process.env.TWILIO_AUTH_TOKEN || TWILIO_AUTH_TOKEN;
const twilioPhone = await getData('MessageService', 'twilioPhone');;



const Admin_Registration_Access_Key = await getData('Admin_Registration_Access_Key');

const DERIVED_ACCESS_KEY = Admin_Registration_Access_Key;


const atlas_Connection_Url = await getData('atlas_Connection', 'atlas_Connection_Url');
const atlas_Connection_Auth_Id = await getData('atlas_Connection', 'atlas_Connection_Auth_Id');
const atlas_Connection_Auth_Pass = await getData('atlas_Connection', 'atlas_Connection_Auth_Pass');


// const atlasConnectionString = 'mongodb+srv://it2033:YhdSfQiS5z3shi3p@cluster0.culkfzt.mongodb.net/AnkitPortfolio?retryWrites=true&w=majority';
// atlas_Connection_Url || `mongodb+srv://it2033:YhdSfQiS5z3shi3p@cluster0.culkfzt.mongodb.net/AnkitPortfolio?retryWrites=true&w=majority`||
// 'mongodb://127.0.0.1/PortFolio';

//drive contant data 
const type = await getData('driveContant', 'type');
const project_id = await getData('driveContant', 'project_id');
const private_key_id = await getData('driveContant', 'private_key_id');
const private_key = await getData('driveContant', 'private_key');
const client_email = await getData('driveContant', 'client_email');
const client_id = await getData('driveContant', 'client_id');
const auth_uri = await getData('driveContant', 'auth_uri');
const token_uri = await getData('driveContant', 'token_uri');
const auth_provider_x509_cert_url = await getData('driveContant', 'auth_provider_x509_cert_url');
const client_x509_cert_url = await getData('driveContant', 'client_x509_cert_url');
const universe_domain = await getData('driveContant', 'universe_domain');
 
// console.log(client_email)
const serviceAccount = {
    "type": type,
    "project_id": project_id,
    "private_key_id": private_key_id,
    "private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDKaxYXnAxqJI8L\nVO5WePuHwK0V1Y10zzKPMS5RtRIAH0TofXozwJCc8Ppikf6vhA9OSkISw0EBTzbF\n4MG6u8b61gvbFf6Lb4xGry3LErsvWECVucYl48PKJecdndM+sHxesnLT/Li9UouM\n61GFFGUuQfH1QQWWNmdReGU2+Edyugyy5YcCY8OrICr6cOT997gG90Ko8hZbJpJj\nDtjif6buRo1HDia03JKRSt0UAUSfoSkBUomrURyyQNxNe+fdY0skRdo6iIrXfI8A\neHRggb/4TgKTd7KjcOgfNrC6iL41mwDgiOtt3/g9ZitSzOnxDGFwtmlXDIoDoH/X\nHq9rIrpVAgMBAAECggEAWN2SoWLdAGx0cGElEcmjhAHO+1r582JTrBHHaA+6i1sv\nAXK1B6tu0bfp9QRrb9rmbVSklWArVcvVHCKEatqtjMoUAmcxjT23tACMdi8PBsYT\n9KfOmivYdRMW2CXF7CvHLjvhtbep01Q99+wHqgk+MoS5GRcmwL+5tEbLCMsPcwn6\nr2gSefoYKfSjIkPYkmJ8Sew6xu7HatgHyl7ZBRp3X7cRrxQJQ1xqXHifYRQqbzkQ\nLgnKbS+vpIIbft38x3bpeaeI10awVSuGtVCFY7sl3szwMOIXhytY4EyBeznErAyQ\n9KMDoA+tCCPaYSNKajFN65p1q7aPh7W6zJ2Xu0RhMQKBgQD2blkbHq0d8JJdK4r2\nqCa8zqrBPOA/hDG4Ic21Zf/SzINIkD7FkA6j9aDsoRjWGEd8R0XoK+9wgRpv4TQQ\npqgF5aiWh6+TjU5NtpnI5GELkEhB76ck2tIy71Ug0uv/hXkERN5mCFNpVgkAzyLc\nb717KXYSCN4tMy6x2xjHnG1qywKBgQDSRzqVOh8MwwRqjpiIYpoBn10DXogVmzSb\nT2VW1+ZAu8+R9hL2Trb2CdwohhhXJsNY4mQbeWIy+F5Dsvwt3OebgpUgsEDtpWZG\nZ/NJwIb6ANtx3NhqZVVbJaeIygIJDiaj3wDA8n4HF+ap/Uvrt4O23TmRTEryvEDz\n3ftCzcgrXwKBgAFdbRrsWZMf4P+pHRTuq4BCOMnnN2rCpa/aaBRII1mcjmGZgu9/\nM8WOt7x3y/ZrngG/N1Do5WOfI3FZMvugoK+frQZgbAWKM9PUXhexxCPXQb8zv55B\npAZqMvOCl5ILwDbY1s6D30pnEpexjgTgjZEgEqpY6Doh3XFYwFNit2xvAoGBAME5\njs2dsPaLJb289tEsuhQPmusDrM0d58Nnu9mHXx/Q9TZNBrOrNVj1Soc6YZeEGTHO\nJutQKTppHEXdbPm/6lvuLJbzH1bBDDBaSSdWcTG+I+iHZZ6vKzYsbby21BP6Guuu\negTTT5e5EM7X4THjWndo5gNsNdrDvnPZYY/LhMrFAoGBALhuLCZXghzsEyX+WB/c\nnJhR+stGe377H6/dSn1ZI5+0YDS3MIYscqBym6GsP84slg0AY04gaCxRw+tt/DVg\npwUf9t/ZRTfs+gThLLm/cJRx8KgxCnWpw2IADh7hqZF7RbzQfF6XxBtZ+o0VUwBX\nxM0GsTLlZ3D2iceeHob7gWtP\n-----END PRIVATE KEY-----\n",
    "client_email": client_email, // Make sure this field is included
    "client_id": client_id,
    "auth_uri": auth_uri,
    "token_uri": token_uri,
    "auth_provider_x509_cert_url": auth_provider_x509_cert_url,
    "client_x509_cert_url": client_x509_cert_url,
    "universe_domain": universe_domain
};


const Id_for_Icones_logo = await getData('Id_for_Icones_logo');
const Id_for_Blogs = await getData('Id_for_Blogs');
const Id_for_Gallery = await getData('Id_for_Gallery');
const WEB_URL = await getData('WEB_URL');

// console.log(Id_for_Gallery)
export {
    atlasConnectionString, atlas_Connection_Auth_Id, atlas_Connection_Auth_Pass,
    GOOGLE_API_KEY, CLIENT_SECRET, CLIENT_ID, REDIRECT_URI,
    JWT_SECRET, googleAuthUrl, transporter, adminEmail, twilioPhone, accountSid,
    authToken, DERIVED_ACCESS_KEY, serviceAccount, Id_for_Icones_logo, Id_for_Blogs, Id_for_Gallery,WEB_URL
};
 