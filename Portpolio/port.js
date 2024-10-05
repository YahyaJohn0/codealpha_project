// JavaScript function to navigate to sections smoothly
function navigateTo(sectionId) {
    document.getElementById(sectionId).scrollIntoView({
        ScrollBehavior: 'smooth'
    });
}
