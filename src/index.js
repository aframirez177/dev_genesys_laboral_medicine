import Template from './templates/Template.js';
import '../src/js/main.js'
import './styles/scss/main.scss';
import './styles/scss/style_matriz_de_riesgos_profesional.scss'



(async function App() {
  const main = null || document.getElementById('main');
  main.innerHTML = await Template();
})();
