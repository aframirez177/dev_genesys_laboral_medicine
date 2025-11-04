/**
 * CargoState.js - Sistema de State Management para el formulario de diagnóstico
 *
 * Este módulo gestiona el estado de los cargos de forma reactiva,
 * separando la lógica de negocio del DOM.
 */

export class CargoState {
  constructor() {
    // Estado principal
    this.state = {
      empresa: {
        nombre: '',
        nit: '',
        sector: '',
        region: ''
      },
      cargos: [],
      currentCargoIndex: 0,
      isSubmitting: false,
      lastSaved: null
    };

    // Listeners para cambios de estado
    this.listeners = new Map();
    this.listenerIdCounter = 0;
  }

  /**
   * Obtener el estado completo
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Obtener información de la empresa
   */
  getEmpresa() {
    return { ...this.state.empresa };
  }

  /**
   * Actualizar información de la empresa
   */
  updateEmpresa(data) {
    this.state.empresa = {
      ...this.state.empresa,
      ...data
    };
    this.notify('empresa', this.state.empresa);
  }

  /**
   * Obtener todos los cargos
   */
  getCargos() {
    return [...this.state.cargos];
  }

  /**
   * Obtener un cargo específico por índice
   */
  getCargo(index) {
    if (index < 0 || index >= this.state.cargos.length) {
      return null;
    }
    return { ...this.state.cargos[index] };
  }

  /**
   * Agregar un nuevo cargo
   */
  addCargo(cargo = {}) {
    const defaultCargo = {
      id: Date.now(),
      cargoName: '',
      area: '',
      zona: '',
      numTrabajadores: 1,
      descripcionTareas: '',
      tareasRutinarias: false,
      manipulaAlimentos: false,
      trabajaAlturas: false,
      trabajaEspaciosConfinados: false,
      conduceVehiculo: false,
      gesSeleccionados: []
    };

    const newCargo = {
      ...defaultCargo,
      ...cargo
    };

    this.state.cargos.push(newCargo);
    this.notify('cargos', this.state.cargos);
    return newCargo;
  }

  /**
   * Actualizar un cargo existente
   */
  updateCargo(index, data) {
    if (index < 0 || index >= this.state.cargos.length) {
      console.warn(`Cannot update cargo at index ${index}: out of bounds`);
      return false;
    }

    this.state.cargos[index] = {
      ...this.state.cargos[index],
      ...data
    };

    this.notify('cargos', this.state.cargos);
    this.notify(`cargo-${index}`, this.state.cargos[index]);
    return true;
  }

  /**
   * Eliminar un cargo
   */
  removeCargo(index) {
    if (index < 0 || index >= this.state.cargos.length) {
      console.warn(`Cannot remove cargo at index ${index}: out of bounds`);
      return false;
    }

    this.state.cargos.splice(index, 1);
    this.notify('cargos', this.state.cargos);
    return true;
  }

  /**
   * Agregar un GES a un cargo
   */
  addGESToCargo(cargoIndex, ges) {
    const cargo = this.state.cargos[cargoIndex];
    if (!cargo) {
      console.warn(`Cannot add GES: cargo ${cargoIndex} not found`);
      return false;
    }

    // Evitar duplicados
    const exists = cargo.gesSeleccionados.some(
      g => g.riesgo === ges.riesgo && g.ges === ges.ges
    );

    if (exists) {
      console.warn(`GES already exists in cargo ${cargoIndex}`);
      return false;
    }

    cargo.gesSeleccionados.push(ges);
    this.notify('cargos', this.state.cargos);
    this.notify(`cargo-${cargoIndex}`, cargo);
    return true;
  }

  /**
   * Actualizar un GES en un cargo
   */
  updateGESInCargo(cargoIndex, gesIndex, data) {
    const cargo = this.state.cargos[cargoIndex];
    if (!cargo || !cargo.gesSeleccionados[gesIndex]) {
      console.warn(`Cannot update GES: invalid indices`);
      return false;
    }

    cargo.gesSeleccionados[gesIndex] = {
      ...cargo.gesSeleccionados[gesIndex],
      ...data
    };

    this.notify('cargos', this.state.cargos);
    this.notify(`cargo-${cargoIndex}`, cargo);
    return true;
  }

  /**
   * Eliminar un GES de un cargo
   */
  removeGESFromCargo(cargoIndex, gesIndex) {
    const cargo = this.state.cargos[cargoIndex];
    if (!cargo || !cargo.gesSeleccionados[gesIndex]) {
      console.warn(`Cannot remove GES: invalid indices`);
      return false;
    }

    cargo.gesSeleccionados.splice(gesIndex, 1);
    this.notify('cargos', this.state.cargos);
    this.notify(`cargo-${cargoIndex}`, cargo);
    return true;
  }

  /**
   * Establecer índice del cargo actual (para wizard)
   */
  setCurrentCargoIndex(index) {
    if (index >= 0 && index < this.state.cargos.length) {
      this.state.currentCargoIndex = index;
      this.notify('currentCargoIndex', index);
    }
  }

  /**
   * Obtener índice del cargo actual
   */
  getCurrentCargoIndex() {
    return this.state.currentCargoIndex;
  }

  /**
   * Establecer estado de envío
   */
  setSubmitting(isSubmitting) {
    this.state.isSubmitting = isSubmitting;
    this.notify('isSubmitting', isSubmitting);
  }

  /**
   * Marcar como guardado
   */
  markAsSaved() {
    this.state.lastSaved = new Date();
    this.notify('lastSaved', this.state.lastSaved);
  }

  /**
   * Resetear todo el estado
   */
  reset() {
    this.state = {
      empresa: {
        nombre: '',
        nit: '',
        sector: '',
        region: ''
      },
      cargos: [],
      currentCargoIndex: 0,
      isSubmitting: false,
      lastSaved: null
    };
    this.notify('reset', this.state);
  }

  /**
   * Cargar estado desde objeto (para restore de localStorage)
   */
  loadState(savedState) {
    if (savedState && typeof savedState === 'object') {
      this.state = {
        ...this.state,
        ...savedState,
        lastSaved: savedState.lastSaved ? new Date(savedState.lastSaved) : null
      };
      this.notify('loaded', this.state);
      return true;
    }
    return false;
  }

  /**
   * Suscribirse a cambios de estado
   * @param {string} event - Evento a escuchar ('cargos', 'empresa', 'cargo-{index}', etc.)
   * @param {Function} callback - Función a ejecutar cuando cambia el estado
   * @returns {number} ID del listener para poder desuscribirse después
   */
  subscribe(event, callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }

    const listenerId = this.listenerIdCounter++;

    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Map());
    }

    this.listeners.get(event).set(listenerId, callback);

    // Retornar función para desuscribirse
    return () => this.unsubscribe(event, listenerId);
  }

  /**
   * Desuscribirse de un evento
   */
  unsubscribe(event, listenerId) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listenerId);
    }
  }

  /**
   * Notificar a todos los listeners de un evento
   */
  notify(event, data) {
    // Notificar listeners específicos del evento
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for event "${event}":`, error);
        }
      });
    }

    // Notificar listeners globales (evento '*')
    const globalListeners = this.listeners.get('*');
    if (globalListeners) {
      globalListeners.forEach(callback => {
        try {
          callback({ event, data });
        } catch (error) {
          console.error(`Error in global listener:`, error);
        }
      });
    }
  }

  /**
   * Obtener estadísticas del diagnóstico
   */
  getStats() {
    const totalCargos = this.state.cargos.length;
    const totalTrabajadores = this.state.cargos.reduce(
      (sum, cargo) => sum + (parseInt(cargo.numTrabajadores) || 0),
      0
    );
    const totalRiesgos = this.state.cargos.reduce(
      (sum, cargo) => sum + cargo.gesSeleccionados.length,
      0
    );

    return {
      totalCargos,
      totalTrabajadores,
      totalRiesgos,
      hasEmpresa: Boolean(this.state.empresa.nombre && this.state.empresa.nit),
      isComplete: totalCargos > 0 && this.state.empresa.nombre && this.state.empresa.nit
    };
  }

  /**
   * Validar estado antes de enviar
   */
  validate() {
    const errors = [];

    // Validar empresa
    if (!this.state.empresa.nombre) {
      errors.push({ field: 'empresa.nombre', message: 'El nombre de la empresa es requerido' });
    }
    if (!this.state.empresa.nit) {
      errors.push({ field: 'empresa.nit', message: 'El NIT es requerido' });
    }

    // Validar que haya al menos un cargo
    if (this.state.cargos.length === 0) {
      errors.push({ field: 'cargos', message: 'Debe agregar al menos un cargo' });
    }

    // Validar cada cargo
    this.state.cargos.forEach((cargo, index) => {
      if (!cargo.cargoName) {
        errors.push({ field: `cargos.${index}.cargoName`, message: `Cargo ${index + 1}: El nombre del cargo es requerido` });
      }
      if (!cargo.area) {
        errors.push({ field: `cargos.${index}.area`, message: `Cargo ${index + 1}: El área es requerida` });
      }
      if (cargo.gesSeleccionados.length === 0) {
        errors.push({ field: `cargos.${index}.gesSeleccionados`, message: `Cargo ${index + 1}: Debe seleccionar al menos un riesgo` });
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Instancia global singleton
export const cargoState = new CargoState();
