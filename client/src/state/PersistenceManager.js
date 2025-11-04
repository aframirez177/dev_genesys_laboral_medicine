/**
 * PersistenceManager.js - Sistema unificado de persistencia
 *
 * Maneja el guardado automático en localStorage y sincronización con backend
 */

export class PersistenceManager {
  constructor(state, options = {}) {
    this.state = state;
    this.options = {
      localStorageKey: options.localStorageKey || 'genesys_draft',
      autoSaveInterval: options.autoSaveInterval || 5000, // 5 segundos
      expirationTime: options.expirationTime || 72 * 60 * 60 * 1000, // 72 horas
      enableBackendSync: options.enableBackendSync || false,
      backendSyncInterval: options.backendSyncInterval || 30000, // 30 segundos
      ...options
    };

    this.autoSaveTimer = null;
    this.backendSyncTimer = null;
    this.isInitialized = false;
  }

  /**
   * Inicializar el persistence manager
   */
  init() {
    if (this.isInitialized) {
      console.warn('PersistenceManager already initialized');
      return;
    }

    // Restaurar estado desde localStorage
    this.restore();

    // Configurar auto-save
    this.startAutoSave();

    // Suscribirse a cambios de estado
    this.state.subscribe('*', () => {
      this.scheduleAutoSave();
    });

    // Sincronización con backend (si está habilitada)
    if (this.options.enableBackendSync) {
      this.startBackendSync();
    }

    // Limpiar datos expirados
    this.cleanExpiredData();

    this.isInitialized = true;

    console.log('✓ PersistenceManager initialized');
  }

  /**
   * Destruir el persistence manager
   */
  destroy() {
    this.stopAutoSave();
    this.stopBackendSync();
    this.isInitialized = false;
  }

  /**
   * Guardar estado en localStorage
   */
  save() {
    try {
      const stateToSave = {
        ...this.state.getState(),
        timestamp: Date.now(),
        version: '2.0' // Para futuras migraciones
      };

      localStorage.setItem(
        this.options.localStorageKey,
        JSON.stringify(stateToSave)
      );

      this.state.markAsSaved();

      console.log('💾 State saved to localStorage');
      return true;
    } catch (error) {
      console.error('Error saving state to localStorage:', error);

      // Si es quota exceeded, limpiar datos antiguos
      if (error.name === 'QuotaExceededError') {
        this.cleanExpiredData();
        // Intentar guardar nuevamente
        try {
          localStorage.setItem(
            this.options.localStorageKey,
            JSON.stringify(stateToSave)
          );
          return true;
        } catch (retryError) {
          console.error('Error saving after cleanup:', retryError);
        }
      }

      return false;
    }
  }

  /**
   * Restaurar estado desde localStorage
   */
  restore() {
    try {
      const savedData = localStorage.getItem(this.options.localStorageKey);

      if (!savedData) {
        console.log('No saved state found');
        return false;
      }

      const parsed = JSON.parse(savedData);

      // Verificar expiración
      if (this.isExpired(parsed.timestamp)) {
        console.log('Saved state expired, clearing...');
        this.clear();
        return false;
      }

      // Cargar estado
      this.state.loadState(parsed);

      console.log('✓ State restored from localStorage');
      return true;
    } catch (error) {
      console.error('Error restoring state from localStorage:', error);
      return false;
    }
  }

  /**
   * Limpiar datos guardados
   */
  clear() {
    try {
      localStorage.removeItem(this.options.localStorageKey);
      console.log('✓ Saved state cleared');
      return true;
    } catch (error) {
      console.error('Error clearing saved state:', error);
      return false;
    }
  }

  /**
   * Verificar si los datos han expirado
   */
  isExpired(timestamp) {
    if (!timestamp) return true;
    return Date.now() - timestamp > this.options.expirationTime;
  }

  /**
   * Iniciar auto-save
   */
  startAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    this.autoSaveTimer = setInterval(() => {
      this.save();
    }, this.options.autoSaveInterval);
  }

  /**
   * Detener auto-save
   */
  stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  /**
   * Programar auto-save (debounced)
   */
  scheduleAutoSave() {
    // El auto-save ya está corriendo en intervalos
    // Esta función podría usarse para forzar un save inmediato si es necesario
  }

  /**
   * Sincronizar con backend
   */
  async syncToBackend() {
    if (!navigator.onLine) {
      console.log('Offline, skipping backend sync');
      return false;
    }

    try {
      const state = this.state.getState();

      // Solo sincronizar si hay datos válidos
      if (state.cargos.length === 0) {
        return false;
      }

      const response = await fetch('/api/diagnostico/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...state,
          timestamp: Date.now()
        })
      });

      if (response.ok) {
        console.log('✓ State synced to backend');
        return true;
      } else {
        console.warn('Backend sync failed:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Error syncing to backend:', error);
      return false;
    }
  }

  /**
   * Iniciar sincronización periódica con backend
   */
  startBackendSync() {
    if (this.backendSyncTimer) {
      clearInterval(this.backendSyncTimer);
    }

    this.backendSyncTimer = setInterval(() => {
      this.syncToBackend();
    }, this.options.backendSyncInterval);
  }

  /**
   * Detener sincronización con backend
   */
  stopBackendSync() {
    if (this.backendSyncTimer) {
      clearInterval(this.backendSyncTimer);
      this.backendSyncTimer = null;
    }
  }

  /**
   * Limpiar datos expirados de localStorage
   */
  cleanExpiredData() {
    try {
      const keysToRemove = [];

      // Revisar todas las claves de localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key && key.startsWith('genesys_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key));

            if (data && data.timestamp && this.isExpired(data.timestamp)) {
              keysToRemove.push(key);
            }
          } catch (e) {
            // Si no se puede parsear, eliminar
            keysToRemove.push(key);
          }
        }
      }

      // Eliminar claves expiradas
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`Removed expired key: ${key}`);
      });

      return keysToRemove.length;
    } catch (error) {
      console.error('Error cleaning expired data:', error);
      return 0;
    }
  }

  /**
   * Obtener información sobre el estado guardado
   */
  getStorageInfo() {
    try {
      const savedData = localStorage.getItem(this.options.localStorageKey);

      if (!savedData) {
        return {
          exists: false,
          size: 0,
          timestamp: null,
          isExpired: false
        };
      }

      const parsed = JSON.parse(savedData);
      const sizeInBytes = new Blob([savedData]).size;

      return {
        exists: true,
        size: sizeInBytes,
        sizeFormatted: this.formatBytes(sizeInBytes),
        timestamp: parsed.timestamp ? new Date(parsed.timestamp) : null,
        isExpired: this.isExpired(parsed.timestamp),
        version: parsed.version || '1.0'
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { exists: false, error: error.message };
    }
  }

  /**
   * Formatear bytes a formato legible
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Exportar estado como JSON (para descargar)
   */
  exportAsJSON() {
    const state = this.state.getState();
    const dataStr = JSON.stringify(state, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    return dataBlob;
  }

  /**
   * Importar estado desde JSON
   */
  importFromJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      this.state.loadState(parsed);
      this.save();
      console.log('✓ State imported from JSON');
      return true;
    } catch (error) {
      console.error('Error importing state from JSON:', error);
      return false;
    }
  }
}
