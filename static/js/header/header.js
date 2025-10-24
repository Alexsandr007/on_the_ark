document.querySelectorAll(".accordion__title").forEach(title => {
    title.addEventListener("click", () => {
      const parent = title.parentElement;
      parent.classList.toggle("active");
    });
  });

   document.addEventListener("DOMContentLoaded", () => {
    const burger = document.querySelector(".header__burger");
    const menu = document.querySelector(".header__links");
    const buttons = document.querySelector(".header__buttons");

    burger.addEventListener("click", () => {
      menu.classList.toggle("active");
      buttons.classList.toggle("active");
      burger.classList.toggle("open");
    });
  });