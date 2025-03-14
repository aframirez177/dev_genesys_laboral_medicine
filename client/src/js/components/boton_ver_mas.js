// js/components/verMas.js

export function initializeVerMas() {
    const verMasBtn = document.querySelector(".ver-mas-btn");
    const textContent = document.querySelector(".text-content");
  
    if (verMasBtn && textContent) {
      verMasBtn.addEventListener("click", function () {
        textContent.classList.toggle("expanded");
        verMasBtn.textContent = textContent.classList.contains("expanded") ? "Ver menos" : "Ver más";
      });
    }
  }