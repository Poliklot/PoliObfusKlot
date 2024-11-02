const classes = 'c b';
document.querySelectorAll(`.${classes}`).forEach(el => {
  el.style.display = 'none';
});