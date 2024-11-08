document.addEventListener("DOMContentLoaded", (e) => {
    const container = document.querySelector(".container");
    const feedback = document.getElementById("feedback");

    fetch("/admin/getAdminInfo", {
        method: "GET",
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((data) => {
            container.innerHTML = dataSet(data);
            setupShowOptionListeners();
        })
        .catch((error) => {
            console.error('Error:', error);
            feedback.textContent = error;
        });

    function dataSet(data) {
        if (!Array.isArray(data)) {
            return `<p>No data available</p>`;
        }

        return `
        <div class="userData">
            ${data.map((element) => `
                <div class="block">
                    <p class="nameingSection">Name: ${element.Fname} ${element.Lname}</p>
                    <p class="IdSection">User Id: ${element.userId}</p>
                    <button class="showOptionBtn">Show Option</button>
                    <form class="adminData hidden">
                        <input type="text" name="userId" value="${element.userId}" class="invalid-input" disabled>
                        <input type="text" name="password" class="invalid-input" placeholder="New Password">
                        <button type="button" class="sendOtpBtn">Send OTP</button>
                        <p class="message"></p>
                        <div class ="afterSendingOtp" >
                            <form class="afterSendingOtpVisibleForm">
                                <input type="text" name="otp" placeholder="Enter OTP">
                                <input type="button" class="submitOtp" value="Change Password">
                               
                                <p class="message"></p>
                            </form>
                        </div>
                    </form>
                </div>
            `).join('')}
        </div>`;
    }

    function setupShowOptionListeners() {
        const showOptionBtns = document.querySelectorAll('.showOptionBtn');
        showOptionBtns.forEach((btn) => {
            btn.addEventListener('click', toggleAdminDataVisibility);
        });
        const sendOtpBtns = document.querySelectorAll('.sendOtpBtn');
        sendOtpBtns.forEach((btn) => {
            btn.addEventListener('click', sendOtp);
        });
        const afterSendingOtpVisibleForm = document.querySelectorAll('.submitOtp');
        afterSendingOtpVisibleForm.forEach((form) => {
            form.addEventListener('click', AfterSentOtpForChangePassword);
        });

        
    }

    function toggleAdminDataVisibility(event) {
        const adminDataForm = event.target.nextElementSibling;
        adminDataForm.classList.toggle('visible');
        event.preventDefault();
    }

    function sendOtp(event) {
        const userIdInput = event.target.parentElement.querySelector('input[name="userId"]');
        const passwordInput = event.target.parentElement.querySelector('input[name="password"]');
        const messageElement = event.target.parentElement.querySelector('.message');
        const afterSendingOtp = event.target.parentElement.querySelector('.afterSendingOtp');
        event.preventDefault();  // Prevent the default form submission
        if (validateForm(userIdInput.value, passwordInput.value)) {
            submitForm();
        }
    
        function submitForm() {
            const formData = {
                userId: userIdInput.value,
                password: passwordInput.value
            };
    
            fetch('/admin/sendOtp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData),
            })
                .then(response => response.json())
                .then(data => {
                    afterSendingOtp.style.display = "block";
                    Timeout(data.message);
                })
                .catch(error => {
                    console.error('Error submitting form', error);
                    Timeout(error);
                });
    
            function Timeout(message) {
                messageElement.style.display = "block";
                messageElement.textContent = `${message} in ${userIdInput.value}`;
                setTimeout(() => {
                    messageElement.style.display = "none";
                    messageElement.textContent = "";
                }, 3000);
            }
        }
    }
    


    function AfterSentOtpForChangePassword(event) {
        // Prevent the default form submission
        event.preventDefault();
    
        const otpInput = event.target.parentElement.querySelector('input[name="otp"]');
        const messageElement = event.target.parentElement.querySelector('.message');
        
        
        const formData = { otp: otpInput.value };
        console.log(formData)
        if (otpInput.value.trim() !== "") {
            submitOtp();
        }
    
        function submitOtp() {
            fetch('/admin/verifyOtp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData),
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    Timeout(data.message);
                })
                .catch(error => {
                    console.error('Error submitting form', error);
                    Timeout(error);
                });
    
            function Timeout(message) {
                messageElement.style.display = "block";
                messageElement.textContent = message;
                setTimeout(() => {
                    messageElement.style.display = "none";
                    messageElement.textContent = "";
                   window.location.reload();
                }, 3000);
            }
        }
    }
    
    
    

    function validateForm(userId, otp) {
        const firstInvalidInput = document.querySelector('.invalid-input');

        if (userId.trim() === '' || otp.trim() === '') {
            firstInvalidInput.focus();
            return false;
        }

        return true;
    }
});
