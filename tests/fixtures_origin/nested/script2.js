const classes = 'responsive-class another-class';
document.querySelectorAll(`.${classes}`).forEach(el => {
    el.style.display = 'none';
});
