function validateForm() {
  
    const errorElements = document.querySelectorAll('.error');
    errorElements.forEach(element => element.textContent = '');

    const senderUsername = document.getElementById('senderUsername').value.trim();
    const senderProfilePicture = document.getElementById('senderProfilePicture').value.trim();
    const action = document.getElementById('action').value.trim();
    const target = document.getElementById('target').value.trim();
    const message = document.getElementById('message').value.trim();
    const featureImage = document.getElementById('featureImage').value.trim();

    let isValid = true;

    if (senderUsername === '') {
      document.getElementById('senderUsernameError').textContent = 'Sender Username is required';
      isValid = false;
    }

    if (senderProfilePicture === '') {
        document.getElementById('senderProfilePictureError').textContent = 'Sender Profile Picture URL is required';
        isValid = false;
    }

    if (action === '') {
      document.getElementById('actionError').textContent = 'Action is required';
      isValid = false;
    }

    if (target === '') {
      document.getElementById('targetError').textContent = 'Target is required';
      isValid = false;
    }

    if (message === '') {
      document.getElementById('messageError').textContent = 'Message is required';
      isValid = false;
    }

    if (featureImage === '') {
      document.getElementById('featureImageError').textContent = 'Feature Image URL is required';
      isValid = false;
    }
   

    // Submit the form if valid
    if (isValid) {
        // Prepare data object to send to the backend
        const formData = {
          sender: {
            username: 'admin', // Assuming sender is always 'admin'
            profilePicture: senderProfilePicture,
          },
          action: action,
          target: target,
          message: message,
          featureImage: featureImage,
          createdAt: createdAt || null,
          read: read || false, 
        };
    
        fetch('/admin/addNotifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            console.log('Notification submitted successfully:', data);
          })
          .catch(error => {
            console.error('Error submitting notification:', error);
          });
      }
      
  }

  document.addEventListener('DOMContentLoaded', function() {
    const notificationForm = document.getElementById('notificationForm');

    // Attach the validateForm function to the form submission
    notificationForm.addEventListener('submit', function(event) {
      event.preventDefault(); // Prevent the default form submission
      validateForm(); 
    });
  });

  document.addEventListener('contextmenu', event => event.preventDefault());