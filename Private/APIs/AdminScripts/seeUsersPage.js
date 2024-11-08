window.onload = (event) => {
    fetch('/admin/seeUserList', {
        method: 'GET'
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then((data) => {
        showDataInPage(data);
        actionListener(); // Call actionListener after rendering the data
    })
    .catch((error) => {
        console.error(error);
    });
};

function showDataInPage(data) {
    const container = document.querySelector('.left-container-user-data');  
    if (data && data.length > 0) {
        container.innerHTML = data.map(element => `
            <form class="box">
                <p class="Fname">First Name: ${element.Fname}</p>
                <p class="Lname">Last Name: ${element.Lname}</p>
                <p class="userId">User ID: ${element.userId}</p>
                <p style="display : none" class="userIdElement">${element.userId}</p>
                <p style="display : none" class="emailIdElement">${element.email}</p>
                <p class="email">Email ID: ${element.email}</p>
                <p class="verifiedByGoogle">Verified By Google: ${element.verifiedByGoogle ? 'Yes' : 'No'}</p>
                <button class="view-more-button">View More</button>
            </form>`
        ).join('');
    } else {
        container.innerHTML = `<p>Data is not available</p>`;
    }
}

document.getElementById('getUserInfo').addEventListener('submit', (event) => {
    event.preventDefault();
    const userId = event.target.querySelector('[name="userId"]').value; 
    const userEmail = event.target.querySelector('[name="userEmail"]').value;
    getInfo(userId, userEmail);
});

document.getElementById('getUserInfo').querySelector('[value="Update"]').addEventListener('click', (event) => {
    event.preventDefault();
    const userId = event.target.closest('form').querySelector('[name="userId"]').value; 
    const userEmail = event.target.closest('form').querySelector('[name="userEmail"]').value;
    updateUserInfo(userId, userEmail);
   
});









function actionListener() { 
    document.querySelectorAll('.box').forEach(element => {
        const viewMoreButton = element.querySelector('.view-more-button');
        if (viewMoreButton) {
          
            viewMoreButton.addEventListener('click', (e) =>{
                e.preventDefault();
                const userId = element.querySelector('.userIdElement').textContent;
                const emailId = element.querySelector('.emailIdElement').textContent;
                getInfo(userId,emailId)
            })
        } else {
            console.log('.view-more-button element not found');
        }
    });
}

function getInfo(userId,emailId)   
   {
   
    const frameDiv = document.getElementById('show-data');
    fetch('/admin/getUserInfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({userId,emailId})
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(user => {

        frameDiv.innerHTML = showUserInfo(user);
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
        frameDiv.innerHTML = 'Error fetching user data.';
      });
};
  
function updateUserInfo(userId,emailId)  {
    const frameDiv = document.getElementById('show-data');
    fetch('/admin/getUserInfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({userId,emailId})
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(user => {
        frameDiv.innerHTML = updateInfo(user);
        actions(userId,emailId);
        // menuHideShow();
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
        frameDiv.innerHTML = 'Error fetching user data.';
      });
};

function showUserInfo(user) {
    return `
      <div class="user-info">
      <div class="user-data user-data-inner">
        
            <strong>User ID:</strong>  <p>${user.userId || 'N/A'} </p>
            <strong>Email:</strong> <p> ${user.email || 'N/A'} </p>
            <strong>Name:</strong> <p>${user.Fname} ${user.Lname || 'N/A'} </p>
            <strong>Verified by Google:</strong> <p>${user.verifiedByGoogle ? 'Yes' : 'No'} </p>
        
      </div>
        <h2>Other Details</h2>
            <div class="user-data user-data-inner">
                  <strong>Bio:</strong> <p>${user.userDetails.bio || 'N/A'}</p>
                  <strong>Date of Birth:</strong><p> ${user.userDetails.dateOfBirth ? formatToISODate(user.userDetails.dateOfBirth) : 'N/A'}</p>
                  <strong>Phone Number:</strong><p> ${user.userDetails.phoneNumber || 'N/A'}</p>
            </div>
  
        <h3>Address</h3>
        <div class="user-data user-data-inner">
            <strong>Street:</strong> <p>${user.userDetails.address ? user.userDetails.address.street || 'N/A' : 'N/A'}</p>
            <strong>City:</strong> <p>${user.userDetails.address ? user.userDetails.address.city || 'N/A' : 'N/A'}</p>
            <strong>State:</strong> <p>${user.userDetails.address ? user.userDetails.address.state || 'N/A' : 'N/A'}</p>
            <strong>Postal Code:</strong> <p>${user.userDetails.address ? user.userDetails.address.postalCode || 'N/A' : 'N/A'}</p>
        </div>
        <h3>Interests</h3>
        <div class="user-data user-data-inner">
            <strong>Interests:</strong> <p>${user.userDetails.interests.length > 0 ? user.userDetails.interests.join(', ') : 'N/A'}</p>
        </div>
    
        <h3>Education</h3>
        <div class="user-data ">
            ${user.userDetails.education.map(edu => `
                <div class="user-data-inner">
                    <strong>Institution:</strong> <p>${edu.institution || 'N/A'}</p>
                    <strong>Degree:</strong> <p>${edu.degree || 'N/A'}</p>
                    <strong>Graduation Year:</strong> <p>${edu.graduationYear || 'N/A'}</p>
                </div>
                <hr>
            `).join('')}
        </div>
  
        
        <h3>Skill Set</h3>
        <div class="user-data user-data-inner">
                <strong>Skill Set:</strong> 
                <p>${user.userDetails.skillSet.length > 0 ? user.userDetails.skillSet.join(', ') : 'N/A'}</p>
           
        </div>
  
        <h3>Work Experience</h3>
          <div class="user-data">
          ${user.userDetails.workExperience.map(exp => `
            <div class="user-data-inner">
                <strong>Company:</strong> ${exp.company || 'N/A'}<br>
                <strong>Position:</strong> ${exp.position || 'N/A'}<br>
                <strong>Start Date:</strong> ${exp.startDate ? formatToISODate(exp.startDate) : 'N/A'}<br>
                <strong>End Date:</strong> ${exp.endDate ? formatToISODate(exp.endDate) : 'N/A'}
              </div>
              <hr>
            `).join('')}
          </div>
        
        <h3>Certifications</h3>
        <div class="user-data user-data-inner">
        <strong>Certifications:</strong> 
        <p>${user.userDetails.certifications.length > 0 ? user.userDetails.certifications.join(', ') : 'N/A'}</p>
    </div>
          
        <h3>Projects</h3>
        <div class="user-data">
      
            ${user.userDetails.projects.map(project => `
                <div class="user-data-inner">
                  <strong>Project Name:</strong> ${project.projectName || 'N/A'}<br>
                  <strong>Description:</strong> ${project.description || 'N/A'}<br>
                  <strong>Start Date:</strong> ${project.startDate ? formatToISODate(project.startDate) : 'N/A'}<br>
                  <strong>End Date:</strong> ${project.endDate ? formatToISODate(project.endDate) : 'N/A'}
                </div>
                <hr>
            `).join('')}
        </div>
  
        
        <h3>Languages</h3>
        <div class="user-data user-data-inner">
        <strong>Languages:</strong><p>
            ${user.userDetails.languages.length > 0 ? user.userDetails.languages.join(', ') : 'N/A'} </p>
    </div>
          
        <h3>Hobbies</h3>
        <div class="user-data user-data-inner">
        <strong>Hobbies:</strong><p>${user.userDetails.hobbies ? user.userDetails.hobbies.join(', ') || 'N/A' : 'N/A'}
        </p>
    </div>
          
        <h3>Social Media</h3>
        <div class="user-data user-data-inner">
        <strong>LinkedIn:</strong>
        <p>
            ${user.userDetails.socialMedia ? user.userDetails.socialMedia.linkedin || 'N/A' : 'N/A'}
        </p>
    
        <strong>Twitter:</strong>
        <p>
            ${user.userDetails.socialMedia ? user.userDetails.socialMedia.twitter || 'N/A' : 'N/A'}
        </p>
    
        <strong>GitHub:</strong>
        <p>
            ${user.userDetails.socialMedia ? user.userDetails.socialMedia.github || 'N/A' : 'N/A'}
        </p>
    </div>
    
        <h3>Personal Website</h3>
        <div class="user-data user-data-inner">
            <strong>Personal Website:</strong>
            <p>${user.userDetails.personalWebsite || 'N/A'}</p>
        </div>
        </div>
    `;
}
  
function actions(userId, emailId) {
 
    updateUserInfo(userId, emailId);
    update_bio_dob_phone(userId, emailId);
    update_address(userId, emailId);
    update_Interests(userId, emailId);
    addEducation(userId, emailId);
    updateEducationReq(userId, emailId);
    updateSkillSet(userId, emailId);
    addWorkExperience(userId, emailId);
    updateWorkExperienceReq(userId, emailId);
    updateCertifications(userId, emailId);
    addProjects(userId, emailId);
    addProjectReq(userId, emailId);
    updateLanguages(userId, emailId);
    updateHobbies(userId, emailId);
    updateSocialMedia(userId, emailId);
    updatePersonalWebsite(userId, emailId);

    function updateUserInfo(userId, emailId) {
        document.getElementById('mainuserinfo').addEventListener('submit', (event) => {
            event.preventDefault();

            const Fname = document.getElementById('Fname').value;
            const Lname = document.getElementById('Lname').value;
            const button = event.target.querySelector('input[type="submit"]');
            button.value = "Updating..";

            if (Fname.trim() !== '') {
                const data = {
                    userId: userId,
                    emailId: emailId,
                    Fname: Fname.trim(),
                    Lname: Lname.trim()
                };

                fetch('/admin/userUpdateInfo', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    })
                    .then(response => {
                        if (!response.ok) {
                            button.value = 'Network response was not ok'
                            throw new Error('Network response was not ok');

                        }
                        return response.json();
                    })
                    .then(data => {
                        button.value = data.message;
                    })
                    .catch(error => {
                        button.value = error;
                        console.error('Error during update:', error);
                    });
            } else {
                document.getElementById('Fname').style.border = '2px solid red';
                button.value = "Update"
            }
        });
    }
    function update_bio_dob_phone(userId, emailId) {
      document.getElementById('update-bio-dob-phone').addEventListener('submit', function (event) {
        event.preventDefault();
        console.log('clokgn')
        const bio = document.getElementById('bio').value;
        const dateOfBirth = document.getElementById('dateOfBirth').value;
        const phoneNumber = document.getElementById('phoneNumber').value;
        const button = event.target.querySelector('input[type="submit"]');
        button.value = "Updating..";
  
        const data = {
            userId,
             emailId,
          bio: bio,
          dateOfBirth: dateOfBirth,
          phoneNumber: phoneNumber
        };
  
        fetch('/admin/userUpdateInfo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })
          .then(response => {
            if (!response.ok) {
              button.value = 'Network response was not ok';
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => {
            button.value = data.message;
          })
          .catch(error => {
            button.value = error.error;
            console.error('Error during update:', error);
          });
      });
    }
  
    function update_address(userId,emailId,) {
      document.getElementById('update-address').addEventListener('submit', function (event) {
        event.preventDefault();
        const street = document.getElementById('street').value;
        const city = document.getElementById('city').value;
        const state = document.getElementById('state').value;
        const postalCode = document.getElementById('postalCode').value;
  
        const button = event.target.querySelector('input[type="submit"]');
        if (button) {
          button.value = "Updating..";
        }
  
        fetch('/admin/userUpdateInfo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId,
             emailId,
            street: street,
            city: city,
            state: state,
            postalCode: postalCode
          })
        })
          .then(response => response.json())
          .then(data => {
            button.value = data.message;
          })
          .catch(error => {
            button.value = error.error;
            console.error('Error updating address:', error);
          });
      });
    }
  
    function update_Interests(userId,emailId,) {
      document.getElementById('update-Interests').addEventListener('submit', function (event) {
        event.preventDefault();
  
        const interestsInput = document.getElementById('interests');
        const updatedInterests = interestsInput.value.split(',').map(interest => interest.trim());
        const button = event.target.querySelector('input[type="submit"]');
        if (button) {
          button.value = "Updating..";
        }
  
        // Update the interests on the server using fetch or another method
        fetch('/admin/userUpdateInfo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId,
             emailId,
            interests: updatedInterests
          })
        })
          .then(response => response.json())
          .then(data => {
            button.value = data.message;
          })
          .catch(error => {
            button.value = error.error;
            console.error('Error updating interests:', error);
          });
      });
    }
  
    function addEducation(userId, emailId) {
        document.getElementById('addEducation').addEventListener('click', addEducationItem);
    
        function addEducationItem() {
            const educationContainer = document.getElementById('educationContainer');
    
            const newEducationForm = document.createElement('form');
    
            newEducationForm.innerHTML = `
                <div class="container-info-2">
                    <label for="institution">Institution:</label>
                    <input type="text" name="institution">
                    
                    <label for="degree">Degree:</label>
                    <input type="text" name="degree">
                    
                    <label for="graduationYear">Graduation Year:</label>
                    <input type="number" name="graduationYear">
                </div> 
                <div class="submit">
                    <input type="submit" value="Add">
                </div>
                <hr>
            `;
    
            newEducationForm.addEventListener('submit', function(event) {
                event.preventDefault();
    
                const inputs = this.querySelectorAll('input[type="text"], input[type="number"]');
                const button = this.querySelector('input[type="submit"]');
                const tap = event.currentTarget.querySelector('.container-info-2');

                let formDataObject = {};
                inputs.forEach(input => {
                    formDataObject[input.name] = input.value.trim();
                });
    
                
               
                if (Object.values(formDataObject).some(value => value === "")) {
                    button.value = "Empty values are not allowed";
                    button.style.backgroundColor = "red";
                    return;
                }
                formDataObject['emailId'] = emailId;
                formDataObject['userId'] = userId;

                tap.addEventListener('click', () => {
                    button.value = "Add";
                    button.style.backgroundColor = "";
                });
    
                fetch('/admin/userUpdateInfo', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(formDataObject),
                    })
                    .then(response => response.json())
                    .then(data => {
                        button.value = "Added";
                        button.disabled = true;
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        button.value = error.error;
                    });
            });
    
            educationContainer.appendChild(newEducationForm);
        }
    }
    
    
    
  
    function updateEducationReq() {
      const educationForms = document.querySelectorAll('#educationContainer form');
      educationForms.forEach(form => {
  
        form.addEventListener('submit', updateEducation);
  
        form.querySelector('.delete-button').addEventListener('click', deleteEducation);
      })
    }
  
    function updateEducation(event) {
      event.preventDefault();
      const button = event.currentTarget.querySelector('input[type="submit"]');
      const tap = event.currentTarget.querySelector('.container-info-2');
      tap.addEventListener('click', () => {
        button.value = "Update";
        button.style.backgroundColor = "";
  
      });
      button.value = 'Updating...'
      const formData = new FormData(event.target);
  
      const formDataObject = {};
  
      formData.forEach((value, key) => {
        formDataObject[key] = value;
      });
  
      if (Object.values(formDataObject).some(value => value.trim() === "")) {
        button.value = "Empty values are not allowed";
        button.style.backgroundColor = "red";
        return;
      }
      formDataObject['userId'] = userId;
      formDataObject['emailId'] = emailId;
      fetch('/admin/userUpdateEducation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataObject),
      })
        .then(response => response.json())
        .then(data => {
          button.value = data.message;
          button.style.backgroundColor = "green";
  
        })
        .catch(error => {
          button.value = error.error;
          button.style.backgroundColor = "red";
          console.error('Error:', error);
        });
    }
  
    function deleteEducation(event) {
      event.preventDefault();
      const form = event.currentTarget.closest('form');
      if (!form) {
        console.error('Form not found.');
        return;
      }
      const id = form.querySelector('input[type=hidden]');
      const button = form.querySelector('input[type=button]');
      const submit = form.querySelector('input[type=submit]');
      button.disabled = true;
      submit.disabled = true;
  
      if (!button) {
        console.error('Button not found.');
        return;
      }
  
      button.value = 'deleting...';
  
      const formData = new FormData(form);
      const formDataObject = {};
  
      formData.forEach((value, key) => {
        formDataObject[key] = value;
      });
      
      if (Object.values(formDataObject).some(value => value.trim() === "")) {
        button.value = "Empty values are not allowed";
        button.style.backgroundColor = "red";
        return;
      }
      formDataObject['userId'] = userId;
      formDataObject['emailId'] = emailId;
      fetch('/admin/deleteEducation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataObject),
      })
        .then(response => response.json())
        .then(data => {
          button.value = data.message;
          button.style.backgroundColor = "green";
        })
        .catch(error => {
          button.value = error.error;
          button.style.backgroundColor = "red";
          console.error('Error:', error);
        });
    }
  
  
    function updateSkillSet(userId, emailId) {
      document.getElementById('update-skillSet').addEventListener('submit', (event) => {
        event.preventDefault();
  
        const skillSetInput = document.getElementById('skillSet');
        const updatedSkillSet = skillSetInput.value.split(',').map(skill => skill.trim());
  
        const button = event.currentTarget.querySelector('input[type="submit"]');
        if (button) {
          button.value = "Updating..";
        }
  
        fetch('/admin/userUpdateInfo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            skillSet: updatedSkillSet,
            userId, 
            emailId
          })
        })
          .then(response => response.json())
          .then(data => {
            button.value = data.message;
          })
          .catch(error => {
            button.value = error.error;
            console.error('Error updating skill set:', error);
          });
      });
    }
  
  
    function addWorkExperience(userId, emailId) {
      document.getElementById('add-work-experience').addEventListener('click', addWorkExperienceItem);
  
      function addWorkExperienceItem() {
  
        const workContainer = document.getElementById('Work-Experience-container');
  
        const newWorkForm = document.createElement('form');
  
        newWorkForm.innerHTML = `
            <div class="container-info-2">
                <label for="company">Company:</label>
                <input type="text" name="company" value="">
                
                <label for="position">Position:</label>
                <input type="text" name="position" value="">
                
                <label for="startDate">Start Date:</label>
                <input type="date" name="startDate" value="">
                
                <label for="endDate">End Date:</label>
                <input type="date" name="endDate" value="">
            </div> 
            <div class="submit">
                <input type="submit" value="Add">
            </div>
            <hr>
        `;
  
        newWorkForm.addEventListener('submit', function (event) {
          event.preventDefault();
  
          const formData = new FormData(this);
          const button = event.currentTarget.querySelector('input[type="submit"]');
          const tap = event.currentTarget.querySelector('.container-info-2');
  
          const formDataObject = {};
          formData.forEach((value, key) => {
            formDataObject[key] = value;
          });
          tap.addEventListener('click', () => {
            button.value = "Add";
            button.style.backgroundColor = "";
          });
  
          if (Object.values(formDataObject).some(value => value.trim() === "")) {
            button.value = "Empty values are not allowed";
            button.style.backgroundColor = "red";
            return;
          }
          formDataObject['userId'] = userId;
           formDataObject['emailId'] = emailId;

          fetch('/admin/userUpdateInfo', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formDataObject),
          })
            .then(response => response.json())
            .then(data => {
              if(data)
              {
              button.value = "Added";
              button.disabled = true;
              }
            })
            .catch(error => {
              console.error('Error:', error);
              button.value = error.error;
            });
        });
  
        workContainer.appendChild(newWorkForm);
      }
    }
  
    function updateWorkExperienceReq() {
  
      const workExperienceForms = document.querySelectorAll('#Work-Experience-container form');
  
      workExperienceForms.forEach(form => {
  
        form.addEventListener('submit', updateWorkExperience);
  
        form.querySelector('.delete-button').addEventListener('click', deleteWorkExperience);
      });
    }
  
    function deleteWorkExperience(event) {
      event.preventDefault();
      const form = event.currentTarget.closest('form');
      if (!form) {
        console.error('Form not found.');
        return;
      }
      const button = form.querySelector('input[type=submit]');
      const deleteButton = form.querySelector('.delete-button');
  
      button.disabled = true;
      deleteButton.disabled = true;
  
      if (!deleteButton) {
        console.error('Button not found.');
        return;
      }
  
      deleteButton.value = 'deleting...';
  
      const formData = new FormData(form);
      const formDataObject = {};
  
      formData.forEach((value, key) => {
        formDataObject[key] = value;
      });
    
      if (Object.values(formDataObject).some(value => value.trim() === "")) {
        deleteButton.value = "Empty values are not allowed";
        deleteButton.style.backgroundColor = "red";
        return;
      }

      formDataObject['userId'] = userId;
      formDataObject['emailId'] = emailId;
      
      fetch('/admin/deleteWorkExperience', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataObject),
      })
        .then(response => response.json())
        .then(data => {
          deleteButton.value = data.message;
          deleteButton.style.backgroundColor = "green";
        })
        .catch(error => {
          deleteButton.value = error.error;
          deleteButton.style.backgroundColor = "red";
          button.disabled = false;
          deleteButton.disabled = false;
          console.error('Error:', error);
        });
    }
  
    function updateWorkExperience(event) {
      event.preventDefault();
      const form = event.currentTarget.closest('form');
  
      if (!form) {
        console.error('Form not found.');
        return;
      }
      const id = form.querySelector('input[type=hidden]');
      const button = form.querySelector('input[type=submit]');
  
      console.log(id.value);
  
      if (!button) {
        console.error('Button not found.');
        return;
      }
  
      button.value = 'updating...';
  
      const formData = new FormData(form);
      const formDataObject = {};
  
      formData.forEach((value, key) => {
        formDataObject[key] = value;
      });
      console.log(formDataObject);
      if (Object.values(formDataObject).some(value => value.trim() === "")) {
        button.value = "Empty values are not allowed";
        button.style.backgroundColor = "red";
        return;
      }

      formDataObject['userId'] = userId;
      formDataObject['emailId'] = emailId;
      
      fetch('/admin/updateWorkExperience', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataObject),
      })
        .then(response => response.json())
        .then(data => {
          button.value = data.message;
          button.style.backgroundColor = "green";
        })
        .catch(error => {
          button.value = error.error;
          button.style.backgroundColor = "red";
          console.error('Error:', error);
        });
    }
  
    function updateCertifications(userId,emailId) {
      document.getElementById('update-certifications').addEventListener('submit', (event) => {
        event.preventDefault();
  
        const certificationsInput = document.getElementById('certifications');
        const certifications = certificationsInput.value.split(',').map(certification => certification.trim());
  
        const button = event.target.querySelector('input[type="submit"]');
        if (button) {
          button.value = "Updating..";
        }
  
        // Update the certifications on the server using fetch or another method
        fetch('/admin/userUpdateInfo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId,
             emailId,
            certifications
          })
        })
          .then(response => response.json())
          .then(data => {
            button.value = data.message;
          })
          .catch(error => {
            button.value = error.error;
            console.error('Error updating certifications:', error);
          });
      });
    }
  
  
    function addProjects(userId, emailId) {
      document.getElementById('add-project').addEventListener('click', addProjectForm);
  
      function addProjectForm() {
        const projectContainer = document.getElementById('addProject-container');
        const newProjectForm = document.createElement('form');
  
        newProjectForm.innerHTML = `
        <div class="container-info-2">
          <label for="projectName">Project Name:</label>
          <input type="text" id="projectName" name="projectName" value="">
          
          <label for="description">Description:</label>
          <textarea id="description" name="description"></textarea>
          
          <label for="startDate">Start Date:</label>
          <input type="date" id="startDate" name="startDate" value="">
          
          <label for="endDate">End Date:</label>
          <input type="date" id="endDate" name="endDate" value="">
        </div>
  
        <div class="submit">
          <input type="submit" value="Add"> <input type="button" class="delete-button" value="delete" disabled>
        </div>
        <hr>
      `;
  
        newProjectForm.addEventListener('submit', function (event) {
          event.preventDefault();
  
          const formData = new FormData(this);
          const button = event.currentTarget.querySelector('input[type="submit"]');
          const tap = event.currentTarget.querySelector('.container-info-2');
          button.disabled = true;
          const formDataObject = {};
          formData.forEach((value, key) => {
            formDataObject[key] = value;
          });
          console.log(formDataObject)
          tap.addEventListener('click', () => {
            button.value = "Add";
            button.style.backgroundColor = "";
          });
  
          if (Object.values(formDataObject).some(value => value.trim() === "")) {
            button.value = "Empty values are not allowed";
            button.style.backgroundColor = "red";
            return;
          }
          formDataObject['userId'] = userId;
          formDataObject['emailId'] = emailId;
          
          fetch('/admin/userUpdateInfo', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formDataObject),
          })
            .then(response => response.json())
            .then(data => {
              if (data) {
                button.value = "Project added";
                button.disabled = true;
              }
            })
            .catch(error => {
              console.error('Error:', error);
              button.value = error.error;
            });
        });
  
        projectContainer.appendChild(newProjectForm);
      }
    }
  
    function addProjectReq(userId, emailId) {
      const projectForms = document.querySelectorAll('#addProject-container form');
  
      projectForms.forEach(form => {
        form.addEventListener('submit', updateProject);
        const deleteButton = form.querySelector('.delete-button');
        if (deleteButton) {
          deleteButton.addEventListener('click', deleteProject);
        }
      });
    }
  
    function updateProject(event) {
      event.preventDefault();
  
      const form = event.currentTarget;
      const button = form.querySelector('input[type="submit"]');
      const tap = form.querySelector('.container-info-2');
  
  
      button.value = 'adding...';
  
      const formData = new FormData(form);
      const formDataObject = {};
  
      formData.forEach((value, key) => {
        formDataObject[key] = value;
      });

     
      tap.addEventListener('click', () => {
        button.value = "Update";
        button.style.backgroundColor = "";
      })
      if (Object.values(formDataObject).some(value => value.trim() === "")) {
        button.value = "Empty values are not allowed";
        button.style.backgroundColor = "red";
        return;
      }
      formDataObject['userId'] = userId;
      formDataObject['emailId'] = emailId;
      
      fetch('/admin/updateProject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataObject),
      })
        .then(response => response.json())
        .then(data => {
          if (data.message) {
            button.value = data.message;
            button.style.backgroundColor = "green";
          }
        })
        .catch(error => {
          button.value = error.error;
          button.style.backgroundColor = "red";
          console.error('Error:', error);
        });
    }
  
    function deleteProject(event) {
      event.preventDefault();
  
      const form = event.currentTarget.closest('form');
      if (!form) {
        console.error('Form not found.');
        return;
      }
  
      const submitButton = form.querySelector('input[type="submit"]');
      const deleteButton = form.querySelector('.delete-button');
      const formData = new FormData(form);
      const formDataObject = {};
  
      formData.forEach((value, key) => {
        formDataObject[key] = value;
      });
      formDataObject['userId'] = userId;
      formDataObject['emailId'] = emailId;
      
      if (!deleteButton) {
        console.error('Button not found.');
        return;
      }
  
      deleteButton.value = 'deleting...';
  
      fetch('/admin/deleteProject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataObject),
      })
        .then(response => response.json())
        .then(data => {
          deleteButton.value = data.message;
          deleteButton.style.backgroundColor = "green";
          deleteButton.disabled = true;
          submitButton.disabled = true;
        })
        .catch(error => {
          button.value = error.error;
          button.style.backgroundColor = "red";
          deleteButton.disabled = false;
          submitButton.disabled = false;
          console.error('Error:', error);
        });
    }
  
    function updateLanguages(userId, emailId) {
      document.getElementById('update-languages').addEventListener('submit', (event) => {
        event.preventDefault();
  
        const form = event.currentTarget;
        const button = form.querySelector('input[type="submit"]');
  
        button.value = 'Updating...';
  
        const formData = new FormData(form);
        const formDataObject = {};
  
        formData.forEach((value, key) => {
          formDataObject[key] = value;
        });
  
        document.getElementById('update-languages').addEventListener('click', () => {
          button.value = "update";
          button.disabled = false;
          button.style.backgroundColor = "";
  
        })
        if (Object.values(formDataObject).some(value => value.trim() === "")) {
          button.value = "Empty values are not allowed";
          button.style.backgroundColor = "red";
          return;
        }
        formDataObject['userId'] = userId;
        formDataObject['emailId'] = emailId;
        
        fetch('/admin/userUpdateInfo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formDataObject),
        })
          .then(response => response.json())
          .then(data => {
            button.value = data.message;
            button.style.backgroundColor = "green";
          })
          .catch(error => {
            button.value = error.error;
            button.style.backgroundColor = "red";
            console.error('Error:', error);
          });
      });
    }
  
    function updateHobbies(userId, emailId) {
      document.getElementById('update-hobbies').addEventListener('submit', (event) => {
        event.preventDefault();
  
        const form = event.currentTarget;
        const button = form.querySelector('input[type="submit"]');
  
        button.value = 'Updating...';
        button.disabled = true;
        document.getElementById('update-hobbies').addEventListener('click', () => {
          button.value = "update";
          button.disabled = false;
          button.style.backgroundColor = "";
  
        })
        const formData = new FormData(form);
        const formDataObject = {};
  
        formData.forEach((value, key) => {
          formDataObject[key] = value;
        });
  
        if (Object.values(formDataObject).some(value => value.trim() === "")) {
          button.value = "Empty values are not allowed";
          button.style.backgroundColor = "red";
          return;
        }
        formDataObject['userId'] = userId;
        formDataObject['emailId'] = emailId;
        
  
        fetch('/admin/userUpdateInfo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formDataObject),
        })
          .then(response => response.json())
          .then(data => {
            button.value = data.message;
            button.disabled = false;
            button.style.backgroundColor = "green";
          })
          .catch(error => {
            button.value = error.error;
            button.style.backgroundColor = "red";
            console.error('Error:', error);
          });
      });
    }
  
    function updateSocialMedia(userId, emailId) {
      document.getElementById('update-social-media').addEventListener('submit', (event) => {
        event.preventDefault();
  
        const form = event.currentTarget;
        const button = form.querySelector('input[type="submit"]');
        button.disabled = true;
        document.getElementById('update-social-media').addEventListener('click', () => {
          button.value = "update";
          button.style.backgroundColor = "";
  
        })
        button.value = 'Updating...';
  
        const formData = new FormData(form);
        const formDataObject = {};
  
        formData.forEach((value, key) => {
          formDataObject[key] = value;
        });
  
        if (Object.values(formDataObject).some(value => value.trim() === "")) {
          button.value = "Empty values are not allowed";
          button.style.backgroundColor = "red";
          button.disabled = false;
          return;
        }
        formDataObject['userId'] = userId;
        formDataObject['emailId'] = emailId;
        
        fetch('/admin/userUpdateInfo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formDataObject),
        })
          .then(response => response.json())
          .then(data => {
            button.value = data.message;
            button.style.backgroundColor = "green";
            button.disabled = false;
          })
          .catch(error => {
            button.value = error.error;
            button.style.backgroundColor = "red";
            button.disabled = false;
            console.error('Error:', error);
          });
      });
    }
  
    function updatePersonalWebsite() {
  
      document.getElementById('update-personalWebsite').addEventListener('submit', (event) => {
        event.preventDefault();
  
        const form = event.currentTarget;
        const button = form.querySelector('input[type="submit"]');
  
        button.disabled = true;
        document.getElementById('personalWebsite').addEventListener('click', () => {
          button.value = "update";
          button.disabled = false;
          button.style.backgroundColor = "";
  
        })
  
        button.value = 'Updating...';
  
        const formData = new FormData(form);
        const formDataObject = {};
  
        formData.forEach((value, key) => {
          formDataObject[key] = value;
        });
  
        if (Object.values(formDataObject).some(value => value.trim() === "")) {
          button.value = "Empty values are not allowed";
          button.style.backgroundColor = "red";
          return;
        }
        
        formDataObject['userId'] = userId;
        formDataObject['emailId'] = emailId;
        
        fetch('/admin/userUpdateInfo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formDataObject),
        })
          .then(response => response.json())
          .then(data => {
            button.value = data.message;
            button.style.backgroundColor = "green";
            button.disabled = false;
  
  
          })
          .catch(error => {
            button.value = error.error;
            button.style.backgroundColor = "red";
            button.disabled = false;
            console.error('Error:', error);
          });
      });
    }
}
  
function formatToISODate(dateString) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const formattedDate = new Date(dateString).toLocaleDateString('en-GB', options);
    return formattedDate.split('/').reverse().join('-'); // Convert to "yyyy-MM-dd" format
}
  
  //main-------------------------
  
  function updateInfo(user) {
  
    return `
      <div class="update-form-container">
        
                    <h2>User Information</h2>
                    <form id="mainuserinfo" > 
                      <div class="container-info">
                          <label for="userId" class="lebel">User ID:</label>
                          <input type="text" id="userId" name="userId" value="${user.userId}" readonly>
                          
                          <label for="email" class="lebel">Email:</label>
                          <input type="email" id="email" name="email" value="${user.email}" readonly>
                          
                          <label for="verifiedByGoogle" class="lebel">Verified by Google:</label>
                          <input type="checkbox" id="verifiedByGoogle" name="verifiedByGoogle" ${user.verifiedByGoogle ? 'checked' : ''} disabled>
                          
                          <label for="Fname" class="lebel">First Name:</label>
                          <input type="text" id="Fname" name="Fname" value="${user.Fname}">
                          
                          <label for="Lname" class="lebel">Last Name:</label>
                          <input type="text" id="Lname" name="Lname" value="${user.Lname}">
                      </div>
                      <div class="submit">
                        <input type="submit" value="Update" >
                      </div>
                    </form>
  
                    <!-- User Details -->
                    <h2>User Details</h2>
                    <form id="update-bio-dob-phone">
                        <div class="container-info-2">
                            <label for="bio" class="lebel">Bio:</label>
                            <textarea id="bio" name="bio">${user.userDetails.bio || ''}</textarea>
                
                            <label for="dateOfBirth" class="lebel">Date of Birth:</label>
                            <input type="date" id="dateOfBirth" name="dateOfBirth" value="${user.userDetails.dateOfBirth ? formatToISODate(user.userDetails.dateOfBirth) : ''}">
  
                
                            <label for="phoneNumber" class="lebel">Phone Number:</label>
                            <input type="tel" id="phoneNumber" name="phoneNumber" value="${user.userDetails.phoneNumber || ''}">
                        </div>
                        <div class="submit">
                            <input type="submit" value="Update">
                        </div>
                    </form>
                    <!-- Address -->
                    <h3>Address</h3>
                    <form id="update-address">
                <div class="container-info-2">
                    <label for="street">Street:</label>
                    <input type="text" id="street" name="street" value="${user.userDetails.address ? user.userDetails.address.street : ''}">
  
                    <label for="city">City:</label>
                    <input type="text" id="city" name="city" value="${user.userDetails.address ? user.userDetails.address.city : ''}">
  
                    <label for="state">State:</label>
                    <input type="text" id="state" name="state" value="${user.userDetails.address ? user.userDetails.address.state : ''}">
  
                    <label for="postalCode">Postal Code:</label>
                    <input type="text" id="postalCode" name="postalCode" value="${user.userDetails.address ? user.userDetails.address.postalCode : ''}">
                </div>
  
                <div class="submit">
                    <input type="submit" value="Update">
                </div>
            </form>
         
          <h3>Interests</h3>
          <form id="update-Interests">
              <div class="container-info-2">
                  <label for="interests">Interests (comma-separated):</label>
                  <input type="text" id="interests" name="interests" value="${user.userDetails.interests ? user.userDetails.interests.join(', ') : ''}">
              </div>
  
              <div class="submit">
                  <input type="submit" value="Update">
              </div>
          </form>
  
          <!-- Education -->
          <h3 class="education-h3">Education</h3>
          <button type="button" id="addEducation">Add Education</button>
                    <div id="educationContainer">
                            ${user.userDetails.education.map((edu) => `
                                
                                  <form>
                                      <div class="container-info-2" >
                                            <label for="institution">Institution:</label>
                                            
                                            <input type="text" name="institution" value="${edu.institution}">
                                            <input type="hidden" name="_id" value="${edu._id}">
                                            
                                            <label for="degree">Degree:</label>
                                            <input type="text" name="degree" value="${edu.degree}">
                                            
                                            <label for="graduationYear">Graduation Year:</label>
                                            <input type="number"  name="graduationYear" value="${edu.graduationYear}">
                                      </div> 
                                      <div class="submit">
                                            <input type="submit" value="Update"> <input type="button" class="delete-button" value="delete">
                                      </div>
                                    
                                    </form>
                                  <hr>
                               
                            `).join('')}
                  </div> 
  
          <!-- Skill Set -->
          <h3>Skill Set</h3>
          <form id="update-skillSet">
              <div class="container-info-2">
                    <label for="skillSet">Skill Set (comma-separated):</label>
                    <input type="text" id="skillSet" name="skillSet" value="${user.userDetails.skillSet ? user.userDetails.skillSet.join(', ') : ''}">
              </div>
  
                  <div class="submit">
                  <input type="submit" value="Update">
                  </div>
          </form>
  
  
          <!-- Work Experience -->
          <h3 class="work-h3">Work Experience</h3>
          <button type="button" id="add-work-experience">Add Work Experience</button>
          
          <div id="Work-Experience-container">
  
               ${user.userDetails.workExperience.map((exp) => `
               
                    <form>
                    <div class="container-info-2">
                          <label for="company">Company:</label>
                          <input type="text" name="company" value="${exp.company}">
                          <input type="hidden" name="_id" value="${exp._id}">
                          
                          <label for="position">Position:</label>
                          <input type="text"  name="position" value="${exp.position}">
                          
                          <label for="startDate">Start Date:</label>
                          <input type="date"  name="startDate" value="${exp.startDate ? formatToISODate(exp.startDate) : ''}">
                          
                          <label for="endDate">End Date:</label>
                          <input type="date"  name="endDate" value="${exp.endDate ? formatToISODate(exp.endDate) : ''}">
                        </div> 
  
                        <div class="submit">
                                <input type="submit" value="Update"> <input type="button" class="delete-button" value="delete">
                        </div>
                  
                    </form>
                    
                <hr>
             
                `).join('')}
           </div> 
          <!-- Certifications -->
          <h3>Certifications</h3>
          <form id="update-certifications">
              <div class="container-info-2">
                <label for="certifications">Certifications (comma-separated):</label>
                <input type="text" id="certifications" name="certifications" value="${user.userDetails.certifications ? user.userDetails.certifications.join(', ') : ''}">
              </div>
  
              <div class="submit">
                <input type="submit" value="Update">
              </div>
  
          </form>
          <!-- Projects -->
          <h3 class="project-h3">Projects</h3>
          <button type="button" id="add-project">Add Project</button>
          <div id="addProject-container">
                  ${user.userDetails.projects.map((project) => `
                  <form>
                    <div class="container-info-2">
                    
                      <label for="projectName">Project Name:</label>
                      <input type="text" name="projectName" value="${project.projectName}">
                      <input type="hidden" name="_id" value="${project._id}">
                      
                      <label for="description">Description:</label>
                      <textarea  name="description">${project.description}</textarea>
                      
                      <label for="startDate">Start Date:</label>
                      <input type="date" name="startDate" value="${project.startDate ? formatToISODate(project.startDate) : ''}">
                      
                      <label for="endDate">End Date:</label>
                      <input type="date" name="endDate" value="${project.endDate ? formatToISODate(project.endDate) : ''}">
                    </div>
  
                      <div class="submit">
                          <input type="submit" value="Update"> <input type="button" class="delete-button" value="delete">
                      </div>
                </form>
                <hr>
                  `).join('')}
          </div>
          
          <!-- Languages -->
          <h3>Languages</h3>
          <form id="update-languages">
              <div class="container-info-2">
                <label for="languages">Languages (comma-separated):</label>
                <input type="text" id="languages" name="languages" value="${user.userDetails.languages ? user.userDetails.languages.join(', ') : ''}">
              </div>
  
              <div class="submit">
                <input type="submit" value="Update">
              </div>
          </form>
          <!-- Hobbies -->
          <h3>Hobbies</h3>
          <form id="update-hobbies">
              <div class="container-info-2">
                  <label for="hobbies">Hobbies (comma-separated):</label>
                  <input type="text" id="hobbies" name="hobbies" value="${user.userDetails.hobbies ? user.userDetails.hobbies.join(', ') : ''}">
              </div>
                  <div class="submit">
                  <input type="submit" value="Update">
                </div>
              
          </form>
          <!-- Social Media -->
          <h3>Social Media</h3>
          <form id="update-social-media">
              <div class="container-info-2">
                
                <label for="linkedin">LinkedIn:</label>
                <input type="text" id="linkedin" name="linkedin" value="${user.userDetails.socialMedia ? user.userDetails.socialMedia.linkedin : ''}">
                
                <label for="twitter">Twitter:</label>
                <input type="text" id="twitter" name="twitter" value="${user.userDetails.socialMedia ? user.userDetails.socialMedia.twitter : ''}">
                
                <label for="github">GitHub:</label>
                <input type="text" id="github" name="github" value="${user.userDetails.socialMedia ? user.userDetails.socialMedia.github : ''}">
              </div>
  
              <div class="submit">
                <input type="submit" value="Update">
              </div>
          </form>
          <!-- Personal Website -->
          <h3>Personal Website</h3>
          <form id="update-personalWebsite">
            <div class="container-info-2">
                <label for="personalWebsite">Personal Website:</label>
                <input type="text" id="personalWebsite" name="personalWebsite" value="${user.userDetails.personalWebsite || ""}">
            </div>
  
            <div class="submit">
              <input type="submit" value="Update">
            </div>
          </form>
        
      </div>`
  
  }