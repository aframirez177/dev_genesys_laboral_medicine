const hamMenu = document.querySelector(".ham-menu");

const offScreenMenu = document.querySelector(".off-screen-menu");

hamMenu.addEventListener("click", () => {
    hamMenu.classList.toggle("active");
    offScreenMenu.classList.toggle("active");
});

/* const expandCalc = document.querySelector(".colapsable-cargo-button");

const offScreenItems = document.querySelector(".checkbox-group");

expandCalc.addEventListener("click", () => {
    expandCalc.classList.toggle("active");
    offScreenItems.classList.toggle("inactive");
}); */