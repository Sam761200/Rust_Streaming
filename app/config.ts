// Configuration de l'API
export const API_CONFIG = {
  // URL de base de votre API Rust
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  
  // Clé API pour l'authentification
  // Cette clé doit correspondre à celle définie dans votre backend Rust
  API_KEY: process.env.NEXT_PUBLIC_API_KEY,
  
  // Timeout pour les requêtes (en millisecondes)
  TIMEOUT: 10000,
} as const;

// Types pour une meilleure sécurité de type
export type ApiConfig = typeof API_CONFIG; 