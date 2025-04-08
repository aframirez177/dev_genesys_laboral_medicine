// Función para inicializar el sistema de pestañas con rotación automática
export function initExamsTabs() {
    // Obtener el contenedor original
    const originalContainer = document.querySelector('.exams-cards');
    if (!originalContainer) return;
    
    // Obtener todos los artículos de exámenes
    const exams = originalContainer.querySelectorAll('.exam');
    if (exams.length === 0) return;
    
    // Agrupar exámenes por categoría basado en el título h3
    const categoriesMap = {};
    
    exams.forEach(exam => {
      const titleElement = exam.querySelector('h3');
      if (!titleElement) return;
      
      const categoryTitle = titleElement.textContent.trim();
      
      if (!categoriesMap[categoryTitle]) {
        categoriesMap[categoryTitle] = [];
      }
      
      // Obtener todos los elementos li (exámenes individuales)
      const examItems = exam.querySelectorAll('li');
      examItems.forEach(item => {
        categoriesMap[categoryTitle].push(item.textContent.trim());
      });
    });
    
    // Crear nuevo contenedor
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'exams-container';
    
    // Crear navegación de pestañas
    const tabsNav = document.createElement('div');
    tabsNav.className = 'exams-tabs';
    
    // Crear contenedor para el contenido
    const tabsContent = document.createElement('div');
    tabsContent.className = 'exams-content';
    
    // Variable para el intervalo de rotación automática
    let autoRotateInterval;
    let currentTabIndex = 0;
    const totalTabs = Object.keys(categoriesMap).length;
    
    // Función para cambiar de pestaña
    function changeTab(index) {
      // Asegurarse de que el índice sea válido
      if (index < 0) index = totalTabs - 1;
      if (index >= totalTabs) index = 0;
      
      currentTabIndex = index;
      
      // Desactivar todas las pestañas
      document.querySelectorAll('.exams-tabs-button').forEach(btn => {
        btn.classList.remove('active');
      });
      document.querySelectorAll('.exams-content-panel').forEach(panel => {
        panel.classList.remove('active');
      });
      
      // Activar la pestaña actual
      const currentTab = document.querySelector(`.exams-tabs-button[data-tab="${index}"]`);
      const currentPanel = document.querySelector(`.exams-content-panel[data-panel="${index}"]`);
      
      if (currentTab) currentTab.classList.add('active');
      if (currentPanel) currentPanel.classList.add('active');
    }
    
    // Función para iniciar la rotación automática
    function startAutoRotate() {
      stopAutoRotate(); // Detener cualquier intervalo existente
      
      autoRotateInterval = setInterval(() => {
        changeTab(currentTabIndex + 1);
      }, 8000); // Cambiar cada 88 segundos
    }
    
    // Función para detener la rotación automática
    function stopAutoRotate() {
      if (autoRotateInterval) {
        clearInterval(autoRotateInterval);
        autoRotateInterval = null;
      }
    }
    
    // Crear pestañas y paneles para cada categoría
    Object.entries(categoriesMap).forEach(([category, items], index) => {
      // Limpiar emoji si existe
      let displayCategory = category.replace(/([\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}])\s*$/u, '').trim();
      let emoji = '';
      
      const emojiMatch = category.match(/([\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}])\s*$/u);
      if (emojiMatch) {
        emoji = emojiMatch[1];
      }
      
      // Crear botón de pestaña
      const tabButton = document.createElement('button');
      tabButton.className = 'exams-tabs-button';
      tabButton.textContent = displayCategory;
      if (emoji) {
        const emojiSpan = document.createElement('span');
        emojiSpan.className = 'emoji';
        emojiSpan.textContent = ' ' + emoji;
        tabButton.appendChild(emojiSpan);
      }
      tabButton.dataset.tab = index;
      
      if (index === 0) {
        tabButton.classList.add('active');
      }
      
      tabButton.addEventListener('click', () => {
        changeTab(index);
        stopAutoRotate(); // Detener rotación automática al hacer clic
        
        // Reiniciar rotación automática después de un tiempo de inactividad
        setTimeout(startAutoRotate, 15000); // 15 segundos de inactividad
      });
      
      tabsNav.appendChild(tabButton);
      
      // Crear panel de contenido
      const tabPanel = document.createElement('div');
      tabPanel.className = 'exams-content-panel';
      tabPanel.dataset.panel = index;
      
      if (index === 0) {
        tabPanel.classList.add('active');
      }
      
      // Añadir elementos al panel
      items.forEach(itemText => {
        const examCard = document.createElement('div');
        examCard.className = 'exam-card';
        examCard.textContent = itemText;
        tabPanel.appendChild(examCard);
      });
      
      tabsContent.appendChild(tabPanel);
    });
    
    // Añadir componentes al contenedor
    tabsContainer.appendChild(tabsNav);
    tabsContainer.appendChild(tabsContent);
    
    // Insertar después del contenedor original
    originalContainer.parentNode.insertBefore(tabsContainer, originalContainer.nextSibling);
    
    // Iniciar rotación automática
    startAutoRotate();
    
    // Detener rotación cuando el ratón está sobre el contenedor
    tabsContainer.addEventListener('mouseenter', stopAutoRotate);
    
    // Reiniciar rotación cuando el ratón sale del contenedor
    tabsContainer.addEventListener('mouseleave', startAutoRotate);
    
    // Pausar la rotación cuando la página pierde el foco
    window.addEventListener('blur', stopAutoRotate);
    
    // Reiniciar rotación cuando la página recupera el foco
    window.addEventListener('focus', startAutoRotate);
  }
  
/*   // Auto-inicialización
  document.addEventListener('DOMContentLoaded', initExamsTabs); */