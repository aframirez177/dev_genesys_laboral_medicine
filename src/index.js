import Template from './templates/Template.js';
import '../src/js/main.js'
import './styles/scss/main.scss';




(async function App() {
  const main = null || document.getElementById('main');
  main.innerHTML = await Template();
})();
