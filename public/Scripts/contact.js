document.getElementById("submit").addEventListener("click", (e) => {
    e.preventDefault();

    // Get form data
    const name = document.getElementById("name").value.trim();
    const address = document.getElementById("address").value.trim();
    const phoneNo = document.getElementById("phoneNo").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const message = document.getElementById("message").value.trim();
    
    const purpose = "contact";
    const responceMessage = document.getElementById("responce-message");

    const formData = {
        name, address, phoneNo, subject, message,purpose
    };

    // Configure fetch request
    const url = "/contactus";
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    };

    // Make fetch request
    fetch(url, options)
    .then(response => response.json())
    .then(data => {
        timeout(data.message);
    })
    .catch(error => {
        console.error('Error:', error);
        timeout("An error occurred while submitting the message.");
    });

    function timeout(comeingMessage)
    {   responceMessage.style.display= "block"
        responceMessage.textContent = comeingMessage;
        setTimeout(()=>{
            responceMessage.style.display= "none"
        },3000);
    }
});


document.addEventListener('contextmenu', event => event.preventDefault());