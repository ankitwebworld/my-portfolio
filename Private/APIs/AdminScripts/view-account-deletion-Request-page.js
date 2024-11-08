window.onload = () => {
    fetchUserData();

    document.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        if (event.target.classList.contains('delete-account-form')) {
            const formData = new FormData(event.target);
            const userId = formData.get('userId');
            const deletePermanent = formData.has('deletePermanent');
            const removeFromDelete = formData.has('removeFromDelete');
            const button = event.target.querySelector('[type="submit"]')
           
            
    
            try {
                const response = await fetch('/admin/delete-user-account', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ userId, deletePermanent, removeFromDelete })
                });
    
                if (!response.ok) {
                    throw new Error('Failed to delete account');
                }
    
                const responseData = await response.json();
                if (responseData.message) {

                   button.textContent = responseData.message;
                    fetchUserData(); 
                }
            } catch (error) {
                console.error('Error deleting account:', error);
                alert('Failed to delete account. Please try again later.');
            }
        }
    });
    
};

async function fetchUserData() {
    try {
        const response = await fetch('/admin/view-account-deletion-requests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
       
            renderUserData(data);
        
        
    } catch (error) {
        console.error('Error fetching user data:', error);
        alert('Failed to fetch user data. Please try again later.');
    }
}

function renderUserData(users) {
    const container = document.querySelector('.container');
    container.innerHTML = '';

    if (users && users.length > 0) {
        users.forEach(user => {
            const userElement = document.createElement('div');
            userElement.classList.add('user-deletion-data');
            userElement.innerHTML = `
            <p>User ID: ${user.userId}</p>
            <p>Email: ${user.email}</p>
            <p>First Name: ${user.Fname}</p>
            <p>Last Name: ${user.Lname}</p>
            <p>Phone Number: ${user.userDetails.phoneNumber}</p>
            <p>Delete Request: ${user.deletionRequest.deleteRequest ? 'Yes' : 'No'}</p>
            <p>Delete Request Date: ${user.deletionRequest.deleteRequestDate ? new Date(user.deletionRequest.deleteRequestDate).toLocaleString() : 'Not specified'}</p>
            <p>Delete Request Reason: ${user.deletionRequest.deleteRequestReason || 'Not specified'}</p>
            <p>Account Deleted: ${user.deletionRequest.accountDeleted ? 'Yes' : 'No'}</p>
            ${user.deletionRequest.deleteRequestDate ? `<p>Remaining Days for Deletion: ${calculateRemainingDays(new Date(user.deletionRequest.deleteRequestDate))}</p>` : ''}
            
            <form class="delete-account-form">
                <input type="hidden" name="userId" value="${user._id}">
                <label for="deletePermanent">Delete Permanently</label>
                <input type="checkbox" name="deletePermanent">
                <br>
                <label for="removeFromDelete">Remove from Delete List</label>
                <input type="checkbox" name="removeFromDelete">
                <br>
                <button type="submit">Delete Account</button>
            </form>

        
            `;
            container.appendChild(userElement);

             // Attach event listeners for checkboxes within the current form
             const deletePermanentCheckbox = userElement.querySelector('input[name="deletePermanent"]');
             const removeFromDeleteCheckbox = userElement.querySelector('input[name="removeFromDelete"]');
             
             deletePermanentCheckbox.addEventListener('change', () => {
                 if (deletePermanentCheckbox.checked) {
                     removeFromDeleteCheckbox.checked = false;
                 }
             });
 
             removeFromDeleteCheckbox.addEventListener('change', () => {
                 if (removeFromDeleteCheckbox.checked) {
                     deletePermanentCheckbox.checked = false;
                 }
             });
          
        });
    } else {
        const messageElement = document.createElement('p');
        messageElement.textContent = 'No account deletion requests found.';
        container.appendChild(messageElement);
    }
}



function calculateRemainingDays(deleteRequestDate) {
    const currentDate = new Date();
    const remainingTime = deleteRequestDate.getTime() + (15 * 24 * 60 * 60 * 1000) - currentDate.getTime();
    const remainingDays = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));
    return remainingDays > 0 ? remainingDays : 0;
}


