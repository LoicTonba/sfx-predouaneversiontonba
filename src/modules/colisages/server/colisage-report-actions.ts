"use server";

// ============================================================================
// MODULE COLISAGE-REPORT-ACTIONS.TS - RAPPORTS PDF COLISAGES
// ============================================================================
// Rôle global : Ce fichier contient les actions serveur spécifiques à la génération
// de rapports PDF pour les colisages. Il récupère et formate toutes les données
// nécessaires à la création de rapports détaillés incluant les informations du
// dossier et la liste complète des colisages.
//
// Architecture :
// - Utilise VDossiers pour les informations du dossier
// - Utilise VColisageDossiers pour les données des colisages avec jointures
// - Utilise TColisageDossiers pour récupérer les UploadKeys manquants
// - Inclut l'authentification utilisateur pour sécuriser les actions
// - Gère la sérialisation des Decimal Prisma pour le PDF
// ============================================================================

// Import des bibliothèques nécessaires
import  auth  from "@/lib/auth";  // Système d'authentification pour sécuriser les actions
import prisma from "@/lib/prisma";  // Client Prisma pour les interactions avec la base de données
import { headers } from "next/headers";  // Fonction Next.js pour récupérer les en-têtes HTTP (sessions)

/**
 * ============================================================================
 * FONCTION : getColisageReportData
 * ============================================================================
 * Rôle global : Récupère TOUTES les données nécessaires pour générer un rapport
 * PDF complet des colisages d'un dossier. Combine les informations du dossier
 * avec la liste détaillée de tous les colisages, y compris les UploadKeys.
 * 
 * Paramètre :
 * @param dossierId - ID numérique du dossier pour lequel générer le rapport
 * 
 * Retour : Objet { success: boolean, data: { dossierInfo, colisages }, error?: string }
 * ============================================================================
 */
export async function getColisageReportData(dossierId: number) {
    try {
        // --------------------------------------------------------------------
        // 1️⃣ VÉRIFICATION DE L'AUTHENTIFICATION
        // --------------------------------------------------------------------
        // Récupère la session utilisateur depuis les en-têtes HTTP
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        // Si aucune session n'est trouvée, l'utilisateur n'est pas authentifié
        if (!session) {
            throw new Error("Missing User Session");
        }

        // --------------------------------------------------------------------
        // 2️⃣ RÉCUPÉRATION DES INFORMATIONS DU DOSSIER
        // --------------------------------------------------------------------
        // Récupère les informations principales du dossier depuis la vue VDossiers
        // Ces informations serviront d'en-tête au rapport PDF
        const dossier = await prisma.vDossiers.findFirst({
            where: { ID_Dossier: dossierId },  // Filtre : dossier spécifique
            select: {
                ID_Dossier: true,              // ID unique du dossier
                No_Dossier: true,               // Numéro de dossier (référence client)
                No_OT: true,                    // Numéro d'ordre de transit
                Nom_Client: true,               // Nom du client
                Description_Dossier: true,       // Description du contenu du dossier
                Nom_Branche: true,               // Nom de la branche (filiale de la société)
                Nom_Entite: true,                // Nom de l'entité (pays de la société)
            }
        });

        // --------------------------------------------------------------------
        // 3️⃣ VÉRIFICATION DE L'EXISTENCE DU DOSSIER
        // --------------------------------------------------------------------
        // Si aucun dossier trouvé avec cet ID, retourne une erreur explicite
        if (!dossier) {
            return { success: false, error: 'Dossier non trouvé' };
        }

        // --------------------------------------------------------------------
        // 4️⃣ RÉCUPÉRATION DES COLISAGES DU DOSSIER
        // --------------------------------------------------------------------
        // Récupère TOUS les colisages du dossier avec tri multi-niveaux
        // Le tri optimise la présentation dans le rapport PDF
        const colisages = await prisma.vColisageDossiers.findMany({
            where: { ID_Dossier: dossierId },  // Filtre : uniquement les colisages de ce dossier
            orderBy: [
                { Nom_Fournisseur: 'asc' },     // Tri 1 : par nom de fournisseur (A-Z)
                { Regroupement_Client: 'asc' }, // Tri 2 : par regroupement client (A-Z)
                { Date_Creation: 'asc' }        // Tri 3 : par date de création (plus ancien d'abord)
            ]
        });

        // --------------------------------------------------------------------
        // 5️⃣ RÉCUPÉRATION DES UPLOADKEYS MANQUANTS
        // --------------------------------------------------------------------
        // La vue VColisageDossiers ne contient pas l'UploadKey, on va la chercher
        // dans la table TColisageDossiers pour chaque colisage
        const uploadKeys = await prisma.tColisageDossiers.findMany({
            where: { Dossier: dossierId },                    // Même filtre que ci-dessus
            select: { ID_Colisage_Dossier: true, UploadKey: true }  // Sélectionne uniquement l'ID et l'UploadKey
        });
        
        // Crée une Map (dictionnaire) pour un accès O(1) aux UploadKeys par ID
        // Format : Map( ID_Colisage_Dossier => UploadKey )
        const uploadKeyMap = new Map(uploadKeys.map(uk => [uk.ID_Colisage_Dossier, uk.UploadKey]));

        // --------------------------------------------------------------------
        // 6️⃣ MAPPING DES DONNÉES POUR LE RAPPORT PDF
        // --------------------------------------------------------------------
        // Transforme les données de la vue en format optimisé pour le rapport PDF
        // Conserve les noms de colonnes originaux pour la compatibilité avec le template PDF
        const mappedColisages = colisages.map(c => ({
            ID_Colisage_Dossier: c.ID_Colisage_Dossier,     // Identifiant unique du colisage
            HS_Code: c.HS_Code,                            // Code HS (Harmonized System) du produit
            Description_Colis: c.Description_Colis,         // Description détaillée du colisage
            No_Commande: c.No_Commande,                    // Numéro de commande client
            Nom_Fournisseur: c.Nom_Fournisseur,            // Nom du fournisseur
            No_Facture: c.No_Facture,                      // Numéro de facture
            Item_No: c.Item_No,                            // Numéro d'article (SKU)
            Code_Devise: c.Code_Devise,                    // Code de la devise (EUR, USD, etc.)
            Qte_Colis: c.Qte_Colis,                     // Quantité de colis
            Prix_Unitaire_Colis: c.Prix_Unitaire_Colis, // Prix unitaire du colisage
            Poids_Brut: c.Poids_Brut,                      // Poids brut en kg
            Poids_Net: c.Poids_Net,                        // Poids net en kg
            Volume: c.Volume,                             // Volume en m³
            Pays_Origine: c.Pays_Origine,                  // Pays d'origine du produit
            Libelle_Regime_Douanier: c.Libelle_Regime_Douanier, // Libellé lisible du régime douanier
            Regroupement_Client: c.Regroupement_Client,   // Champ de regroupement pour le client
            UploadKey: uploadKeyMap.get(c.ID_Colisage_Dossier) || null, // Clé d'upload (récupérée depuis la Map)
            Date_Creation: c.Date_Creation,               // Date et heure de création
        }));

        // --------------------------------------------------------------------
        // 7️⃣ SÉRIALISATION DES DONNÉES POUR LE PDF
        // --------------------------------------------------------------------
        // Prisma retourne des objets Decimal qui ne peuvent pas être sérialisés en JSON
        // JSON.parse(JSON.stringify()) convertit les Decimal en nombres normaux
        // C'est essentiel pour que le générateur de PDF puisse traiter les données
        const serializedColisages = JSON.parse(JSON.stringify(mappedColisages));

        // --------------------------------------------------------------------
        // 8️⃣ FORMATTAGE DES INFORMATIONS DU DOSSIER POUR LE RAPPORT
        // --------------------------------------------------------------------
        // Crée un objet structuré avec les informations du dossier pour l'en-tête du PDF
        const dossierInfo = {
            id: dossier.ID_Dossier,                    // ID du dossier
            noDossier: dossier.No_Dossier,             // Numéro de référence du dossier
            noOT: dossier.No_OT,                       // Numéro d'ordre de transit
            nomClient: dossier.Nom_Client,              // Nom du client
            descriptionDossier: dossier.Description_Dossier, // Description du contenu
            nomBranche: dossier.Nom_Branche,           // Nom de la branche/filiale
            nomEntite: dossier.Nom_Entite,              // Nom de l'entité/société
        };

        // --------------------------------------------------------------------
        // 9️⃣ RETOUR DES DONNÉES COMPLÈTES POUR LE RAPPORT
        // --------------------------------------------------------------------
        return { 
            success: true, 
            data: {
                dossierInfo: JSON.parse(JSON.stringify(dossierInfo)), // Sérialise aussi les infos dossier
                colisages: serializedColisages                         // Liste complète des colisages
            }
        };
    } catch (error: any) {
        // En cas d'erreur, log l'erreur dans la console et retourne un objet d'erreur
        console.error('Erreur getColisageReportData:', error);
        return { success: false, error: error.message };
    }
}