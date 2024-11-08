document.getElementById('loginButton').addEventListener('click', function (e) {
    e.preventDefault();
    loginUser();
});

function loginUser() {
    const userId = document.getElementById('userId').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('message');
    const loading = document.querySelector('.loading');
    loading.style.display = 'block';
    const formData = {
        userId,
        password
    };

    fetch('/userLogin', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
    })
        .then(response => response.json())
        .then(data => {
            errorMessage.style.display = 'block';

            switch (data.status) {
                case 200:
                    loading.style.display = 'block';
                    errorMessage.textContent = data.message || 'Login successful.';
                    location.href = "/admin/AdminHomePage";
                    break;
                case 400:
                case 404:
                    errorMessage.textContent = data.message || 'Login failed.';
                    break;
                default:

                    errorMessage.textContent = 'Login failed.';
            }

            setTimeout(() => {
                errorMessage.style.display = 'none';
                loading.style.display = 'none';
            }, 3000);
        })
        .catch(error => {
            errorMessage.style.display = 'block';
            errorMessage.innerText = error.message;
            setTimeout(() => {
                loading.style.display = 'none';
                errorMessage.style.display = 'none';
            }, 3000);
        });
}

const loginText = document.querySelector(".title-text .login");
const loginForm = document.querySelector("form.login");
const loginBtn = document.querySelector("label.login");
const signupBtn = document.querySelector("label.signup");

loginForm.style.marginLeft = "-50%";
loginText.style.marginLeft = "-50%";


signupBtn.onclick = () => {
    loginForm.style.marginLeft = "-50%";
    loginText.style.marginLeft = "-50%";
};

loginBtn.onclick = () => {
    loginForm.style.marginLeft = "0%";
    loginText.style.marginLeft = "0%";
};




document.getElementById('normal-user-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const userId = document.getElementById('normalUserId');
    const password = document.getElementById('normalUserPassword');
    const message = document.getElementById('normal-user-submit');

    message.value = "Loading...."
    message.style.background = "green"

    const userUrl = '/normalUserLogin';

    const formData = {
        userId: userId.value.trim(),
        password: password.value.trim()
    };

    const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
    };

    if (verify()) {
        fetch(userUrl, options)
            .then(response => response.json())
            .then(data => {
                message.value = data.message;
                message.style.background = "green"
                if (data.status == 200) {
                    window.location.href = '/userhomepage';
                    message.style.background = "";
                    message.value = "Login";
                }

            })
            .catch(error => {
                console.error('Error:', error);
                message.value = error.message;
                message.style.background = "red"
            });
    }

    function verify() {
        if (userId.value.trim() !== "" && password.value.trim() !== "") {
            return true;
        } else {
            password.style.border = '2px solid red'
            userId.style.border = '2px solid red'
            message.value = "Enter the fields";
            message.style.background = "red"
            return false;
        }
    }
});







document.getElementById('normalUserId').addEventListener('click', (event) => {
    const message = document.getElementById('normal-user-submit');
    const userId = document.getElementById('normalUserId');
    const password = document.getElementById('normalUserPassword');

    password.style.border = ''
    userId.style.border = ''

    message.value = "Login";
    message.style.background =""
})
document.getElementById('normalUserPassword').addEventListener('click', (event) => {
    const message = document.getElementById('normal-user-submit');
    const userId = document.getElementById('normalUserId');
    const password = document.getElementById('normalUserPassword');

    password.style.border = ''
    userId.style.border = ''

    message.value = "Login";
    message.style.background =""
})



document.addEventListener('DOMContentLoaded', (event) => {
    const userId = document.getElementById('normalUserId');
    if (!userId) {
        console.error("Element with ID 'normalUserId' not found.");
        return;
    }

    const userUrl = '/normalUserLoginPutEmail';

    const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    };
    fetch(userUrl, options)
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch user email');
        }
        return response.json();
    })
    .then(data => {
        if (!data || !data.email) {
            throw new Error('Invalid response from server');
        }
        userId.value = data.email.trim();
    })
    .catch(error => {
        console.error('Error fetching user email:', error);
     });
});
