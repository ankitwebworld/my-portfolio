window.onload = () => {
    fetch('/admin/newsletter-subscribers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        const subscriberList = document.getElementById('subscriberList');
        // Generate HTML for each subscriber
        const subscribersHTML = data.map(subscriber => `
            <div class="subscriber">
                <p>Email: ${subscriber.email}</p>
                <p>Subscribed At: ${new Date(subscriber.subscribedAt).toLocaleString()}</p>
                <p>Active: ${subscriber.isActive ? 'Yes' : 'No'}</p>
            </div>
        `).join('');
        // Append subscribers HTML to the subscriberList element
        subscriberList.innerHTML = subscribersHTML;
    })
    .catch(error => {
        console.error('Error fetching subscribers:', error);
        subscriberList.innerHTML = `<p>${error.message}</p>`;
    });
};

document.getElementById('subscriber-form-button').addEventListener('click', (event) => {
    const subscribersForm = document.getElementById('subscribers-news-form');
    subscribersForm.style.display = (subscribersForm.style.display === 'block') ? 'none' : 'block';
    const restrictForm = document.getElementById('restrict-subscriber-news-form');
    restrictForm.style.display = 'none'; // Hide the other form
});

document.getElementById('restrict-subscriber').addEventListener('click', (event) => {
    const restrictForm = document.getElementById('restrict-subscriber-news-form');
    restrictForm.style.display = (restrictForm.style.display === 'block') ? 'none' : 'block';
    const subscribersForm = document.getElementById('subscribers-news-form');
    subscribersForm.style.display = 'none'; // Hide the other form
});



document.getElementById('newsForm').addEventListener('submit',(event)=>{
    event.preventDefault();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();
    const style = document.getElementById('style').value.trim();
    
  const button = event.target.querySelector('[ type="submit"]');
  button.textContent = "Sending...";
        fetch('/admin/post-newsletter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body:JSON.stringify({subject,message,style})
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if(data && data.message)
            {
                button.textContent = data.message
            }
            else{
                button.textContent = data.message || data.error
            }
        })
        .catch(error => {
            console.error('Error fetching subscribers:', error);
            button.textContent = error.message || error.error;
        });
  
    

});

document.getElementById('restrict-newsForm').addEventListener('submit', (event) => {
    event.preventDefault();

    const userIdInput = document.getElementById('userId');
    const allowOrRestrictInput = document.getElementById('allow-or-restrict');
    let allowOrRestrict = allowOrRestrictInput.value === "true"; 
    const button = event.target.querySelector('[type="submit"]');
    if(allowOrRestrict)
    {
        button.textContent = "allowing....";
    }
    else{
       button.textContent = "Restricting...";
    }
    
    userIdInput.addEventListener('click', () => {
        resetButton(button);
    });

    if (userIdInput.value.trim() === '') {
        displayErrorMessage(button, "Enter User Id");
        return;
    }

    

    fetch(`/admin/restrict-form-news-or-allow`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ allowOrRestrict,userId:userIdInput.value.trim() })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data && data.message) {
            button.textContent = data.message;
        } else {
            button.textContent = data.message || data.error;
        }
    })
    .catch(error => {
        console.error('Error fetching subscribers:', error);
        button.textContent = error.message || error.error;
    });
});

function resetButton(button) {
    button.textContent = "Send";
    button.style.background = "";
}

function displayErrorMessage(button, message) {
    button.textContent = message;
    button.style.background = "red";
}

