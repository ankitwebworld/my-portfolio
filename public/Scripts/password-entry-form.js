document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formid');

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const PhoneNoInput = document.getElementById('PhoneNo');
        const feedbackMessage = document.getElementById('error-message');
        const button = document.querySelector('[type="submit"]');
        if (passwordInput.value !== confirmPasswordInput.value) {
            feedbackMessage.textContent = 'Passwords do not match';
            event.preventDefault(); 
            return;
        }

        const data = {
            password: passwordInput.value,
            PhoneNo: PhoneNoInput.value,
        };

        fetch('/enter-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to submit password');
            }
           return response.json();
        })
        .then(data=>{
            if(data.message)
            {
                feedbackMessage.textContent =data.message;
                button.innerHTML = '<a href="/userhomepage">Go To Home Page</a>'
            }
        })
        .catch(error => {
            console.error('Error submitting password:', error);
            feedbackMessage.textContent =error.message || error.message || error;
            
        });
    });
});
