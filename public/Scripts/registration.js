
document.getElementById('submitButton').addEventListener('click', function () {
    submitForm();
});
    
function submitForm() {
        const userId = document.getElementById('userId').value;
        const password = document.getElementById('password').value;
        const accessKey = document.getElementById('accessKey').value;
        const Fname = document.getElementById('Fname').value;
        const Lname = document.getElementById('Lname').value;
        const success = document.getElementById('success');

        const formData = {
            userId,
            password,
            Fname,
            Lname,
            accessKey
        };

        fetch('/userRegistration', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        })
        .then(response => {
            return response.json();
        })
        .then(data => {
            if (data.message) {
                success.style.display = "block";
                success.innerText = data.message;
            } else {
                success.style.display = "block";
                success.innerText = data.message;
            }
        })
        .catch(error => {
            console.error(error);
            success.innerText = error.message;
        });
}

