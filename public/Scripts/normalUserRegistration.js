document.getElementById("userAccountRegistration").addEventListener("submit", function (event) {
    event.preventDefault();

    var firstName = document.getElementById("Fname").value;
    var lastName = document.getElementById("Lname").value;
    var phoneNumber = document.getElementById("userId").value;
    var email = document.getElementById("email").value;
    var password = document.getElementById("password1").value;
    var confirmPassword = document.getElementById("password2").value;
    var submitButton = document.getElementById("submit");

    if (!verify()) {
        submitButton.value = "please fill the information";
        submitButton.style.background = 'red';
        return;
    }

    submitButton.value = "Loading...";

    const formData = {
        firstName,
        lastName,
        phoneNumber,
        email,
        password
    };

    fetch('/userAccountRegistration', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            submitButton.value = data.message;
            submitButton.style.background = 'green';
            document.getElementById("userAccountRegistration").reset();
            if(data.token)
            {
                window.location.href="/userhomepage";
                submitButton.style.background = 'linear-gradient(to right, #2980b9, #34495e)';
            }
        } else {
            submitButton.value = "Error in server";
            submitButton.style.background = 'red';
        }
    })
    .catch(error => {
        submitButton.value = error.message;
        submitButton.style.background = 'red';
    });

    function verify() {
        const pass1 = document.getElementById('password1');
        const pass2 = document.getElementById('password2');
        const  firstName = document.getElementById("Fname");
        const phoneNumber = document.getElementById("userId");
        const email = document.getElementById("email");
        const message = document.querySelector('.pass-message');
     
        if (pass1.value.trim() == '' || pass2.value.trim() == '') {
            pass1.style.border = '3px solid red';
            pass2.style.border = '3px solid red';
            message.style.color = 'red';
            message.textContent = "password field is blank";
            return false;
        } else if (pass1.value.trim() !== pass2.value.trim()) {
            pass1.style.border = '2px solid red';
            pass2.style.border = '2px solid red';
            message.style.color = 'red';
            message.textContent = "Passwords do not match";
            return false;
        } 
         else if (firstName.value.trim() ==''  ) {
            firstName.style.border = '2px solid red';
            message.style.color = 'red';
            message.textContent = "First Name is blank";
            return false;
        } 
         else if (phoneNumber.value.trim() ==''  ) {
            phoneNumber.style.border = '2px solid red';
            message.style.color = 'red';
            message.textContent = "Phone Number is blank";
            return false;
        } 
         else if (email.value.trim() ==''  ) {
            email.style.border = '2px solid red';
            message.style.color = 'red';
            message.textContent = "Email Name is blank";
            return false;
        } else {
            pass1.style.border = '';
            pass2.style.border = '';
            pass1.innerHTML = "";
            return true;
        }
    }
    
    
});


document.getElementById('googleSignInButton').addEventListener('click', async () => {
    try {
        window.location.href = '/auth/google';
    } catch (error) {
        console.error('Error signing in with Google:', error);
        
    }
});



