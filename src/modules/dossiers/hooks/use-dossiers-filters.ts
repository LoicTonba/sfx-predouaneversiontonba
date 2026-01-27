"use client";

// ============================================================================
// MODULE USE-DOSSIERS-FILTERS.TS - HOOK FILTRES DOSSIERS
// ============================================================================
// Rôle global : Ce hook React gère les filtres de recherche pour les dossiers.
// Il synchronise l'état des filtres avec les paramètres d'URL pour permettre
// le partage de liens et la navigation avec état préservé.
//
// Architecture :
// - Hook personnalisé React avec synchronisation URL
// - Gestion des filtres : recherche textuelle, statut, étape
// - Utilisation des hooks Next.js pour la navigation et les paramètres
// - Mise à jour automatique de l'URL lors des changements de filtres
// ============================================================================

// Import des bibliothèques et hooks Next.js
import { useRouter, useSearchParams } from "next/navigation";  // Hooks de navigation Next.js
import { useCallback } from "react";  // Hook React pour les fonctions mémoisées

/**
 * ============================================================================
 * HOOK : useDossiersFilters
 * ============================================================================
 * Rôle global : Hook personnalisé pour gérer les filtres de recherche des dossiers.
 * Synchronise l'état des filtres avec les paramètres d'URL pour la persistance.
 * 
 * Retour : Objet contenant les filtres actuels et les fonctions pour les modifier
 * ============================================================================
 */
export const useDossiersFilters = () => {
    // --------------------------------------------------------------------
    // 1️⃣ INITIALISATION DES HOOKS
    // --------------------------------------------------------------------
    const router = useRouter();  // Hook Next.js pour la navigation
    const searchParams = useSearchParams();  // Hook Next.js pour lire les paramètres d'URL

    // --------------------------------------------------------------------
    // 2️⃣ EXTRACTION DES FILTRES DEPUIS L'URL
    // --------------------------------------------------------------------
    // Récupère le terme de recherche depuis l'URL (vide par défaut)
    const search = searchParams.get("search") || "";
    
    // Récupère l'ID du statut depuis l'URL et le convertit en nombre (null par défaut)
    const statutId = searchParams.get("statutId") ? parseInt(searchParams.get("statutId")!) : null;
    
    // Récupère l'ID de l'étape depuis l'URL et le convertit en nombre (null par défaut)
    const etapeId = searchParams.get("etapeId") ? parseInt(searchParams.get("etapeId")!) : null;

    /**
     * ============================================================================
     * FONCTION : updateURL
     * ============================================================================
     * Rôle global : Met à jour les paramètres d'URL avec les nouveaux filtres.
     * Gère l'ajout, la modification et la suppression des paramètres.
     * 
     * Paramètre : @param params - Objet des paramètres à mettre à jour
     * ============================================================================
     */
    const updateURL = useCallback((params: Record<string, string | null>) => {
        // ----------------------------------------------------------------
        // 1️⃣ CRÉATION DES NOUVEAUX PARAMÈTRES
        // ----------------------------------------------------------------
        const newSearchParams = new URLSearchParams(searchParams.toString());  // Clone les paramètres actuels
        
        // ----------------------------------------------------------------
        // 2️⃣ PARCOURS ET MISE À JOUR DES PARAMÈTRES
        // ----------------------------------------------------------------
        Object.entries(params).forEach(([key, value]) => {
            if (value === null || value === "") {
                // Supprime le paramètre si la valeur est null ou vide
                newSearchParams.delete(key);
            } else {
                // Ajoute ou met à jour le paramètre avec la nouvelle valeur
                newSearchParams.set(key, value);
            }
        });

        // ----------------------------------------------------------------
        // 3️⃣ NAVIGATION VERS L'URL MIS À JOUR
        // ----------------------------------------------------------------
        router.push(`/dossiers?${newSearchParams.toString()}`);  // Navigue vers la nouvelle URL
    }, [router, searchParams]);  // Dépendances : recrée la fonction si router ou searchParams changent

    /**
     * ============================================================================
     * FONCTION : setSearch
     * ============================================================================
     * Rôle global : Met à jour le terme de recherche dans l'URL.
     * 
     * Paramètre : @param search - Nouveau terme de recherche
     * ============================================================================
     */
    const setSearch = useCallback((search: string) => {
        updateURL({ search });  // Met à jour l'URL avec le nouveau terme de recherche
    }, [updateURL]);  // Dépendance : recrée si updateURL change

    /**
     * ============================================================================
     * FONCTION : setStatutId
     * ============================================================================
     * Rôle global : Met à jour l'ID du statut dans l'URL.
     * Convertit le nombre en chaîne pour l'URL.
     * 
     * Paramètre : @param statutId - Nouvel ID du statut (null pour supprimer)
     * ============================================================================
     */
    const setStatutId = useCallback((statutId: number | null) => {
        updateURL({ statutId: statutId?.toString() || null });  // Convertit en string ou null
    }, [updateURL]);  // Dépendance : recrée si updateURL change

    /**
     * ============================================================================
     * FONCTION : setEtapeId
     * ============================================================================
     * Rôle global : Met à jour l'ID de l'étape dans l'URL.
     * Convertit le nombre en chaîne pour l'URL.
     * 
     * Paramètre : @param etapeId - Nouvel ID de l'étape (null pour supprimer)
     * ============================================================================
     */
    const setEtapeId = useCallback((etapeId: number | null) => {
        updateURL({ etapeId: etapeId?.toString() || null });  // Convertit en string ou null
    }, [updateURL]);  // Dépendance : recrée si updateURL change

    /**
     * ============================================================================
     * FONCTION : clearFilters
     * ============================================================================
     * Rôle global : Supprime tous les filtres en les mettant à null dans l'URL.
     * Réinitialise l'état des filtres à leur valeur par défaut.
     * ============================================================================
     */
    const clearFilters = useCallback(() => {
        updateURL({ search: null, statutId: null, etapeId: null });  // Supprime tous les filtres
    }, [updateURL]);  // Dépendance : recrée si updateURL change

    // --------------------------------------------------------------------
    // 3️⃣ RETOUR DU HOOK
    // --------------------------------------------------------------------
    return {
        // Valeurs actuelles des filtres
        search,      // Terme de recherche actuel
        statutId,    // ID du statut actuel
        etapeId,     // ID de l'étape actuelle
        
        // Fonctions pour modifier les filtres
        setSearch,    // Fonction pour modifier la recherche
        setStatutId,  // Fonction pour modifier le statut
        setEtapeId,   // Fonction pour modifier l'étape
        clearFilters, // Fonction pour réinitialiser tous les filtres
    };
};