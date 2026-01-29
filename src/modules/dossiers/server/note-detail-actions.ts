"use server";
// ============================================================================
// MODULE NOTE-DETAIL-ACTIONS.TS - GESTION NOTES DE DÉTAIL DOUANIÈRES
// ============================================================================
// Rôle global : Ce fichier contient les actions serveur pour la gestion des notes
// de détail douanières. Il gère la génération via procédures stockées, la suppression,
// la vérification des conversions et la création des taux de change manquants.
//
// Architecture :
// - Utilise des procédures stockées SQL Server pour la génération des notes
// - Vérifie les prérequis (statut dossier, colisages, HS codes, régimes)
// - Gère les conversions de devises et les taux de change
// - Inclut l'authentification utilisateur pour sécuriser les actions
// - Invalide le cache Next.js après modifications
// ============================================================================

// Import des bibliothèques nécessaires
import { revalidatePath } from "next/cache";  // Fonction Next.js pour invalider le cache
import prisma from "@/lib/prisma";           // Client Prisma pour les interactions avec la base de données
import { getSession } from "@/modules/auth/server/actions";  // Système d'authentification

/**
 * ============================================================================
 * FONCTION : checkConversionExists
 * ============================================================================
 * Rôle global : Vérifie si une conversion de devise existe pour une date donnée
 * et une entité spécifique. Compare uniquement la partie date (sans l'heure)
 * pour trouver les conversions du même jour.
 * 
 * Paramètres :
 * @param dateDeclaration - Date de déclaration pour laquelle chercher la conversion
 * @param entiteId - ID de l'entité pour laquelle chercher la conversion
 * 
 * Retour : Objet { success: boolean, exists: boolean, conversion?: object, error?: string }
 * ============================================================================
 */
export async function checkConversionExists(dateDeclaration: Date, entiteId: number) {
    try {
        // --------------------------------------------------------------------
        // 1️⃣ FORMATTAGE DE LA DATE POUR COMPARATION
        // --------------------------------------------------------------------
        // Formate la date en format YYYY-MM-DD pour comparer uniquement la partie date
        const dateStr = dateDeclaration.toISOString().split('T')[0];
        
        // --------------------------------------------------------------------
        // 2️⃣ RECHERCHE DE LA CONVERSION
        // --------------------------------------------------------------------
        // Cherche une conversion pour cette date en comparant uniquement la partie date
        // Utilise une requête SQL brute pour gérer les comparaisons de dates précises
        const conversions = await prisma.$queryRaw<any[]>`
            SELECT [ID Convertion], [Date Convertion], [Entite]
            FROM TConvertions
            WHERE CAST([Date Convertion] AS DATE) = CAST(${dateStr} AS DATE)
                AND [Entite] = ${entiteId}
        `;

        // Extrait la première conversion trouvée ou null
        const conversion = conversions.length > 0 ? conversions[0] : null;

        // --------------------------------------------------------------------
        // 3️⃣ RETOUR DU RÉSULTAT
        // --------------------------------------------------------------------
        return {
            success: true,
            exists: !!conversion,  // true si une conversion existe
            conversion: conversion ? {
                id: conversion['ID Convertion'],        // ID de la conversion
                dateConvertion: conversion['Date Convertion'], // Date complète avec heure
            } : undefined,
        };
    } catch (error) {
        console.error("checkConversionExists error:", error);
        return {
            success: false,
            exists: false,
            error: error instanceof Error ? error.message : "Erreur lors de la vérification",
        };
    }
}

/**
 * ============================================================================
 * FONCTION : genererNotesDetail
 * ============================================================================
 * Rôle global : Génère les notes de détail pour un dossier en appelant la procédure
 * stockée SQL Server pSP_CreerNoteDetail. Vérifie les prérequis avant la génération.
 * 
 * Paramètres :
 * @param dossierId - ID du dossier pour lequel générer les notes
 * @param dateDeclaration - Date de déclaration pour laquelle générer les notes
 * 
 * Retour : Objet { success: boolean, error?: string }
 * ============================================================================
 */
/**
 * ============================================================================
 * FONCTION : genererNotesDetail (VERSION PRO / SQL SAFE)
 * ============================================================================
 * - Vérifie les prérequis métier
 * - Récupère la date exacte de conversion depuis la BD
 * - Vérifie l'existence des taux de change
 * - Appelle la procédure stockée SQL Server de manière SAFE
 * ============================================================================
 */
export async function genererNotesDetail(dossierId: number, dateDeclaration: Date) {
    
    try {
        /* --------------------------------------------------------------------
         * 1️⃣ SÉCURITÉ : SESSION
         * ------------------------------------------------------------------ */
        const session = await getSession();
        if (!session.user) {
            return { success: false, error: "Non authentifié" };
        }

        /* --------------------------------------------------------------------
         * 2️⃣ RÉCUPÉRATION DU DOSSIER
         * ------------------------------------------------------------------ */
        const dossier = await prisma.tDossiers.findUnique({
            where: { ID_Dossier: dossierId },
            select: {
                Statut_Dossier: true,
                Branche: true,
            },
        });

        if (!dossier) {
            return { success: false, error: "Dossier non trouvé" };
        }

        if (dossier.Statut_Dossier !== 0) {
            return {
                success: false,
                error: "Le dossier doit être en cours (statut = 0) pour générer les notes de détail",
            };
        }

         /* --------------------------------------------------------------------
         * 3️⃣ VÉRIFICATION DES COLISAGES
         * ------------------------------------------------------------------ */
        const colisagesCount = await prisma.tColisageDossiers.count({
            where: { Dossier: dossierId },
        });

        if (colisagesCount === 0) {
            return { 
                success: false, 
                error: "Aucun colisage trouvé pour ce dossier" 
            };
        }

        /* --------------------------------------------------------------------
         * 4️⃣ VÉRIFICATION HS CODE + RÉGIME
         * ------------------------------------------------------------------ */
        const colisagesSansRegime = await prisma.tColisageDossiers.count({
            where: {
                Dossier: dossierId,
                OR: [{ HS_Code: null }, { Regime_Declaration: null }],
            },
        });

        if (colisagesSansRegime > 0) {
            return {
                success: false,
                error: `${colisagesSansRegime} colisage(s) n'ont pas de HS Code ou de régime de déclaration`,
            };
        }
        
        /* --------------------------------------------------------------------
         * 5️⃣ RÉCUPÉRATION DE L’ENTITÉ VIA LA BRANCHE
         * ------------------------------------------------------------------ */
        const branche = await prisma.tBranches.findUnique({
            where: { ID_Branche: dossier.Branche },
            select: { Entite: true },
        });

        if (!branche) {
            return { success: false, error: "Branche non trouvée" };
        }
        
        /* --------------------------------------------------------------------
         * 6️⃣ RÉCUPÉRATION DE LA CONVERSION (DATE EXACTE BD)
        * ------------------------------------------------------------------ */
        const dateStr = dateDeclaration.toISOString().split('T')[0];
        
        const conversions = await prisma.$queryRaw<
                { ID_Convertion: number; Date_Convertion: Date }[]
            >`
                SELECT [ID Convertion] AS ID_Convertion,
                    [Date Convertion] AS Date_Convertion
                FROM TConvertions
                WHERE CAST([Date Convertion] AS DATE) = CAST(${dateStr} AS DATE)
                AND [Entite] = ${branche.Entite}
            `;

        if (conversions.length === 0) {
            return {
                success: false,
                error: "Aucune conversion trouvée pour cette date et cette entité",
            };
        }

        const conversionId = conversions[0].ID_Convertion;
        const dateConversionExacte = conversions[0].Date_Convertion;

         /* --------------------------------------------------------------------
         * 7️⃣ VÉRIFICATION DES TAUX DE CHANGE
         * ------------------------------------------------------------------ */
        const devisesUtilisees = await prisma.$queryRaw<
            { ID_Devise: number; Code_Devise: string; Libelle_Devise: string }[]
        >`
            SELECT DISTINCT
                cd.[Devise]       AS ID_Devise,
                d.[Code Devise]   AS Code_Devise,
                d.[Libelle Devise] AS Libelle_Devise
            FROM TColisageDossiers cd
            INNER JOIN TDevises d ON cd.[Devise] = d.[ID Devise]
            WHERE cd.[Dossier] = ${dossierId}
        `;
        // Vérifier les taux de change pour chaque devise
        const tauxManquants: any[] = [];
        for (const devise of devisesUtilisees) {
            const taux = await prisma.$queryRaw<any[]>`
                SELECT [ID Taux Change], [Taux Change]
                FROM TTauxChange
                WHERE [Convertion] = ${conversionId}
                    AND [Devise] = ${devise.ID_Devise}
            `;
            
            if (taux.length === 0) {  
                tauxManquants.push({
                    deviseId: devise.ID_Devise,
                    Code_Devise: devise.Code_Devise,
                    Libelle_Devise: devise.Libelle_Devise,
                });
            }
        }

        if (tauxManquants.length > 0) {
            return {
                success: false,
                error: "MISSING_EXCHANGE_RATES",
                missingRates: tauxManquants,
                conversionId,
                dateConvertion: dateConversionExacte,
            };
        }

         /* --------------------------------------------------------------------
         * 8️⃣ APPEL PROCÉDURE STOCKÉE (PRISMA-SAFE)
         * ------------------------------------------------------------------ */
        await prisma.$executeRaw`
            EXEC dbo.pSP_CreerNoteDetail
                @Id_Dossier      = ${dossierId},
                @DateDeclaration = ${dateConversionExacte}
        `;
        
        /* --------------------------------------------------------------------
         * 9️⃣ INVALIDATION DU CACHE
         * ------------------------------------------------------------------ */
        revalidatePath(`/dossiers/${dossierId}`);
        return { success: true };
    } catch (error: any) {
        console.error("genererNotesDetail error:", error);

        // Extraire le message d'erreur de SQL Server
        let errorMessage = "Erreur lors de la génération des notes de détail";
        if (error.message) {
            // Les erreurs SQL Server contiennent souvent le message après "Message:"
            if (error.message.includes("FILE IS NOT IN PROGRESS")) {
                errorMessage = "Le dossier doit être en cours pour générer les notes";
            } else if (error.message.includes("MISSING OR WRONG EXCHANGE RATE")) {
                errorMessage = "Taux de change manquant ou incorrect pour certaines devises";
            } else if (error.message.includes("MISSING PACKING LIST")) {
                errorMessage = "Aucun colisage trouvé pour ce dossier";
            } else if (error.message.includes("MISSING HS CODE OR REGIME")) {
                errorMessage = "Certains colisages n'ont pas de HS Code ou de régime";
            } else {
                errorMessage = error.message;
            }
        }

        return {
            success: false,
            error: errorMessage,
        };
    }
}

/**
 * ============================================================================
 * FONCTION : supprimerNotesDetail
 * ============================================================================
 * Rôle global : Supprime toutes les notes de détail d'un dossier en appelant
 * la procédure stockée SQL Server pSP_SupprimerNoteDetail.
 * 
 * Paramètres :
 * @param dossierId - ID du dossier pour lequel supprimer les notes
 * 
 * Retour : Objet { success: boolean, error?: string }
 * ============================================================================
 */
export async function supprimerNotesDetail(dossierId: number) {
    try {
        // --------------------------------------------------------------------
        // 1️⃣ VÉRIFICATION DE L'AUTHENTIFICATION
        // --------------------------------------------------------------------
        const session = await getSession();
        if (!session.user) {
            return { success: false, error: "Non authentifié" };
        }

        // --------------------------------------------------------------------
        // 2️⃣ APPEL DE LA PROCÉDURE STOCKÉE DE SUPPRESSION
        // --------------------------------------------------------------------
        // Exécute la procédure stockée pour supprimer toutes les notes du dossier
        await prisma.$executeRaw`
            EXEC [dbo].[pSP_SupprimerNoteDetail] 
                @Id_Dossier = ${dossierId}
        `;

        // --------------------------------------------------------------------
        // 3️⃣ INVALIDATION DU CACHE
        // --------------------------------------------------------------------
        // Invalide le cache de la page du dossier pour rafraîchir l'affichage
        revalidatePath(`/dossiers/${dossierId}`);
        return { success: true };
    } catch (error: any) {
        console.error("supprimerNotesDetail error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur lors de la suppression",
        };
    }
}

/**
 * ============================================================================
 * FONCTION : createMissingExchangeRates
 * ============================================================================
 * Rôle global : Crée les taux de change manquants pour une conversion donnée.
 * Utilisé après la détection de taux manquants lors de la génération des notes.
 * 
 * Paramètres :
 * @param conversionId - ID de la conversion pour laquelle créer les taux
 * @param rates - Tableau des taux à créer { deviseId: number, tauxChange: number }
 * 
 * Retour : Objet { success: boolean, error?: string }
 * ============================================================================
 */
export async function createMissingExchangeRates(
    conversionId: number,
    rates: Array<{ deviseId: number; tauxChange: number }>
) {
    try {
        // --------------------------------------------------------------------
        // 1️⃣ VÉRIFICATION DE L'AUTHENTIFICATION
        // --------------------------------------------------------------------
        const session = await getSession();
        if (!session.user) {
            return { success: false, error: "Non authentifié" };
        }

        const sessionId = session.user.id;

        // --------------------------------------------------------------------
        // 2️⃣ CRÉATION DES TAUX DE CHANGE MANQUANTS
        // --------------------------------------------------------------------
        // Insère chaque taux de change manquant dans la table TTauxChange
        for (const rate of rates) {
            await prisma.tTauxChange.create({
                data: {
                    Convertion: conversionId,           // ID de la conversion
                    Devise: rate.deviseId,              // ID de la devise
                    Taux_Change: rate.tauxChange,       // Taux de change
                    Session: sessionId,                 // ID de la session utilisateur
                    Date_Creation: new Date(),          // Date de création
                },
            });
        }

        return { success: true };
    } catch (error) {
        console.error("createMissingExchangeRates error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur lors de la création",
        };
    }
}

/**
 * ============================================================================
 * FONCTION : getNotesDetail
 * ============================================================================
 * Rôle global : Récupère toutes les notes de détail d'un dossier depuis la vue
 * VNotesDetail. Sérialise les données et mappe les colonnes pour le frontend.
 * 
 * Paramètres :
 * @param dossierId - ID du dossier pour lequel récupérer les notes
 * 
 * Retour : Objet { success: boolean, data: array, error?: string }
 * ============================================================================
 */
export async function getNotesDetail(dossierId: number) {
    try {
        // --------------------------------------------------------------------
        // 1️⃣ RÉCUPÉRATION DES NOTES DEPUIS LA VUE
        // --------------------------------------------------------------------
        // Récupère toutes les notes du dossier depuis la vue VNotesDetail
        // La vue contient déjà toutes les jointures nécessaires
        const notes = await prisma.$queryRaw<any[]>`
            SELECT * FROM VNotesDetail
            WHERE ID_Dossier = ${dossierId}
            ORDER BY ID_Colisage_Dossier, Regime  // Trie par colisage puis par régime
        `;

        // --------------------------------------------------------------------
        // 2️⃣ SÉRIALISATION DES DONNÉES
        // --------------------------------------------------------------------
        // Convertit TOUS les Decimal en nombres via JSON.parse(JSON.stringify())
        // C'est la méthode la plus fiable pour sérialiser les Decimal de Prisma
        const serializedNotes = JSON.parse(JSON.stringify(notes));

        // --------------------------------------------------------------------
        // 3️⃣ MAPPING DES COLONNES POUR LE FRONTEND
        // --------------------------------------------------------------------
        // Mappe les noms de colonnes pour correspondre à ce que le composant attend
        const mappedNotes = serializedNotes.map((n: any) => ({
            ...n,
            Qte_Colis: n.Base_Qte,                               // Quantité de base
            Prix_Unitaire_Colis: n.Base_PU || n.Base_Prix_Unitaire_Colis, // Prix unitaire base
            Poids_Brut: n.Base_Poids_Brut,                        // Poids brut base
            Poids_Net: n.Base_Poids_Net,                          // Poids net base
            Volume: n.Base_Volume,                               // Volume base
        }));

        return { success: true, data: mappedNotes };
    } catch (error) {
        console.error("getNotesDetail error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur lors de la récupération",
        };
    }
}