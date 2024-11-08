document.addEventListener('DOMContentLoaded', function(event) {
    const resetPasswordButton = document.getElementById('reset-password');
    const emailInput = document.getElementById('typeEmail');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    resetPasswordButton.disabled = true;
    
    resetPasswordButton.addEventListener('click', function(event) {
        event.preventDefault();
        
        const email = emailInput.value;

        if (!emailRegex.test(email)) { 
            emailInput.classList.add('is-invalid'); 

            // Check if an error message already exists before appending a new one
            if (!emailInput.parentNode.querySelector('.invalid-feedback')) {
                const errorFeedback = document.createElement('div');
                errorFeedback.classList.add('invalid-feedback');
                errorFeedback.textContent = 'Please enter a valid email address.';
                emailInput.parentNode.appendChild(errorFeedback); 
            }

            resetPasswordButton.disabled = true; // Disable the button
            return;
        } else {
            // If the email format is valid, remove any existing error message
            emailInput.classList.remove('is-invalid');
            const errorFeedback = emailInput.parentNode.querySelector('.invalid-feedback');
            if (errorFeedback) {
                errorFeedback.remove();     
            }
        }

        // Proceed with sending the password reset request
        fetch('/admin/admin-forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            resetPasswordButton.textContent = data.message;
            resetPasswordButton.style.backgroundColor = "green";
            resetPasswordButton.disabled = false;
            otpSection();
        })
        .catch(error => {
            console.error('There was a problem with your request:', error);
        });
    });

    // Add an event listener to hide the error message when the email input is changed
    emailInput.addEventListener('input', function() {
        const errorFeedback = emailInput.parentNode.querySelector('.invalid-feedback');
        if (errorFeedback) {
            errorFeedback.remove(); 
        }

        resetPasswordButton.disabled = !emailRegex.test(emailInput.value);
    });
});

function otpSection() {
    const cardBody = document.querySelector('.card-body');

    cardBody.innerHTML = `
        <p class="card-text py-2">
            Please enter the OTP sent to your email address.
        </p>
        <div class="form-outline">
            <input type="text" placeholder="Enter OTP" id="typeOTP" class="form-control my-3" />
        </div>
        <a href="#" class="btn btn-primary w-100" id="Verify-OTP">Verify OTP</a>
        <div class="d-flex justify-content-between mt-4">
            <a class="" href="/login">Login</a>
            <a class="" href="/userRegistration">Register</a>
        </div>
    `;
    
    const VerifyOTP = document.getElementById('Verify-OTP');
    VerifyOTP.addEventListener('click', (event) => {
        event.preventDefault();
        VerifyOTP.disabled = true;
        const OTP = document.getElementById('typeOTP').value;

        fetch('/admin/verify-admin-forgot-password-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ otp: OTP })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            VerifyOTP.textContent = data.message;
            VerifyOTP.style.backgroundColor = "green";
            VerifyOTP.disabled = false;
            changePassword(); 
        })
        .catch(error => {
            console.error('There was a problem with your request:', error);
        });
    });
}

function changePassword() {
    const cardBody = document.querySelector('.card-body');

    cardBody.innerHTML = `
    <p class="card-text py-2">
    Please set your new password. 
    Your password must contain at least one of the following special characters: @, #, ' (single quote), or ".
    </p>

        <div class="form-outline">
            <input type="text" placeholder="Enter New Password" id="type-new-password-1" class="form-control my-3" />
        </div>
        <div class="form-outline">
            <input type="text" placeholder="Enter Confirm Password" id="type-new-password-2" class="form-control my-3" />
        </div>
        <a href="#" class="btn btn-primary w-100" id="change-Password">Change Password</a>
        <div class="d-flex justify-content-between mt-4">
            <a class="" href="/login">Login</a>
            <a class="" href="/userRegistration">Register</a>
        </div>
    `;
    const password1 = document.getElementById('type-new-password-1');
    const password2 = document.getElementById('type-new-password-2');
    const changePasswordButton = document.getElementById('change-Password');

    changePasswordButton.addEventListener('click', async (event) => {
        event.preventDefault();
        changePasswordButton.disabled = true;
        changePasswordButton.textContent = 'Changing your Password...';
        await submitPassword();
    });

    password1.addEventListener('click', () => {
        changePasswordButton.textContent = 'Change Password';
        changePasswordButton.style.backgroundColor = '';
    });

    password2.addEventListener('click', () => {
        changePasswordButton.textContent = 'Change Password';
        changePasswordButton.style.backgroundColor = '';
    });

    async function submitPassword() {
        const newPassword1 = password1.value;
        const newPassword2 = password2.value;

        if (newPassword1 !== newPassword2) {
            changePasswordButton.textContent = 'Passwords do not match. Please try again.';
            changePasswordButton.style.backgroundColor = 'red';
            return;
        }

        const response = await fetch('/admin/change-admin-password-reset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password: newPassword1 })
        });

        const data = await response.json();
        if (data.message && data.success) {
            changePasswordButton.textContent = data.message + " Redirecting...";
            changePasswordButton.style.backgroundColor = 'green';
           await Redirecting();
            
        } else if (data.success === false) {
            changePasswordButton.textContent = data.message;
            changePasswordButton.style.backgroundColor = 'red';
        } else {
            changePasswordButton.textContent = data.error;
            changePasswordButton.style.backgroundColor = 'red';
        }
    }
}
async function Redirecting()
{
     window.location.href ='/admin/AdminHomePage';
}

document.addEventListener('contextmenu', event => event.preventDefault());



