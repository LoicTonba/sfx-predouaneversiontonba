"use client";

// ============================================================================
// MODULE USE-DOSSIERS-SEARCH.TS - HOOK RECHERCHE DOSSIERS
// ============================================================================
// Rôle global : Ce hook React gère l'état de recherche pour les dossiers
// en utilisant la bibliothèque nuqs pour la synchronisation avec les paramètres d'URL.
// Fournit une solution simple et optimisée pour la recherche textuelle.
//
// Architecture :
// - Hook personnalisé React basé sur nuqs
// - Synchronisation automatique avec les paramètres d'URL
// - Configuration de recherche avec valeur par défaut
// - Navigation non-shallow pour préserver l'état complet
// ============================================================================

// Import de la bibliothèque nuqs pour la gestion des paramètres d'URL
import { useQueryState } from "nuqs";  // Hook pour synchroniser l'état avec les query params

/**
 * ============================================================================
 * HOOK : useDossiersSearch
 * ============================================================================
 * Rôle global : Hook personnalisé pour gérer la recherche textuelle des dossiers.
 * Utilise nuqs pour synchroniser automatiquement la recherche avec les paramètres d'URL.
 * 
 * Retour : { search: string, setSearch: Function }
 * ============================================================================
 */
export const useDossiersSearch = () => {
    // --------------------------------------------------------------------
    // 1️⃣ CONFIGURATION DE L'ÉTAT DE RECHERCHE
    // --------------------------------------------------------------------
    const [search, setSearch] = useQueryState("search", {
        defaultValue: "",  // Valeur par défaut : chaîne vide
        shallow: false,     // Navigation non-shallow : préserve l'état complet de l'URL
    });

    // --------------------------------------------------------------------
    // 2️⃣ RETOUR DU HOOK
    // --------------------------------------------------------------------
    return { 
        search,     // Terme de recherche actuel (synchronisé avec l'URL)
        setSearch   // Fonction pour modifier la recherche (met à jour l'URL automatiquement)
    };
};