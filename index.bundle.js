/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _src_js_main_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../src/js/main.js */ \"./src/js/main.js\");\n\n\n//# sourceURL=webpack://dev_genesys_laboral_medicine/./src/index.js?");

/***/ }),

/***/ "./src/js/components/calculator.js":
/*!*****************************************!*\
  !*** ./src/js/components/calculator.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   initCalculator: () => (/* binding */ initCalculator)\n/* harmony export */ });\n// Objeto para almacenar los rangos de descuento\nvar discountRanges = {\n  '1-10': 0.05,\n  '11-50': 0.10,\n  '51-100': 0.15,\n  '101-500': 0.20,\n  '501+': 0.25\n};\n\n// Función para obtener el descuento basado en el número de trabajadores\nfunction getDiscount(numWorkers) {\n  if (numWorkers <= 10) return discountRanges['1-10'];\n  if (numWorkers <= 50) return discountRanges['11-50'];\n  if (numWorkers <= 100) return discountRanges['51-100'];\n  if (numWorkers <= 500) return discountRanges['101-500'];\n  return discountRanges['501+'];\n}\nfunction formatPrice(price) {\n  return new Intl.NumberFormat('es-CO', {\n    style: 'currency',\n    currency: 'COP',\n    minimumFractionDigits: 0\n  }).format(price);\n}\nfunction initCalculator() {\n  var checkboxItems = document.querySelectorAll('.checkbox-item');\n  var examTitle = document.getElementById('examTitle');\n  var examDescription = document.getElementById('examDescription');\n  var examPrice = document.getElementById('examPrice');\n  var cargoInput = document.getElementById('cargo');\n  var packageName = document.getElementById('packageName');\n  var workerPrice = document.getElementById('workerPrice');\n  var totalPrice = document.getElementById('totalPrice');\n  var trabajadoresInput = document.getElementById('trabajadores');\n  var discount1Checkbox = document.getElementById('discount1');\n  var discount2Checkbox = document.getElementById('discount2');\n  var totalPriceElement = document.querySelector('.total-price');\n  if (!checkboxItems.length || !examTitle || !examDescription || !examPrice || !cargoInput || !packageName || !workerPrice || !totalPrice || !trabajadoresInput || !discount1Checkbox || !discount2Checkbox || !totalPriceElement) {\n    console.error('Faltan elementos necesarios para la calculadora');\n    return;\n  }\n  var lastSelectedExam = null;\n  var totalExamPrice = 0;\n  function updateExamDescription(title, description, price) {\n    examTitle.textContent = title;\n    examDescription.textContent = description;\n    examPrice.innerHTML = \"Desde: <span class=\\\"min-price\\\">\".concat(formatPrice(price), \"</span>\");\n  }\n  function updatePackageSummary() {\n    var cargo = cargoInput.value.trim() || 'Cargo';\n    packageName.textContent = \"Paquete \".concat(cargo);\n    workerPrice.textContent = formatPrice(totalExamPrice);\n    var numTrabajadores = parseInt(trabajadoresInput.value) || 1;\n    var packageTotal = totalExamPrice * numTrabajadores;\n    totalPrice.textContent = formatPrice(packageTotal);\n\n    // Calcular el precio final con descuentos\n    var finalPrice = packageTotal;\n    var workerDiscount = getDiscount(numTrabajadores);\n    if (discount1Checkbox.checked) {\n      finalPrice *= 1 - workerDiscount;\n    }\n    if (discount2Checkbox.checked) {\n      finalPrice *= 0.95; // 5% de descuento adicional\n    }\n    totalPriceElement.textContent = formatPrice(finalPrice);\n  }\n  function calculateTotalPrice() {\n    totalExamPrice = 0;\n    checkboxItems.forEach(function (item) {\n      var checkbox = item.querySelector('input[type=\"checkbox\"]');\n      if (checkbox.checked) {\n        totalExamPrice += parseInt(item.dataset.price);\n      }\n    });\n    updatePackageSummary();\n  }\n  checkboxItems.forEach(function (item) {\n    var checkbox = item.querySelector('input[type=\"checkbox\"]');\n    item.addEventListener('mouseenter', function () {\n      updateExamDescription(item.title, item.dataset.description, item.dataset.price);\n    });\n    item.addEventListener('mouseleave', function () {\n      if (lastSelectedExam) {\n        updateExamDescription(lastSelectedExam.title, lastSelectedExam.dataset.description, lastSelectedExam.dataset.price);\n      } else {\n        updateExamDescription('Seleccione un examen', 'Pase el cursor sobre un examen para ver su descripción.', 0);\n      }\n    });\n    checkbox.addEventListener('change', function () {\n      if (checkbox.checked) {\n        lastSelectedExam = item;\n        updateExamDescription(item.title, item.dataset.description, item.dataset.price);\n      } else if (lastSelectedExam === item) {\n        lastSelectedExam = null;\n        updateExamDescription('Seleccione un examen', 'Pase el cursor sobre un examen para ver su descripción.', 0);\n      }\n      calculateTotalPrice();\n    });\n  });\n  cargoInput.addEventListener('input', updatePackageSummary);\n  trabajadoresInput.addEventListener('input', calculateTotalPrice);\n  discount1Checkbox.addEventListener('change', updatePackageSummary);\n  discount2Checkbox.addEventListener('change', updatePackageSummary);\n\n  // Inicialización\n  calculateTotalPrice();\n}\n\n//# sourceURL=webpack://dev_genesys_laboral_medicine/./src/js/components/calculator.js?");

/***/ }),

/***/ "./src/js/components/cardVisibility.js":
/*!*********************************************!*\
  !*** ./src/js/components/cardVisibility.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   initCardVisibility: () => (/* binding */ initCardVisibility)\n/* harmony export */ });\nfunction initCardVisibility() {\n  var cards = document.querySelectorAll('.step-card, .client-card');\n  if (!cards.length) return;\n  var observer = new IntersectionObserver(function (entries) {\n    entries.forEach(function (entry) {\n      if (entry.isIntersecting) {\n        entry.target.classList.add('visible');\n      } else {\n        entry.target.classList.remove('visible');\n      }\n    });\n  }, {\n    threshold: 0.1,\n    rootMargin: '0px 0px -100px 0px'\n  });\n  cards.forEach(function (card) {\n    return observer.observe(card);\n  });\n}\n\n//# sourceURL=webpack://dev_genesys_laboral_medicine/./src/js/components/cardVisibility.js?");

/***/ }),

/***/ "./src/js/components/clients.js":
/*!**************************************!*\
  !*** ./src/js/components/clients.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   initClients: () => (/* binding */ initClients)\n/* harmony export */ });\nfunction initClients() {\n  var clientsContainer = document.querySelector('.clients');\n  if (!clientsContainer) return;\n  var clients = [];\n  clients.forEach(function (client) {\n    var clientElement = document.createElement('div');\n    clientElement.classList.add('client');\n    clientElement.innerHTML = \"\\n            <img src=\\\"\".concat(client.logo, \"\\\" alt=\\\"\").concat(client.name, \"\\\" loading=\\\"lazy\\\">\\n            <p>\").concat(client.name, \"</p>\\n        \");\n    clientsContainer.appendChild(clientElement);\n  });\n}\n\n//# sourceURL=webpack://dev_genesys_laboral_medicine/./src/js/components/clients.js?");

/***/ }),

/***/ "./src/js/components/dropdown.js":
/*!***************************************!*\
  !*** ./src/js/components/dropdown.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   initDropdown: () => (/* binding */ initDropdown)\n/* harmony export */ });\nfunction initDropdown() {\n  var dropdownToggle = document.querySelector('.dropdown-toggle');\n  var dropdownMenu = document.getElementById('services-menu');\n  if (!dropdownToggle || !dropdownMenu) return;\n  dropdownToggle.addEventListener('click', function () {\n    var expanded = this.getAttribute('aria-expanded') === 'true' || false;\n    this.setAttribute('aria-expanded', !expanded);\n    dropdownMenu.setAttribute('aria-hidden', expanded);\n  });\n\n  // Cerrar el menú al hacer clic fuera de él\n  document.addEventListener('click', function (e) {\n    if (!dropdownToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {\n      dropdownToggle.setAttribute('aria-expanded', 'false');\n      dropdownMenu.setAttribute('aria-hidden', 'true');\n    }\n  });\n}\n\n//# sourceURL=webpack://dev_genesys_laboral_medicine/./src/js/components/dropdown.js?");

/***/ }),

/***/ "./src/js/components/faq.js":
/*!**********************************!*\
  !*** ./src/js/components/faq.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   initFAQ: () => (/* binding */ initFAQ)\n/* harmony export */ });\nfunction initFAQ() {\n  var faqContainer = document.querySelector('.faqs__grid');\n  if (!faqContainer) return;\n  var faqs = [{\n    question: \"¿Cuánto me va a costar implementar un programa de SST completo?\",\n    answer: \"En Genesys, adaptamos nuestros programas de SST a las necesidades específicas de tu empresa. Ofrecemos soluciones flexibles y escalables, asegurando que obtengas el mejor valor por tu inversión sin comprometer la calidad. Contáctanos para una cotización personalizada.\"\n  }\n  // Añade más preguntas y respuestas aquí\n  ];\n  faqs.forEach(function (faq, index) {\n    var faqItem = document.createElement('div');\n    faqItem.classList.add('faqs__item');\n    faqItem.innerHTML = \"\\n            <div class=\\\"faqs__question\\\" tabindex=\\\"0\\\" aria-expanded=\\\"false\\\" aria-controls=\\\"faq-answer-\".concat(index, \"\\\">\\n                \").concat(faq.question, \"\\n            </div>\\n            <div id=\\\"faq-answer-\").concat(index, \"\\\" class=\\\"faqs__answer\\\" aria-hidden=\\\"true\\\">\\n                \").concat(faq.answer, \"\\n            </div>\\n        \");\n    faqContainer.appendChild(faqItem);\n  });\n  faqContainer.addEventListener('click', function (e) {\n    var question = e.target.closest('.faqs__question');\n    if (question) {\n      var answer = question.nextElementSibling;\n      var isExpanded = question.getAttribute('aria-expanded') === 'true';\n      question.setAttribute('aria-expanded', !isExpanded);\n      answer.setAttribute('aria-hidden', isExpanded);\n      answer.style.maxHeight = isExpanded ? null : answer.scrollHeight + \"px\";\n    }\n  });\n}\n\n//# sourceURL=webpack://dev_genesys_laboral_medicine/./src/js/components/faq.js?");

/***/ }),

/***/ "./src/js/components/hamburgerMenu.js":
/*!********************************************!*\
  !*** ./src/js/components/hamburgerMenu.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   initHamburgerMenu: () => (/* binding */ initHamburgerMenu)\n/* harmony export */ });\nfunction initHamburgerMenu() {\n  var hamburger = document.querySelector('.ham-menu');\n  var offScreenMenu = document.querySelector('.off-screen-menu');\n  if (!hamburger || !offScreenMenu) return;\n  hamburger.addEventListener('click', function () {\n    this.classList.toggle('active');\n    offScreenMenu.classList.toggle('active');\n    document.body.classList.toggle('menu-open');\n  });\n\n  // Cerrar el menú al hacer clic fuera de él\n  document.addEventListener('click', function (e) {\n    if (offScreenMenu.classList.contains('active') && !offScreenMenu.contains(e.target) && !hamburger.contains(e.target)) {\n      hamburger.click();\n    }\n  });\n}\n\n//# sourceURL=webpack://dev_genesys_laboral_medicine/./src/js/components/hamburgerMenu.js?");

/***/ }),

/***/ "./src/js/components/map.js":
/*!**********************************!*\
  !*** ./src/js/components/map.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   initMap: () => (/* binding */ initMap)\n/* harmony export */ });\n/* harmony import */ var _assets_images_logo_negro_maps_png__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../assets/images/logo_negro_maps.png */ \"./src/assets/images/logo_negro_maps.png\");\n // Ajusta la ruta según tu estructura\nfunction initMap() {\n  var mapContainer = document.getElementById('map-container');\n  var mapButtons = document.querySelectorAll('.map-button');\n  if (!mapContainer || !mapButtons.length) return;\n  var lat = 4.6747451365260595;\n  var lng = -74.06211526147553;\n\n  // Función para cargar el script de Google Maps\n  function loadGoogleMaps() {\n    var script = document.createElement('script');\n    script.src = \"https://maps.googleapis.com/maps/api/js?key=AIzaSyCjHr3DJQXXQJsbG7rhKl5tkQoSbDP1UDc&callback=initGoogleMap\";\n    script.async = true;\n    document.head.appendChild(script);\n  }\n\n  // Función para inicializar el mapa\n  window.initGoogleMap = function () {\n    var map = new google.maps.Map(mapContainer, {\n      center: {\n        lat: lat,\n        lng: lng\n      },\n      zoom: 14\n    });\n\n    // Definir el icono personalizado\n\n    var customMarker = {\n      url: _assets_images_logo_negro_maps_png__WEBPACK_IMPORTED_MODULE_0__,\n      // Usa la imagen importada\n      scaledSize: new google.maps.Size(50, 50),\n      // Ajusta el tamaño\n      origin: new google.maps.Point(0, 0),\n      anchor: new google.maps.Point(25, 25)\n    };\n    new google.maps.Marker({\n      position: {\n        lat: lat,\n        lng: lng\n      },\n      map: map,\n      icon: customMarker,\n      title: 'Nuestra ubicación'\n    });\n  };\n\n  // Cargar el mapa cuando sea visible\n  var observer = new IntersectionObserver(function (entries) {\n    if (entries[0].isIntersecting) {\n      loadGoogleMaps();\n      observer.disconnect();\n    }\n  }, {\n    threshold: 0.1\n  });\n  observer.observe(mapContainer);\n\n  // Manejar clics en los botones de mapa\n  mapButtons.forEach(function (button) {\n    button.addEventListener('click', function () {\n      var mapType = this.dataset.map;\n      var url;\n      switch (mapType) {\n        case 'waze':\n          url = \"https://www.waze.com/ul?ll=\".concat(lat, \",\").concat(lng, \"&navigate=yes\");\n          break;\n        case 'moovit':\n          url = \"https://moovit.com/?to=Nuestra%20Ubicaci\\xF3n&tll=\".concat(lat, \"_\").concat(lng);\n          break;\n        case 'google':\n          url = \"https://www.google.com/maps/search/?api=1&query=\".concat(lat, \",\").concat(lng);\n          break;\n      }\n      if (url) window.open(url, '_blank');\n    });\n  });\n}\n\n//# sourceURL=webpack://dev_genesys_laboral_medicine/./src/js/components/map.js?");

/***/ }),

/***/ "./src/js/components/whatsapp.js":
/*!***************************************!*\
  !*** ./src/js/components/whatsapp.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   initWhatsApp: () => (/* binding */ initWhatsApp)\n/* harmony export */ });\nfunction initWhatsApp() {\n  var whatsappButton = document.getElementById('whatsapp-button');\n  var whatsappPopup = document.getElementById('whatsapp-popup');\n  var closePopup = document.getElementById('close-popup');\n  var startChat = document.getElementById('start-chat');\n  if (!whatsappButton || !whatsappPopup || !closePopup || !startChat) return;\n  whatsappButton.addEventListener('click', function () {\n    whatsappPopup.style.display = 'block';\n    setTimeout(function () {\n      whatsappPopup.classList.add('show');\n    }, 10);\n  });\n  closePopup.addEventListener('click', function () {\n    whatsappPopup.classList.remove('show');\n    setTimeout(function () {\n      whatsappPopup.style.display = 'none';\n    }, 300);\n  });\n  startChat.addEventListener('click', function () {\n    window.open('https://wa.me/573205803048', '_blank');\n  });\n}\n\n//# sourceURL=webpack://dev_genesys_laboral_medicine/./src/js/components/whatsapp.js?");

/***/ }),

/***/ "./src/js/main.js":
/*!************************!*\
  !*** ./src/js/main.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _components_dropdown_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components/dropdown.js */ \"./src/js/components/dropdown.js\");\n/* harmony import */ var _components_cardVisibility_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./components/cardVisibility.js */ \"./src/js/components/cardVisibility.js\");\n/* harmony import */ var _components_map_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./components/map.js */ \"./src/js/components/map.js\");\n/* harmony import */ var _components_whatsapp_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./components/whatsapp.js */ \"./src/js/components/whatsapp.js\");\n/* harmony import */ var _components_faq_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./components/faq.js */ \"./src/js/components/faq.js\");\n/* harmony import */ var _components_hamburgerMenu_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./components/hamburgerMenu.js */ \"./src/js/components/hamburgerMenu.js\");\n/* harmony import */ var _components_calculator_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./components/calculator.js */ \"./src/js/components/calculator.js\");\n/* harmony import */ var _components_clients_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./components/clients.js */ \"./src/js/components/clients.js\");\n/* harmony import */ var _utils_animations_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./utils/animations.js */ \"./src/js/utils/animations.js\");\n/* harmony import */ var _styles_scss_main_scss__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../styles/scss/main.scss */ \"./src/styles/scss/main.scss\");\n\n\n\n\n\n\n\n\n\n // Ajusta la ruta a donde esté tu archivo principal SCSS\n\nfunction initApp() {\n  (0,_components_dropdown_js__WEBPACK_IMPORTED_MODULE_0__.initDropdown)();\n  (0,_components_cardVisibility_js__WEBPACK_IMPORTED_MODULE_1__.initCardVisibility)();\n  (0,_components_map_js__WEBPACK_IMPORTED_MODULE_2__.initMap)();\n  (0,_components_whatsapp_js__WEBPACK_IMPORTED_MODULE_3__.initWhatsApp)();\n  (0,_components_faq_js__WEBPACK_IMPORTED_MODULE_4__.initFAQ)();\n  (0,_components_hamburgerMenu_js__WEBPACK_IMPORTED_MODULE_5__.initHamburgerMenu)();\n  (0,_components_calculator_js__WEBPACK_IMPORTED_MODULE_6__.initCalculator)();\n  (0,_components_clients_js__WEBPACK_IMPORTED_MODULE_7__.initClients)();\n\n  // Añadir efecto hover a las imágenes de certificación\n  var certImages = document.querySelectorAll('.certification-img');\n  (0,_utils_animations_js__WEBPACK_IMPORTED_MODULE_8__.addHoverEffect)(certImages);\n\n  // Configurar scroll suave para enlaces internos\n  document.querySelectorAll('a[href^=\"#\"]').forEach(function (anchor) {\n    anchor.addEventListener('click', function (e) {\n      e.preventDefault();\n      var target = document.querySelector(this.getAttribute('href'));\n      if (target) (0,_utils_animations_js__WEBPACK_IMPORTED_MODULE_8__.smoothScroll)(target);\n    });\n  });\n}\n\n// Iniciar la aplicación cuando el DOM esté listo\nif (document.readyState === 'loading') {\n  document.addEventListener('DOMContentLoaded', initApp);\n} else {\n  initApp();\n}\n\n//# sourceURL=webpack://dev_genesys_laboral_medicine/./src/js/main.js?");

/***/ }),

/***/ "./src/js/utils/animations.js":
/*!************************************!*\
  !*** ./src/js/utils/animations.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   addHoverEffect: () => (/* binding */ addHoverEffect),\n/* harmony export */   smoothScroll: () => (/* binding */ smoothScroll)\n/* harmony export */ });\nfunction addHoverEffect(elements) {\n  var scale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1.1;\n  elements.forEach(function (element) {\n    element.addEventListener('mouseenter', function () {\n      element.style.transform = \"scale(\".concat(scale, \")\");\n      element.style.transition = 'transform 0.3s ease';\n    });\n    element.addEventListener('mouseleave', function () {\n      element.style.transform = 'scale(1)';\n    });\n  });\n}\nfunction smoothScroll(element) {\n  element.scrollIntoView({\n    behavior: 'smooth',\n    block: 'start'\n  });\n}\n\n//# sourceURL=webpack://dev_genesys_laboral_medicine/./src/js/utils/animations.js?");

/***/ }),

/***/ "./src/styles/scss/main.scss":
/*!***********************************!*\
  !*** ./src/styles/scss/main.scss ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n// extracted by mini-css-extract-plugin\n\n\n//# sourceURL=webpack://dev_genesys_laboral_medicine/./src/styles/scss/main.scss?");

/***/ }),

/***/ "./src/assets/images/logo_negro_maps.png":
/*!***********************************************!*\
  !*** ./src/assets/images/logo_negro_maps.png ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("module.exports = __webpack_require__.p + \"assets/images/logo_negro_maps.png\";\n\n//# sourceURL=webpack://dev_genesys_laboral_medicine/./src/assets/images/logo_negro_maps.png?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT')
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) {
/******/ 					var i = scripts.length - 1;
/******/ 					while (i > -1 && (!scriptUrl || !/^http(s?):/.test(scriptUrl))) scriptUrl = scripts[i--].src;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.js");
/******/ 	
/******/ })()
;