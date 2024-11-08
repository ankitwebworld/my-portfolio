document.addEventListener('DOMContentLoaded', () => {
    secretOtpContain();
    
    secretDataUpdate();

});


async function onloadData() {
    const feedback = document.getElementById('feedback');

    try {
        const response = await fetch('/admin/onloadScretData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (response.ok) {
            const data = await response.json();

            // Extract data from the response
            const {
                JWT_SECRET,
                mailAdminEmail,
                GoogleManagement,
                nodeMailer,
                MessageService,
                atlas_Connection,
                Admin_Registration_Access_Key,
                driveContant,
                Id_for_Icones_logo,
                Id_for_Blogs,
                Id_for_Gallery,
                WEB_URL,
            } = data;

            // Assign values to corresponding elements
            document.getElementById('JWT_SECRET').value = JWT_SECRET || '';
            document.getElementById('mailAdminEmail').value = mailAdminEmail || '';

            document.getElementById('GOOGLE_API_KEY').value = GoogleManagement?.GOOGLE_API_KEY || '';
            document.getElementById('CLIENT_SECRET').value = GoogleManagement?.CLIENT_SECRET || '';
            document.getElementById('CLIENT_ID').value = GoogleManagement?.CLIENT_ID || '';
            document.getElementById('REDIRECT_URI').value = GoogleManagement?.REDIRECT_URI || '';

            document.getElementById('nodemailer_User').value = nodeMailer?.nodemailer_User || '';
            document.getElementById('nodemailer_Pass').value = nodeMailer?.nodemailer_Pass || '';

            document.getElementById('TWILIO_AUTH_TOKEN').value = MessageService?.TWILIO_AUTH_TOKEN || '';
            document.getElementById('accountSid').value = MessageService?.accountSid || '';
            document.getElementById('twilioPhone').value = MessageService?.twilioPhone || '';

            document.getElementById('atlas_Connection_Url').value = atlas_Connection?.atlas_Connection_Url || '';
            document.getElementById('atlas_Connection_Auth_Id').value = atlas_Connection?.atlas_Connection_Auth_Id || '';
            document.getElementById('atlas_Connection_Auth_Pass').value = atlas_Connection?.atlas_Connection_Auth_Pass || '';

            document.getElementById('Admin_Registration_Access_Key').value = Admin_Registration_Access_Key || '';

            document.getElementById('type').value = driveContant?.type || '';
            document.getElementById('project_id').value = driveContant?.project_id || '';
            document.getElementById('private_key_id').value = driveContant?.private_key_id || '';
            document.getElementById('private_key').value = driveContant?.private_key || '';
            document.getElementById('client_email').value = driveContant?.client_email || '';
            document.getElementById('client_id').value = driveContant?.client_id || '';
            document.getElementById('token_uri').value = driveContant?.token_uri?.trim() || '';
            document.getElementById('auth_uri').value = driveContant?.auth_uri?.trim() || '';
            document.getElementById('auth_provider_x509_cert_url').value = driveContant?.auth_provider_x509_cert_url?.trim() || '';
            document.getElementById('client_x509_cert_url').value = driveContant?.client_x509_cert_url?.trim() || '';
            document.getElementById('universe_domain').value = driveContant?.universe_domain?.trim() || '';
            document.getElementById('Id_for_Icones_logo').value = Id_for_Icones_logo.trim() || '';
            document.getElementById('Id_for_Blogs').value = Id_for_Blogs.trim() || '';
            document.getElementById('Id_for_Gallery').value = Id_for_Gallery.trim() || '';
            document.getElementById('WEB_URL').value = WEB_URL.trim() || '';
            
            feedback.textContent = ''; 
        } else {
            const errorMessage = await response.json();
            feedback.textContent = errorMessage.message || 'Failed to load secret data';
        }
    } catch (error) {
        console.error('Error fetching secret data:', error);
        feedback.textContent = 'An error occurred while loading secret data. Please try again later.';
    }
};


function secretDataUpdate() {
    const formData = document.getElementById('formData');

    formData.addEventListener('submit', async (event) => {
        event.preventDefault();

        const JWT_SECRET = document.getElementById('JWT_SECRET').value.trim();
        const mailAdminEmail = document.getElementById('mailAdminEmail').value.trim();
        const GOOGLE_API_KEY = document.getElementById('GOOGLE_API_KEY').value.trim();
        const CLIENT_SECRET = document.getElementById('CLIENT_SECRET').value.trim();
        const CLIENT_ID = document.getElementById('CLIENT_ID').value.trim();
        const REDIRECT_URI = document.getElementById('REDIRECT_URI').value.trim();
        const nodemailer_User = document.getElementById('nodemailer_User').value.trim();
        const nodemailer_Pass = document.getElementById('nodemailer_Pass').value.trim();
        const TWILIO_AUTH_TOKEN = document.getElementById('TWILIO_AUTH_TOKEN').value.trim();
        const accountSid = document.getElementById('accountSid').value.trim();
        const twilioPhone = document.getElementById('twilioPhone').value.trim();
        const atlas_Connection_Auth_Id = document.getElementById('atlas_Connection_Auth_Id').value.trim();
        const atlas_Connection_Auth_Pass = document.getElementById('atlas_Connection_Auth_Pass').value.trim();
        const atlas_Connection_Url = document.getElementById('atlas_Connection_Url').value.trim();
        const Admin_Registration_Access_Key = document.getElementById('Admin_Registration_Access_Key').value.trim();
        
        const type = document.getElementById('type').value.trim();
        const project_id = document.getElementById('project_id').value.trim();
        const private_key_id = document.getElementById('private_key_id').value.trim();
        const private_key = document.getElementById('private_key').value.trim();
        const client_email = document.getElementById('client_email').value.trim();
        const client_id = document.getElementById('client_id').value.trim();
        const token_uri = document.getElementById('token_uri').value.trim();
        const auth_uri = document.getElementById('auth_uri').value.trim();
        const auth_provider_x509_cert_url = document.getElementById('auth_provider_x509_cert_url').value.trim();
        const client_x509_cert_url = document.getElementById('client_x509_cert_url').value.trim();
        const universe_domain = document.getElementById('universe_domain').value.trim();
        const Id_for_Icones_logo = document.getElementById('Id_for_Icones_logo').value.trim();
        const Id_for_Blogs = document.getElementById('Id_for_Blogs').value.trim();
        const Id_for_Gallery = document.getElementById('Id_for_Gallery').value.trim();
        const WEB_URL = document.getElementById('WEB_URL').value.trim();
         
        const button = event.target.querySelector('[type="submit"]');
        button.textContent = 'Updating...';

        try {
            const response = await fetch('/admin/Secret_Info_Setting', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
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
                    WEB_URL
 })
            });

            if (response.ok) {
                button.textContent ='';
                
                const data = await response.json();
                console.log(data)
                button.textContent =  data.message; 
            } else {
                button.textContent ='';
                const errorMessage = await response.json();
                button.textContent = errorMessage.error || 'Failed to update secret information';
            }
        } catch (error) {
            console.error('Error updating secret information:', error);
           }
    });
}


function secretOtpContain() {
    document.getElementById('otpform').addEventListener('submit', async (event) => {
        event.preventDefault();

        const enteredOTP = document.getElementById('verifyOtp').value.trim();
        const button = event.target.querySelector('[type="submit"]');
        const container = document.querySelector('.container');
        const otpBox = document.querySelector('.otpBox');
        button.textContent = 'Verifying...';
        try {
            const response = await fetch('/admin/verifySecretOtp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ enteredOTP })
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data.message)
                button.textContent = data.message;
                if (data.status == 200) {
                    container.style.display = 'block';
                    otpBox.style.display = 'none';
                    onloadData();
                }
                
            } else {
                const errorMessage = await response.json();
                button.textContent = errorMessage.message;
                if(errorMessage.status== 302)
                {
                    container.style.display = 'block';
                    otpBox.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);

        }
    });
}


