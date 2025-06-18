/**
 * Development-only logging utility
 * Logs are only shown when VITE_USE_FIREBASE_EMULATOR=true or in development mode
 *
 * Usage Examples:
 *
 * // Basic logging
 * logger.debug('Debug message');
 * logger.info('Info message');
 * logger.success('Operation completed');
 * logger.warning('Warning message');
 * logger.error('Error message'); // Always shown, even in production
 *
 * // Firebase-specific logging
 * logger.firebase.auth('User signed in');
 * logger.firebase.firestore('Document created');
 * logger.firebase.emulator('Connected to emulator');
 * logger.firebase.test('Running test');
 *
 * // Grouped logging for complex operations
 * logger.group.start('User Registration');
 * logger.group.log('Creating auth user...');
 * logger.group.log('Saving to database...');
 * logger.group.end();
 */

const isDevelopment =
  import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true' || import.meta.env.DEV;

export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.debug(`🔧 ${message}`, ...args);
    }
  },

  info: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.info(`ℹ️ ${message}`, ...args);
    }
  },

  success: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`✅ ${message}`, ...args);
    }
  },

  warning: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.warn(`⚠️ ${message}`, ...args);
    }
  },

  error: (message: string, ...args: any[]) => {
    // Always log errors, even in production
    console.error(`❌ ${message}`, ...args);
  },

  // Firebase-specific logging methods
  firebase: {
    auth: (message: string, ...args: any[]) => {
      if (isDevelopment) {
        console.log(`🔑 ${message}`, ...args);
      }
    },

    firestore: (message: string, ...args: any[]) => {
      if (isDevelopment) {
        console.log(`💾 ${message}`, ...args);
      }
    },

    emulator: (message: string, ...args: any[]) => {
      if (isDevelopment) {
        console.log(`🔥 ${message}`, ...args);
      }
    },

    test: (message: string, ...args: any[]) => {
      if (isDevelopment) {
        console.log(`🧪 ${message}`, ...args);
      }
    },
  },

  // Grouped logging for complex operations
  group: {
    start: (title: string) => {
      if (isDevelopment) {
        console.group(`🚀 ${title}`);
      }
    },

    end: () => {
      if (isDevelopment) {
        console.groupEnd();
      }
    },

    log: (message: string, ...args: any[]) => {
      if (isDevelopment) {
        console.log(`  📄 ${message}`, ...args);
      }
    },
  },
};

// Export for backwards compatibility
export default logger;
