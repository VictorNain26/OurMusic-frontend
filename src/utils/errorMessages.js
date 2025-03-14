export function parseAuthError(errorText = '') {
  const normalized = errorText.toLowerCase();

  // Erreurs utilisateur connues
  if (normalized.includes('email déjà utilisé')) return "Cet email est déjà utilisé.";
  if (normalized.includes('champs requis')) return "Tous les champs sont obligatoires.";
  if (normalized.includes('identifiants invalides')) return "Email ou mot de passe incorrect.";
  if (normalized.includes('non authentifié')) return "Vous devez être connecté pour effectuer cette action.";
  if (normalized.includes('token invalide')) return "Session expirée. Veuillez vous reconnecter.";

  // Erreurs réseau/API
  if (normalized.includes('failed to fetch') || normalized.includes('fetch')) return "Problème de connexion au serveur.";

  // Erreur serveur générique
  if (normalized.includes('internal server') || normalized.includes('500')) return "Erreur interne du serveur. Veuillez réessayer plus tard.";

  // Erreur par défaut
  return "Une erreur est survenue. Veuillez réessayer.";
}
