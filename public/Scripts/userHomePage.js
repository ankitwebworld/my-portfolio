const loader = document.querySelector('.loader');

window.onload = () => {
  loader.style.display ='block';
  var mobileMenuBtn = document.getElementById('mobile-menu');
  mobileMenuBtn.addEventListener('click', () => {
    var menu = document.querySelector('.menu');
    menu.style.display = (menu.style.display === 'none' || menu.style.display === '') ? 'block' : 'none';
  });

 
  const frameDiv = document.getElementById('show-frame-data');
  const Verify = document.getElementById('Verify');
  fetch('/userHomePageInfo')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(user => {
      Verify.innerHTML = `${user.verifiedByGoogle ? "<i class='fas fa-check-circle'></i> Verified " : "<i class='fas fa-times-circle'></i>Not Verified "}`;

      const iframeContent = `
       
          
          <div class='content'>
          <h1>Hi, ${user.Fname + " " + user.Lname}!</h1>
          <h3>${user.userId}</h3>
          <p>Email: ${user.email}</p>
          <p>Are you verified By Google: ${user.verifiedByGoogle ? "Yes" : "No"}</p>
          <button id="logOutButton">Log-out</button>
          <button id="loginButton">Log-in</button>
          </div>
          <div class="bg"></div>
          <div class="bg bg2"></div>
          <div class="bg bg3"></div>
          
         
      `;


      frameDiv.innerHTML = iframeContent;
      loginLogoutButton();
    })
    .catch(error => {
      console.error('Error fetching user data:', error);
      frameDiv.innerHTML = 'Error fetching user data.';
    });
};


function menuHideShow() {
  if (window.innerWidth <= 850) {
    document.querySelector('.menu').style.display = "none";
  }
  else{
    document.querySelector('.menu').style.display = "block";
  }
}


function Me(user) {
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

document.getElementById('user-home').addEventListener('click', () => {
  loader.style.display ='block';
  window.location.reload();
});


document.getElementById('Profile').addEventListener('click', () => {
  loader.style.display ='block';
  const frameDiv = document.getElementById('show-frame-data');
  fetch('/getUserInfo')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(user => {
      loader.style.display ='none';
      frameDiv.innerHTML = Me(user);
      menuHideShow();
    })
    .catch(error => {
      console.error('Error fetching user data:', error);
      frameDiv.innerHTML = 'Error fetching user data.';
    });
});

document.getElementById('profile-update').addEventListener('click', () => {
  loader.style.display ='block';
  const frameDiv = document.getElementById('show-frame-data');
  fetch('/getUserInfo')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(user => {
      loader.style.display ='none';
      frameDiv.innerHTML = updateInfo(user);
      actions();
      menuHideShow();
    })
    .catch(error => {
      console.error('Error fetching user data:', error);
      frameDiv.innerHTML = 'Error fetching user data.';
    });
});

function actions() {
  updateUserInfo();
  update_bio_dob_phone();
  update_address();
  update_Interests();
  addEducation();
  updateEducationReq();
  updateSkillSet();
  addWorkExperience();
  updateWorkExperienceReq();
  updateCertifications();
  addProjects();
  addProjectReq();
  updateLanguages();
  updateHobbies();
  updateSocialMedia();
  updatePersonalWebsite();


  function updateUserInfo() {
    document.getElementById('mainuserinfo').addEventListener('submit', (event) => {
      event.preventDefault();

      const Fname = document.getElementById('Fname').value;
      const Lname = document.getElementById('Lname').value;
      const button = document.querySelector('input[type="submit"]');
      button.value = "Updating..";

      if (Fname.trim() !== '') {
        const data = {
          Fname: Fname.trim(),
          Lname: Lname.trim()
        };

        fetch('/userUpdateInfo', {
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
      }
      else {
        document.getElementById('Fname').style.border = '2px solid red';
        button.value = "Update"
      }
    });
  }

  function update_bio_dob_phone() {
    document.getElementById('update-bio-dob-phone').addEventListener('submit', function (event) {
      event.preventDefault();
      console.log('clokgn')
      const bio = document.getElementById('bio').value;
      const dateOfBirth = document.getElementById('dateOfBirth').value;
      const phoneNumber = document.getElementById('phoneNumber').value;
      const button = event.target.querySelector('input[type="submit"]');
      button.value = "Updating..";

      const data = {
        bio: bio,
        dateOfBirth: dateOfBirth,
        phoneNumber: phoneNumber
      };

      fetch('/userUpdateInfo', {
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



  function update_address() {
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

      fetch('/userUpdateInfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
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

  function update_Interests() {
    document.getElementById('update-Interests').addEventListener('submit', function (event) {
      event.preventDefault();

      const interestsInput = document.getElementById('interests');
      const updatedInterests = interestsInput.value.split(',').map(interest => interest.trim());
      const button = event.target.querySelector('input[type="submit"]');
      if (button) {
        button.value = "Updating..";
      }

      // Update the interests on the server using fetch or another method
      fetch('/userUpdateInfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
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

  function addEducation() {
    document.getElementById('addEducation').addEventListener('click', addEducationItem);

    function addEducationItem() {
      const educationContainer = document.getElementById('educationContainer');

      const newEducationForm = document.createElement('form');


      newEducationForm.innerHTML = `
          <div class="container-info-2">
              <label for="institution">Institution:</label>
              <input type="text"  name="institution" value="">
              
              <label for="degree">Degree:</label>
              <input type="text" name="degree" value="">
              
              <label for="graduationYear">Graduation Year:</label>
              <input type="number" name="graduationYear" value="">
          </div> 
          <div class="submit">
              <input type="submit" value="Add">
          </div>
          <hr>
      `;

      newEducationForm.addEventListener('submit', function (event) {
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

        })

        if (Object.values(formDataObject).some(value => value.trim() === "")) {
          button.value = "Empty values are not allowed";
          button.style.backgroundColor = "red";
          return;
        }

        fetch('/userUpdateInfo', {
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
    fetch('/userUpdateEducation', {
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

    fetch('/deleteEducation', {
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

  function updateSkillSet() {
    document.getElementById('update-skillSet').addEventListener('submit', (event) => {
      event.preventDefault();

      const skillSetInput = document.getElementById('skillSet');
      const updatedSkillSet = skillSetInput.value.split(',').map(skill => skill.trim());

      const button = event.currentTarget.querySelector('input[type="submit"]');
      if (button) {
        button.value = "Updating..";
      }

      fetch('/userUpdateInfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          skillSet: updatedSkillSet
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


  function addWorkExperience() {
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

        fetch('/userUpdateInfo', {
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

    fetch('/deleteWorkExperience', {
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
    console.log("click")
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

    fetch('/updateWorkExperience', {
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

  function updateCertifications() {
    document.getElementById('update-certifications').addEventListener('submit', (event) => {
      event.preventDefault();

      const certificationsInput = document.getElementById('certifications');
      const certifications = certificationsInput.value.split(',').map(certification => certification.trim());

      const button = event.target.querySelector('input[type="submit"]');
      if (button) {
        button.value = "Updating..";
      }

      // Update the certifications on the server using fetch or another method
      fetch('/userUpdateInfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
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


  function addProjects() {
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

        fetch('/userUpdateInfo', {
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

  function addProjectReq() {
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
    console.log(formDataObject)
    tap.addEventListener('click', () => {
      button.value = "Update";
      button.style.backgroundColor = "";
    })
    if (Object.values(formDataObject).some(value => value.trim() === "")) {
      button.value = "Empty values are not allowed";
      button.style.backgroundColor = "red";
      return;
    }
    console.log("hiii")
    fetch('/updateProject', {
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

    if (!deleteButton) {
      console.error('Button not found.');
      return;
    }

    deleteButton.value = 'deleting...';

    fetch('/deleteProject', {
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

  function updateLanguages() {
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

      fetch('/userUpdateInfo', {
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

  function updateHobbies() {
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

      fetch('/userUpdateInfo', {
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

  function updateSocialMedia() {
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

      fetch('/userUpdateInfo', {
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

      fetch('/userUpdateInfo', {
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

//end----------


//for message

document.getElementById("message").addEventListener('click', (event) => {
  event.preventDefault();
  loader.style.display ='block';
  const frameDiv = document.getElementById('show-frame-data');
  fetch('/getUserMessageContact')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(contactData => {
      loader.style.display ='none';
      frameDiv.innerHTML = messageContact(contactData);
      attachButtonListeners();
      menuHideShow();
    })
    .catch(error => {
      console.error('Error fetching contact data:', error);
      frameDiv.innerHTML = error.error || '<p>No contact data available</p>';
    });
});

function messageContact(contactData) {
  if (!contactData || contactData.length === 0) {
    return '<p>No contact data available</p>';
  }



  return contactData.map(contact => `
      <div class="box contact-box" data-contact='${JSON.stringify(contact)}'>
          <div class="contact-contant">
              <div class="top">
                  <p class="subject">${contact.subject}</p>
                  <p class="reference">${contact.ReferenceId}</p>
              </div>
              <div class="message">
                  <p class="contact-name">${contact.name} :</p>
                  <p class="contact-message">${contact.message}</p>
              </div>
              <div class="contact-method time-date">
                  <p class="contact-date">${new Date(contact.date).toLocaleDateString('en-GB')}</p>
                  <p class="contact-time">${new Date(contact.date).toLocaleTimeString('en-US', { hour12: false })}</p>
              </div>
              <div class="contact-method">
                  <span class="contact-label">Last Response: </span>
                  ${getLastResponse(contact.responses)}
              </div>
          </div>
          <div class="riply-area-section">
              <form class="form-riply" >
                  <input type="text" name="message" placeholder="Reply something" class="riplied">
                  <input type="hidden" value="${contact.ReferenceId}" name="ReferenceId">
                  <input type="hidden" value="user" name="respondBy">
                  <input type="hidden" value="${contact.emailAddress}" name="emailAddress">
                  <input type="hidden" value="${contact.phoneNo}" name="phoneNo">
                  <button type="submit" class="send">Send</button>
                  <p class="feedback"></p>
              </form>
          </div>
          <div class="contact-section contact-area-section">
              <div class="show-more-section">
                  <p class="phoneNo">${contact.phoneNo}</p>
                  <p class="emailAddress">${contact.emailAddress}</p>
              </div>
              <hr class="contact-hr">
              <div class="responses">
                  ${contact.responses.reverse().map(element => `
                      <div class="last-responce response-data">
                          <p>${element.respondBy} :</p>
                          <p>${element.message}</p>
                          <div class="contact-method time-date for-bottom">
                              <p>${new Date(element.timestamp).toLocaleDateString('en-GB')}</p>
                              <p>${new Date(element.timestamp).toLocaleTimeString('en-US', { hour12: false })}</p>
                          </div>
                      </div>
                  `).join('')}
              </div>
          </div>
          <div class="reply-button">
              <button class="riply-button">Reply</button>
              <button class="view-more">View More</button>
              <button class="delete-contact-info">DELETE</button>
          </div>
      </div>
  `).join('');

}


function attachButtonListeners() {
  attachReplyButtonListeners();
  attachViewMoreButtonListeners();
  attachDeleteButtonListeners();
  attachSubmitReplyFormListeners();


  function attachReplyButtonListeners() {
    const replyButtons = document.querySelectorAll('.riply-button');
    replyButtons.forEach(button => {
      button.addEventListener('click', () => handleReplyButtonClick(button));
    });
  }

  function attachViewMoreButtonListeners() {
    const viewMoreButtons = document.querySelectorAll('.view-more');
    viewMoreButtons.forEach(button => {
      button.addEventListener('click', () => handleViewMoreButtonClick(button));
    });
  }

  function attachDeleteButtonListeners() {
    const deleteButtons = document.querySelectorAll('.delete-contact-info');
    deleteButtons.forEach(button => {
      button.addEventListener('click', () => handleDeleteButtonClick(button));
    });
  }

  function attachSubmitReplyFormListeners() {
    const submitReplyForms = document.querySelectorAll('.form-riply');
    submitReplyForms.forEach(form => {
      form.addEventListener('submit', (event) => handleReplyFormSubmit(event, form));
    });
  }

  function handleReplyFormSubmit(event, form) {
    event.preventDefault();
    event.stopPropagation();

    const messageInput = form.querySelector('input[name="message"]');
    const referenceIdInput = form.querySelector('input[name="ReferenceId"]');
    const respondBy = form.querySelector('input[name="respondBy"]');
    const feedback = form.querySelector('.feedback');

    feedback.textContent = 'Sending message...';

    fetch('/sendingMessageReply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: messageInput.value,
        referenceId: referenceIdInput.value,
        respondBy: respondBy.value,
      }),
    })
      .then(response => response.json())
      .then(data => {
        feedback.textContent = data.message;
        setTimeout(() => {
          feedback.textContent = '';
          messageInput.value = '';
        }, 3000);
      })
      .catch(error => {
        feedback.textContent = error.error;
        console.error('Error:', error);
      });
  }


  function handleReplyButtonClick(button) {
    const formRiply = button.closest('.box').querySelector('.riply-area-section');
    const contactData = button.closest('.box').querySelector('.contact-area-section');

    formRiply.style.display = (formRiply.style.display === "block") ? "none" : "block";
    contactData.style.display = "none";
  }


  function handleViewMoreButtonClick(button) {
    const formRiply = button.closest('.box').querySelector('.riply-area-section');
    const contactData = button.closest('.box').querySelector('.contact-area-section');

    contactData.style.display = (contactData.style.display === "block") ? "none" : "block";
    formRiply.style.display = "none";
  }


  function handleDeleteButtonClick(button) {
    const contactData = JSON.parse(button.closest('.box').dataset.contact);
    const referenceId = button.dataset.reference;
    console.log('Delete clicked for:', contactData);

    const confirmDelete = window.confirm('Are you sure you want to delete this contact?');

    if (confirmDelete) {
      console.log('Deleting contact with referenceId:', referenceId);
    }
  }

}

function getLastResponse(responses) {
  if (responses && responses.length > 0) {
    const lastResponse = responses[responses.length - 1];
    return `
          <div class="last-responce response-data">
              <p>${lastResponse.respondBy} :</p>
              <p>${lastResponse.message}</p>
              <div class="contact-method time-date for-bottom">
                  <p>${new Date(lastResponse.timestamp).toLocaleDateString('en-GB')}</p>
                  <p>${new Date(lastResponse.timestamp).toLocaleTimeString('en-US', { hour12: false })}</p>
              </div>
          </div>
      `;
  } else {
    return 'wait for admin responce...!!! ';
  }
}

//end message ----------------------


document.getElementById("notification").addEventListener('click', (event) => {
  event.preventDefault();
  loader.style.display ='block';
  const frameDiv = document.getElementById('show-frame-data');
  fetch('/getNotifications')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(notification => {
      if (notification && notification.length > 0) {
        loader.style.display ='none';
        frameDiv.innerHTML = notificationContainer(notification);
        notificationActions(); 
        menuHideShow();
      } else {
        frameDiv.innerHTML = '<p>No Notifications are there</p>';
      }
    })
    .catch(error => {
      console.error('Error fetching notification:', error);
      frameDiv.innerHTML = error.error || '<p>No Notifications are there</p>';
    });
});

function moreNotificationsData(data) {
  let num = 0;
  let img = null

function getLogo() {
if (num === 0) {
num++;
img =  `/get-logo-from-drive/AnkitLogo.png`;
return img
} else {
return img;
}
}
  return data.map(notification => `
    <div class="notification-list ${notification.read ? '' : 'notification-list--unread'}">
      <div class="notification-list_content">
        <div class="notification-list_img">
          <img src="${getLogo()}" alt="user">
        </div>
        <div class="notification-list_detail">
          <p><b>${notification.sender.username}</b> ${notification.action} ${notification.target}</p>
          <p class="text-muted">${notification.message}</p>
          <p class="text-muted"><small>${formatDate(notification.createdAt)} ${formatTime(notification.createdAt)}</small></p>
        </div>
      </div>
      ${notification.featureImage ? `<div class="notification-list_feature-img"><img src="${getLogo()}" alt="Feature image"></div>` : ''}
    </div>
  `).join('');
}

function notificationContainer(data) {
  const hasLoadMoreButton = document.getElementById('load-more-btn') !== null;
  let num = 0;
  let img = null

function getLogo() {
if (num === 0) {
num++;
img =  `/get-logo-from-drive/AnkitLogo.png`;
return img
} else {
return img;
}
}
  return `
    <section class="section-50">
      <div class="notification-container">
        
        <div class="notification-ui_dd-content">
        <h3 class="m-b-50 heading-line">Notifications <i class="fa fa-bell text-muted"></i></h3>
          ${data.map(notification => `
            <div class="notification-list ${notification.read ? '' : 'notification-list--unread'}">
              <div class="notification-list_content">
                <div class="notification-list_img">
                  <img src="${getLogo()}" alt="user">
                </div>
                <div class="notification-list_detail">
                  <p><b>${notification.sender.username}</b> ${notification.action} ${notification.target}</p>
                  <p class="text-muted">${notification.message}</p>
                  <p class="text-muted"><small>${formatDate(notification.createdAt)} ${formatTime(notification.createdAt)}</small></p>
                </div>
              </div>
              ${notification.featureImage ? `<div class="notification-list_feature-img"><img src="${getLogo()}" alt="Feature image"></div>` : ''}
            </div>
          `).join('')}
        </div>
        ${!hasLoadMoreButton ? `
          <div class="text-center">
            <a href="#!" id="load-more-btn" class="dark-link">Load more activity</a>
          </div>` : ''}
      </div>
    </section>
  `;
}

function notificationActions() {
  let currentPage = 1;
  const notificationContainerElement = document.querySelector('.notification-ui_dd-content');

  function renderNotifications(notifications) {
 
    notificationContainerElement.innerHTML = notificationContainer(notifications);

   
  }

  function appendMoreNotifications(moreNotifications) {
    const newNotificationsHTML = moreNotificationsData(moreNotifications); // Fix the function name here
    notificationContainerElement.innerHTML += newNotificationsHTML;
    
  }

  async function fetchNotifications(page = 1) {
    try {
      const response = await fetch(`/getNotifications?page=${page}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const notifications = await response.json();
      renderNotifications(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }

  async function fetchMoreNotifications() {
    try {
      const response = await fetch(`/loadMoreNotifications?page=${currentPage}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const moreNotifications = await response.json();
      appendMoreNotifications(moreNotifications);
      currentPage++;

    } catch (error) {
      console.error('Error fetching more notifications:', error);
    }
  }

  const loadMoreBtn = document.getElementById('load-more-btn');

  loadMoreBtn.addEventListener('click', fetchMoreNotifications);

  fetchNotifications(currentPage);
}




document.getElementById("Verify").addEventListener('click', (event) => {
  event.preventDefault();
  loader.style.display ='block';
  const frameDiv = document.getElementById('show-frame-data');
  fetch('/getVerification')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then( data => {
      loader.style.display ='none';
        frameDiv.innerHTML = VerifyContainer(data.email);
        getOtpRequest();
        otpForm();
        menuHideShow();
    })
    .catch(error => {
      frameDiv.innerHTML = error.error || '<p>Internal server error</p>';
      console.error('Error verifying OTP:', error);
      
    });
});

function VerifyContainer(data) {
  return `
    <div class="email-container">
      <div class="email-block">
        <h2>Account Verification</h2>
        <div class="email-info">
          <p>Email verification is a crucial step in ensuring the security and integrity of your account. It helps us confirm that the email address associated with your account belongs to you, and it enables us to communicate important updates, notifications, and security alerts.</p>
          <p>It's important to verify your email address to:</p>
          <ul>
            <li>Secure your account: Verification helps prevent unauthorized access to your account.</li>
            <li>Recover your account: Verified email addresses allow for easier account recovery in case you forget your password or encounter login issues.</li>
            <li>Receive notifications: Stay informed about account activities, updates, and new features.</li>
          </ul>
          <p>Once your email address is verified, you'll receive an OTP (One-Time Password) for additional account verification. Please ensure that you have access to the provided email address to complete the verification process.</p>
          <p>If you haven't received the verification email, please check your
          spam or junk folder, as it may have been filtered incorrectly. You can also click the "Resend OTP" button to request another OTP email.</p>
          </div>
          <form id="verificationForm">
          <label for="email">Email (Gmail):</label>
          <input type="email" id="email" name="email" value="${data}" required readonly>
          <div class="getOtp-block">
          <button type="button" id="getOtp">Get OTP</button>
          </div>
          </form>
          <p id="otpMessage"></p>
        </div>
        <div class="otp-block">
          <h2>Enter OTP</h2>
          <form id="otpForm">
            <label for="email-otp">Enter OTP:</label>
            <input type="text" id="email-otp" name="otp" required>
      
            <div class = "otp-buttons">
            <button type="button" id="verifyOtp">Verify OTP</button>
            <button type="button" id="resendOtp">Resend OTP</button>
            </div>
          </form>
        </div>
      </div>
      `;
} 

function getOtpRequest()
{
  document.getElementById('getOtp').addEventListener('click', async (event) => {
    getOtp(event);
  });
}
 async function getOtp(event) {
      try {
          event.preventDefault();
          const email = document.getElementById('email').value.trim();
         const btn =  document.getElementById('getOtp');
         const otpMessage = document.getElementById('otpMessage');
         const otpBlock = document.querySelector('.otp-block');
         otpMessage.textContent = '';
        btn.disabled =true;
        btn.textContent ='sending...'
          if (!isValidEmail(email)) {
            throw new Error('Invalid email address');
          }
          const response = await fetch('/sendOtpRequest', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ email })
          });
          const data = await response.json();

          otpMessage.textContent = data.message;
          btn.textContent ='Get OTP';
          btn.disabled = false;
          otpMessage.style.color = (data.status == 0) ? 'red' : 'green';
          otpBlock.style.display ='block';
      } catch (error) {
          console.error('Error getting OTP:', error);
          document.getElementById('otpMessage').textContent = 'Error getting OTP. Please try again later.';
      }
 
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function otpForm() {
  document.getElementById('verifyOtp').addEventListener('click', (event) => {
    event.preventDefault();
    const otp = document.getElementById('email-otp');
    const otpButton = document.getElementById('verifyOtp');
   
    otp.addEventListener('click',()=>{
      otpButton.textContent ='Verify OTP';
       otpButton.style.background ='#007bff';
      });

    if (otp.value.trim() === '') {
      otpButton.textContent = "Please enter OTP";
      otpButton.style.backgroundColor = "red";
      return;
    }

    fetch('/verifyOtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp: otp.value })
      })
      .then(response => {
        if (!response.ok) {
          otpButton.textContent =  response.error;
          otpButton.style.backgroundColor = "red";
        }
        return response.json(); 
    })
      .then(data => {
        otpButton.textContent = data.message;
        otpButton.style.backgroundColor = "green";
      })
      .catch(error => {
        console.error('Error verifying OTP:', error);
        console.log(error.error,error.message)
        otpButton.textContent = error;
        otpButton.style.backgroundColor = "red";
      });
  });

  document.getElementById('resendOtp').addEventListener('click', async (event) => {
    const btn = document.getElementById('resendOtp');
    btn.textContent = 'Sending...';
    try {
        await getOtp(event);
        btn.textContent = 'Sent';
    } catch (error) {
        console.error('Error resending OTP:', error);
        btn.textContent = 'Failed';
    }
});

}



document.getElementById('deleteRequest').addEventListener('click',(event)=>{
  loader.style.display ='block';

  const frameDiv = document.getElementById('show-frame-data');


    fetch('/account-deletion-Request', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data) {
              
            frameDiv.innerHTML =  accountDeletionRequestForm(data)
            postAccountDeleteRequest();
            menuHideShow();
            loader.style.display ='none';
              
            }
        })
        .catch(error => {
            deleteButton.textContent = error.message || error.error;
           
        });

})

function accountDeletionRequestForm(data) {
  let deletionStatus = '';
  let additionalInfo = '';
  if (data.deletionRequest.deleteRequestDate) {
      const requestDate = new Date(data.deletionRequest.deleteRequestDate);
      const currentDate = new Date();
      const remainingDays = Math.ceil((requestDate.getTime() + 15 * 24 * 60 * 60 * 1000 - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      if (remainingDays > 0) {
          deletionStatus = `Please wait ${remainingDays} days for your account to be deactivated and deleted.`;
      } else {
          deletionStatus = 'Your account will be deactivated and deleted soon.';
      }
      additionalInfo = `Once your account is deleted, you will lose access to all your data and account-related information. Please make sure to backup any important data before proceeding with the deletion.`;
  }
  return `
        <div class="deletion-info">
        <p>After account deletion, you won't be able to access my portfolio, and all your contacts will be deleted. Please connect with me if you want to stay in touch.</p>
        <p>If you change your mind later, you may lose access to your account permanently. Please consider backing up any important data before proceeding with the deletion.</p>
        <p>Once your account is deleted, you won't receive any notifications or updates from my portfolio.</p>
        <p>Please note that account deletion is irreversible. Once your account is deleted, you won't be able to recover it, and all your data will be permanently lost.</p>
        <p>If you have any concerns or questions regarding account deletion, feel free to contact me. I'm here to assist you.</p>
        
      </div>
      <form id="deletionRequestForm">
          <label for="deleteRequest" class="inline">Do you want to delete your account? 
          <input type="checkbox" id="deleteRequestcheck" name="deleteRequest" ${data.deletionRequest.deleteRequest ? 'checked' : ''}>
          <p>${data.deletionRequest.deleteRequest ? '(Uncheck here if you want to keep your account and submit)' : ''}</p>
          </label>
  
          

          ${data.deletionRequest.deleteRequestDate ? `
              <label for="deleteRequestDate">Deletion Request Date:</label>
              <input type="date" id="deleteRequestDate" name="deleteRequestDate" value="${formatToISODate(data.deletionRequest.deleteRequestDate)}">
              <label for="deleteRequestStatus">Deletion Request Status:</label>
              ${deletionStatus}
              <label for="additionalInfo">Additional Information:</label>
              <p>${additionalInfo}</p>
          ` : ''}

          <label for="deleteRequestReason">Deletion Request Reason:</label>
          <textarea id="deleteRequestReason" name="deleteRequestReason">${data.deletionRequest.deleteRequestReason || ''}</textarea>
          
         
          
          <button type="submit">Submit</button>
      </form>
  `;
}

function postAccountDeleteRequest() {
  const form = document.getElementById('deletionRequestForm');
  const button = form.querySelector('[type="submit"]');

  form.addEventListener('submit', async (event) => {
      event.preventDefault();

      // Get form data
      const deleteRequest = document.getElementById('deleteRequestcheck').checked;
      const deleteRequestReason = document.getElementById('deleteRequestReason').value;
     const deleteRequestDateElement = document.getElementById('deleteRequestDate');
     const deleteRequestDate = deleteRequestDateElement ? deleteRequestDateElement.value : Date.now();
    
     

      // Update button text
      button.textContent = 'Sending request...';

      try {
          const response = await fetch('/submit-account-delete-request', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ deleteRequest, deleteRequestReason, deleteRequestDate })
          });

          if (!response.ok) {
              throw new Error('Failed to submit account deletion request');
          }

          const responseData = await response.json();
          if (responseData.message) {
              button.textContent = responseData.message || 'Request sent';
          }
      } catch (error) {
          // Handle error
          console.error('Error submitting account deletion request:', error);
          alert('Failed to submit account deletion request. Please try again later.');
          button.textContent = 'Submit'; // Reset button text in case of error
      }
  });
}




function loginLogoutButton(){

    const logOutButton = document.getElementById('logOutButton');
    const loginButton = document.getElementById('loginButton');

    if (logOutButton) {
       

        logOutButton.addEventListener('click', async () => {
            try {
              logOutButton.textContent = "Logging out...";
                const response = await fetch('/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to logout');
                }

                const responseData = await response.json();
                logOutButton.textContent = responseData.message;
                window.location.href = '/login';
            } catch (error) {
                console.error('Error logging out:', error);
                alert('Failed to logout. Please try again later.');
                logOutButton.textContent = "Logout";
            }
        });
    }

    if (loginButton) {
       

      loginButton.addEventListener('click', async () => {

        window.location.href ='/login';
      })
    }
}



document.getElementById('videocall').addEventListener('click',(event)=>{
  loader.style.display ='block';

  const frameDiv = document.getElementById('show-frame-data');


    fetch('/videocallaccess', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data) {
              
            frameDiv.innerHTML =  videocall(data.userData,data.videocallRequestData)
            sendVideoCallInfo();
            menuHideShow();
            loader.style.display ='none';
            rescheduleform()
              
            }
        })
        .catch(error => {
            frameDiv.textContent = error.message || error.error ||error;
           
        });
});


function videocall(data,videocallRequestData) {
  let videoCallOptions = '';
  if (!data.verifiedByGoogle) {
    return  videoCallOptions = `<div>Please verify yourself to access video calling options.</div>`;
  } else {
      videoCallOptions = `
                <div class="video-call-options">
                <h2>Video Calling Options</h2>
                    <form id="send-video-request">
                          <div class="option">
                              <label for="email">Your Email:</label>
                              <input type="email" id="email" name="email" value="${data.email}" required unchanged readonly>
                          </div>
                          <div class="option">
                              <label for="timing">Timing for Video Call:</label>
                              <input type="datetime-local" id="timing" name="timing" required>
                          </div>
                          <div class="option">
                              <label for="requesterFirstName">Your First Name:</label>
                              <input type="text" id="requesterFirstName" name="requesterFirstName" value="${data.Fname}" required readonly>
                          </div>
                          <div class="option">
                              <label for="requesterLastName">Your Last Name:</label>
                              <input type="text" id="requesterLastName" name="requesterLastName" value="${data.Lname}" readonly>
                          </div>
                          <div class="option">
                              <button id="sendRequest" >Send Video Call Request</button>
                          </div>
                    </form>
                  </div>
  
      `;
  }

  let requestsHTML = '';
  let RescheduleHTML = '';
  videocallRequestData.forEach(request => {

    const joinLink = request.status === 'Accepted' ? `<a href="/joinvideocall/${request.userEmail}/${request.requestId}" target="_blank">Join</a>` : (request.status === 'Declined' ? `<button disabled>Request Declined</button>` : '');
    const rescheduleOption = `
    <form class="rescheduleform">
        <label for="rescheduleDateTime">Reschedule Date & Time:</label>
        <input type="datetime-local"  name="rescheduleDateTime" required>
        <input type="hidden"  name="userEmail" value="${request.userEmail}" required>
        <input type="hidden"  name="requestId" value="${request.requestId}" required>
        <button type="submit" name ="submit" class="">Submit</button>
    </form>
`;
      requestsHTML += `
          <li> <div class="requestOption">Request - <span class="${request.status.toLowerCase()}">${request.status} - ${formatDateTime(request.timing)}</span>   </div> ${joinLink} ${rescheduleOption} </li>
      `;
      RescheduleHTML += `
      ${request.rescheduledTiming ? `<li>Rescheduled Time - <span class="reschedule"><input type="datetime-local" id="rescheduleTime${request._id}" name="rescheduleTime${request._id}" value="${request.rescheduledTiming ? new Date(request.rescheduledTiming).toISOString().slice(0, -8) : ''}" required readonly></span> ${joinLink}</li>` : ''}
      `;
      
  });
 

  return `
          <div class="video-call-container">
          ${videoCallOptions}
          <div class="video-call-requests">
              <h2>Video Calling Requests</h2>
              <ul>
                ${requestsHTML ? requestsHTML : "<p class ='no-requests'>No requests are there.</p>" }
            </ul>
          </div>
          <div class="reschedule-section">
              <h2>Reschedule Video Calls</h2>
              <ul>
              ${RescheduleHTML ? RescheduleHTML : "<p class ='RescheduleHTML'>No requests are there.</p>"}
               </ul>
          </div>
        </div>
  `;
}

function sendVideoCallInfo() {
  const form = document.getElementById('send-video-request');
  const button = document.getElementById('sendRequest');
  form.addEventListener('submit', async (event) => {
      event.preventDefault(); 
    button.textContent = "Sending Video Call Request";
    button.style.backgroundColor = "green";
    button.disabled = true;

     const formData = new FormData(form);

      const jsonObject = {};
      formData.forEach((value, key) => {
          jsonObject[key] = value;
      });

     try {
          const response = await fetch('/send-video-call-info', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(jsonObject)
          });

          if (!response.ok) {
              throw new Error('Network response was not ok');
          }

          const responseData = await response.json();
          if(responseData.message)
          {
            button.textContent = responseData.message;
          }
          else if(responseData.error){
            button.textContent = responseData.error;
          }

        } catch (error) {
          console.error('Error sending video call info:', error);
      }
  });
}

function rescheduleform() {
  document.querySelectorAll('.rescheduleform').forEach(form => {
      form.addEventListener('submit', async (event) => {
          event.preventDefault();

          const formData = new FormData(event.target);
          const rescheduleDateTime = formData.get('rescheduleDateTime');
          const requestId = formData.get('requestId');
          const userEmail = formData.get('userEmail');
          const button = event.submitter;
          button.textContent ='Rescheduling...';
          button.style.backgroundColor ='green';
          button.disabled = true;
          try {
              const response = await fetch('/reschedule/videoCall', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ rescheduleDateTime,requestId,userEmail })
              });

              if (!response.ok) {
                  throw new Error('Network response was not ok');
              }

              const data = await response.json();
              if(data.message)
              {
                button.textContent = data.message;
              }
              else if(data.error)
              {
                console.log('Reschedule error:', data.error);
              }
            
              
          } catch (error) {
              console.error('Error rescheduling:', error);
             
          }
      });
  });
}




function formatDateTime(dateTimeString) {
  const date = new Date(dateTimeString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `Date : ${day}/${month}/${year} and Time is :  ${hours}:${minutes}`;
}


function formatDate(dateString) {
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-GB', options);
}

// Function to format time
function formatTime(timeString) {
  const options = { hour: '2-digit', minute: '2-digit', hour12: false };
  return new Date(timeString).toLocaleTimeString('en-US', options);
}


// document.addEventListener('contextmenu', event => event.preventDefault());
