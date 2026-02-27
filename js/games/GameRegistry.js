/**
 * Game Registry
 * Manages game registration and initialization for a scalable game system
 */

const GameRegistry = (function() {
  // Registered games (name -> { instance, launcher })
  const games = new Map();

  // Shared managers (set during init)
  let managers = null;

  /**
   * Register a game with the registry
   * @param {string} name - Unique game identifier (e.g., 'phonics', 'vocab')
   * @param {Object} game - The game instance (singleton)
   * @param {Object} options - Optional configuration
   * @param {string} options.launcher - Name of the launcher function for window binding
   */
  function register(name, game, options = {}) {
    if (games.has(name)) {
      console.warn(`GameRegistry: Game '${name}' already registered, overwriting`);
    }
    games.set(name, {
      instance: game,
      launcher: options.launcher || `start${capitalize(name)}Game`,
      initialized: false
    });
  }

  /**
   * Initialize all registered games with shared managers
   * @param {Object} sharedManagers - { audio, ui, storage, gameData }
   */
  function initAll(sharedManagers) {
    managers = sharedManagers;

    games.forEach((gameInfo, name) => {
      try {
        gameInfo.instance.setManagers(managers);
        gameInfo.initialized = true;
      } catch (e) {
        console.error(`GameRegistry: Failed to initialize game '${name}'`, e);
      }
    });
  }

  /**
   * Get a game instance by name
   * @param {string} name - Game identifier
   * @returns {Object|null} Game instance or null if not found
   */
  function get(name) {
    const gameInfo = games.get(name);
    return gameInfo ? gameInfo.instance : null;
  }

  /**
   * Start a game by name
   * @param {string} name - Game identifier
   * @param {Object} options - Options to pass to game.start()
   */
  function start(name, options = {}) {
    const game = get(name);
    if (game) {
      game.start(options);
    } else {
      console.error(`GameRegistry: Game '${name}' not found`);
    }
  }

  /**
   * Get all registered game names
   * @returns {Array<string>}
   */
  function getGameNames() {
    return Array.from(games.keys());
  }

  /**
   * Get all game instances
   * @returns {Array<Object>}
   */
  function getAllGames() {
    return Array.from(games.values()).map(g => g.instance);
  }

  /**
   * Configure a specific game
   * @param {string} name - Game identifier
   * @param {Object} config - Configuration to pass to game.configure()
   */
  function configure(name, config) {
    const game = get(name);
    if (game && typeof game.configure === 'function') {
      game.configure(config);
    }
  }

  /**
   * Create launcher functions and bind to window for HTML onclick compatibility
   * This allows HTML to use onclick="showVocabGame()" etc.
   */
  function bindLaunchers() {
    games.forEach((gameInfo, name) => {
      const launcherName = gameInfo.launcher;
      const showName = `show${capitalize(name)}Game`;

      // Create starter function
      const starter = (options) => start(name, options);

      // Bind both patterns to window for compatibility
      if (typeof window !== 'undefined') {
        window[launcherName] = starter;
        window[showName] = starter;
      }
    });
  }

  /**
   * Helper to capitalize first letter
   */
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Public API
  return {
    register,
    initAll,
    get,
    start,
    getGameNames,
    getAllGames,
    configure,
    bindLaunchers
  };
})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameRegistry;
}
