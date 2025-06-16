interface Config {
  apiUrl: string;
}

const config: Config = {
  // Default to localhost for development, can be overridden with VITE_API_URL environment variable
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
};

export default config; 