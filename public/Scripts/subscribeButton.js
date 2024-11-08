const subscribeButton = document.getElementById("subcribe-button");
const emailInput = document.getElementById("Newsletter");

emailInput.addEventListener('click', () => {
    subscribeButton.textContent = 'Subscribe';
    subscribeButton.style.background = '';
});

subscribeButton.addEventListener("click", function() {
    if (!validateEmail(emailInput.value)) {
        subscribeButton.textContent = 'invalid email address';
        subscribeButton.style.background = 'red';
        return;
    }
    subscribeButton.textContent = "Subscribing";
    subscribeToNewsletter(emailInput.value);
});

function validateEmail(email) {
    const emailRegex = /^\S+@\S+\.\S+$/;
    return emailRegex.test(email);
}

function subscribeToNewsletter(email) {
    fetch('/subscribe', {
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
        if (data.message) {
            subscribeButton.textContent = data.message;
            subscribeButton.style.backgroundColor = "green";
        } else if (data.error) {
            subscribeButton.textContent = data.error;
            subscribeButton.style.backgroundColor = "red";
        }
    })
    .catch(error => {
        subscribeButton.textContent = "Error: " + error.message;
        subscribeButton.style.backgroundColor = "red";
        console.error('There was a problem with your fetch operation:', error);
    });
}
