
document.getElementById("myButton").onclick = function () {
    this.style.backgroundColor = "red";
};

var fileInput = document.getElementById('fileInput');
var fileInputLabel = document.getElementById('fileInputLabel');

fileInput.addEventListener('change', function () {
    if (fileInput.files && fileInput.files.length > 0) {
        var fileName = '';
        if (fileInput.files.length === 1) {
            fileName = fileInput.files[0].name;
        } else {
            fileName = fileInput.files.length + ' files selected';
        }
        fileInputLabel.textContent = fileName;
    } else {
        fileInputLabel.textContent = 'Select Files';
    }
});


const formElem = document.querySelector('form');
formElem.addEventListener('submit', async (e) => {
    console.log("form submitting")
    e.preventDefault();
    await fetch('/admin/logo/upload', {
        method: 'POST',
        body: new FormData(formElem),
    }).then(response => {
        document.querySelector('p').textContent = "Successfully uploaded to drive";
        document.getElementById("myButton").style.backgroundColor = "green"
        document.getElementById('fileInputLabel').textContent = "Select Files";
        document.querySelector('p').style.display = 'block';
        console.log(response);
    }).catch(error => {
        document.querySelector('p').textContent = "Was not uploaded" + error;
        document.querySelector('p').style.display = 'block';
        console.error(error);
    });
});