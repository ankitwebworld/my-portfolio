document.addEventListener('DOMContentLoaded', (event) => {
    fetch('/admin/viewAllVideoCallRequestData', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({}) // If you need to send any data in the request body, include it here
    })
    .then(response => response.json())
    .then(data => VideoCallData(data));
});

function VideoCallData(data) {
    const container = document.getElementById('videoCallList');
    container.innerHTML = ''; // Clear previous data

    if (data.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No video call requests found.';
        container.appendChild(li);
        return;
    }

    data.forEach(request => {
        const li = document.createElement('li');
        li.innerHTML = `            
            <span class="user-name">User Name: ${request.requesterFirstName} ${request.requesterLastName}</span>
            <span class="user-email">User Email: ${request.userEmail}</span> 
            <span class="request-id">Request ID: ${request.requestId}</span>
            <span class="timing">Timing: ${request.timing}</span>
            <span class="status">Status: ${request.status}</span>
            <span class="request-date">Request Date: ${request.requestDate}</span>
            <span class="schedule-info">Scheduled Time: ${request.rescheduledTiming ? request.rescheduledTiming : 'no reschedule Timing'}</span>
            <div class="button-group">
                <button class="accept-btn" type="button">Action on Request</button>
                <button class="join-btn" type="button"><a href="/joinvideocall/${request.userEmail}/${request.requestId}" target="_blank">Join Video Call</a></button>
                <button class="reschedule-btn" type="button">Reschedule Video Call</button>
            </div>
            <form class="request-form" style="display:none">

                <input type="hidden"  name="requestId" value="${request.requestId}">
                <div class="box">
                <input type="radio"  name="status" value="Accepted">
                <label for="accept">Accept</label><br></div>
               <div class="box"> <input type="radio"  name="status" value="Pending">
                <label for="pending">Pending</label><br></div>
               <div class="box"> <input type="radio"  name="status" value="Declined">
                <label for="decline">Decline</label><br></div>
                <button type="submit">Submit</button>
            </form>

            <form class="reschedule-form" style="display:none">
                <input type="hidden"  name="requestId" value="${request.requestId}">
                <label for="newTiming">New Timing:</label>
                <input type="datetime-local" name="newTiming" required>
                <button type="submit">Reschedule</button>
            </form>
        `;
        
        container.appendChild(li);

        // Add event listeners to the buttons and forms
        const buttonGroup = li.querySelector('.button-group');
        const acceptBtn = buttonGroup.querySelector('.accept-btn');
        const rescheduleBtn = buttonGroup.querySelector('.reschedule-btn');
        const requestForm = li.querySelector('.request-form');
        const rescheduleForm = li.querySelector('.reschedule-form');

        acceptBtn.addEventListener('click', () => {
            requestForm.style.display = 'block';
            rescheduleForm.style.display = 'none';
        });

        rescheduleBtn.addEventListener('click', () => {
            requestForm.style.display = 'none';
            rescheduleForm.style.display = 'block';
        });

        // Handle form submissions
        requestForm.addEventListener('submit', handleAcceptSubmit);
        rescheduleForm.addEventListener('submit', handleRescheduleSubmit);
    });
}

function handleAcceptSubmit(event) {
    event.preventDefault(); // Prevent the default form submission

    const formData = new FormData(event.target);
    const status = formData.get('status');
    const requestId = formData.get('requestId');
    const button = event.target.querySelector('button');

    button.textContent = 'Submitting...';
    button.disabled = true;

    fetch('/admin/actionOnVideoCallRequest', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, requestId }) 
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Error accepting video call request.');
        }
    })
    .then(data => {
        console.log(data.message);
        button.textContent = data.message;
        button.disabled = false;
    })
    .catch(error => {
        console.error('Error:', error);
        button.textContent = 'Error submitting';
        button.disabled = false;
    });
}

function handleRescheduleSubmit(event) {
    event.preventDefault(); // Prevent the default form submission

    const formData = new FormData(event.target);
    const newTiming = formData.get('newTiming');
    const requestId = formData.get('requestId');
    const button = event.target.querySelector('button');

    button.textContent = 'Submitting...';
    button.disabled = true;

    fetch('/admin/actionOnVideoCallRequest', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newTiming, requestId }) 
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Error rescheduling video call request.');
        }
    })
    .then(data => {
        console.log(data.message);
        button.textContent = data.message;
        button.disabled = false;
    })
    .catch(error => {
        console.error('Error:', error);
        button.textContent = 'Error submitting';
        button.disabled = false;
    });
}

