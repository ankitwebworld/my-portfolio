async function getLogo() {
    const imgLogo = document.getElementById('imgLogo');
    const aboutMeImg = document.getElementById('aboutMeImg');
    const phoneCallImg = document.getElementById('phoneCallImg');
    const gmailiconeImg = document.getElementById('gmailiconeImg');
    const whatsappImg = document.getElementById('whatsappImg');

    imgLogo.src = await `/get-logo-from-drive/AnkitLogo.png`;
    aboutMeImg.src = await `/get-logo-from-drive/aboutMe.png`;
    phoneCallImg.src = await `/get-logo-from-drive/phoneCall.png`;
    gmailiconeImg.src = await `/get-logo-from-drive/gmailicone.png`;
    whatsappImg.src = await `/get-logo-from-drive/whatsapp.png`;
}
getLogo();