import './js/matriz_de_riesgos_profesional.js'
import './styles/scss/style_matriz_de_riesgos_profesional.scss'




(async function App() {
  const main = null || document.getElementById('main');
  main.innerHTML = await Template();
})();
