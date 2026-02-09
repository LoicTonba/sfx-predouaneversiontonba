"use server";

import { Prisma } from "@/generated/prisma/browser";
// ============================================================================
// MODULE COLISAGE-ACTIONS.TS - GESTION DES COLISAGES
// ============================================================================
// Rôle global : Ce fichier contient toutes les actions serveur pour la gestion
// des colisages (packages) dans les dossiers de douane. Il gère les opérations
// CRUD (Créer, Lire, Mettre à jour, Supprimer), l'import Excel et les
// statistiques des colisages.
//
// Architecture :
// - Utilise VColisageDossiers (vue) pour les lectures avec jointures
// - Utilise TColisageDossiers (table) pour les écritures
// - Inclut l'authentification utilisateur pour sécuriser les actions
// - Gère la sérialisation des Decimal Prisma
// - Invalide le cache Next.js après modifications
// ============================================================================

// Import des bibliothèques nécessaires
import auth from "@/lib/auth";  // Système d'authentification pour sécuriser les actions
import prisma from "@/lib/prisma";  // Client Prisma pour les interactions avec la base de données
import { revalidatePath } from "next/cache";  // Fonction Next.js pour invalider le cache
import { headers } from "next/headers";  // Fonction Next.js pour récupérer les en-têtes HTTP (sessions)

/**
 * ============================================================================
 * FONCTION UTILITAIRE : convertDecimalsToNumbers
 * ============================================================================
 * Rôle global : Convertit les objets Decimal Prisma en nombres JavaScript.
 * Essentiel pour la sérialisation JSON et la compatibilité avec le frontend.
 * 
 * Paramètre :
 * @param data - Objet contenant potentiellement des Decimal à convertir
 * 
 * Retour : Objet avec tous les Decimal convertis en nombres
 * ============================================================================
 */
function convertDecimalsToNumbers(data: any): any {
    // Convertit l'objet en JSON string en remplaçant les Decimal par des nombres
    const jsonString = JSON.stringify(data, (_, value) => {
        // Vérifie si la valeur est un objet Decimal Prisma
        if (value && typeof value === 'object' && value.constructor.name === 'Decimal') {
            return parseFloat(value.toString()); // Convertit le Decimal en nombre
        }
        return value; // Garde les autres valeurs inchangées
    });
    // Reparse le JSON pour obtenir l'objet avec des nombres normaux
    return JSON.parse(jsonString);
}

/**
 * Crée un nouveau colisage dans un dossier
 */
export async function createColisage(data: any) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Missing User Session");
    }

    const colisage = await prisma.tColisageDossiers.create({
      data: {
        Dossier: data.dossierId,
        HS_Code: data.hsCodeId ? Number(data.hsCodeId) : 0,
        Description_Colis: data.description,
        No_Commande: data.numeroCommande,
        Nom_Fournisseur: data.nomFournisseur,
        No_Facture: data.numeroFacture,
        Devise: data.deviseId ? Number(data.deviseId) : 0,
        Item_No: data.article?.toString() || "1",
        Qte_Colis: data.quantite || 1,
        Prix_Unitaire_Colis: data.prixUnitaireColis || 0,
        Poids_Brut: data.poidsBrut || 0,
        Poids_Net: data.poidsNet || 0,
        Volume: data.volume || 0,
        Pays_Origine: data.paysOrigineId ? Number(data.paysOrigineId) : 0,
        Regime_Declaration: data.regimeDeclarationId ? Number(data.regimeDeclarationId) : null,
        Regroupement_Client: data.regroupementClient || '-',
        UploadKey: data.uploadKey || `COL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        Session: parseInt(session.user.id),
        Date_Creation: new Date(),
      },
    });

    revalidatePath(`/dossiers/${data.dossierId}`);
    revalidatePath("/colisage");
    return {
      success: true,
      data: convertDecimalsToNumbers(colisage),
    };
  } catch (error) {
    console.error("createColisage error:", error);
    return { success: false, error };
  }
}


/**
 * ============================================================================
 * FONCTION : getColisagesDossier
 * ============================================================================
 * Rôle global : Récupère TOUS les colisages d'un dossier spécifique avec
 * toutes leurs informations (jointures incluses) via la vue VColisageDossiers.
 * 
 * Paramètre :
 * @param dossierId - ID numérique du dossier pour lequel on veut les colisages
 * 
 * Retour : Objet { success: boolean, data: array, error?: string }
 * ============================================================================
 */
export async function getColisagesDossier(dossierId: number) {
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
    // 2️⃣ RÉCUPÉRATION DES COLISAGES PRINCIPAUX
    // --------------------------------------------------------------------
    // Interroge la vue VColisageDossiers qui contient déjà toutes les jointures
    const colisages = await prisma.vColisageDossiers.findMany({
      where: { ID_Dossier: dossierId },    // Filtre : uniquement les colisages du dossier spécifié
      orderBy: { Date_Creation: 'asc' }     // Tri : par date de création croissante (plus ancien d'abord)
    });

    // --------------------------------------------------------------------
    // 3️⃣ RÉCUPÉRATION DES UPLOADKEYS MANQUANTS
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
    // 4️⃣ MAPPING DES DONNÉES POUR LE FRONTEND
    // --------------------------------------------------------------------
    // Transforme les données de la vue en format compatible avec le frontend
    // Conserve les noms de colonnes originaux pour la rétrocompatibilité
    const mappedColisages = colisages.map(c => ({
      ID_Colisage_Dossier: c.ID_Colisage_Dossier,     // Identifiant unique du colisage
      ID_Dossier: c.ID_Dossier,                     // ID du dossier parent
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
      ID_Regime_Declaration: c.ID_Regime_Declaration, // ID du régime douanier de déclaration
      ID_Regime_Douanier: c.ID_Regime_Douanier,       // ID du régime douanier
      Libelle_Regime_Declaration: c.Libelle_Regime_Declaration, // Libellé lisible du régime
      Regroupement_Client: c.Regroupement_Client,   // Champ de regroupement pour le client
      UploadKey: uploadKeyMap.get(c.ID_Colisage_Dossier) || null, // Clé d'upload (récupérée depuis la Map)
      Date_Creation: c.Date_Creation,               // Date et heure de création
      Nom_Creation: c.Nom_Creation,                  // Nom de l'utilisateur qui a créé
    }));

    // --------------------------------------------------------------------
    // 5️⃣ SÉRIALISATION DES DONNÉES
    // --------------------------------------------------------------------
    // Prisma retourne des objets Decimal qui ne peuvent pas être sérialisés en JSON
    // JSON.parse(JSON.stringify()) convertit les Decimal en nombres normaux
    const serializedColisages = JSON.parse(JSON.stringify(mappedColisages));

    // --------------------------------------------------------------------
    // 6️⃣ RETOUR DU RÉSULTAT
    // --------------------------------------------------------------------
    return { success: true, data: serializedColisages };
  } catch (error) {
    // En cas d'erreur, log l'erreur dans la console et retourne un objet d'erreur
    console.error('getColisagesDossier error:', error);
    return { success: false, error: error instanceof Error ? error.message : "Erreur inconnue" };
  }
}

/**
 * ============================================================================
 * FONCTION : getColisageById
 * ============================================================================
 * Rôle global : Récupère UN SEUL colisage spécifique par son ID avec toutes
 * ses informations détaillées. Résout également les IDs manquants en faisant
 * des recherches supplémentaires dans les tables de référence.
 * 
 * Paramètre :
 * @param id - ID numérique du colisage à récupérer
 * 
 * Retour : Objet { success: boolean, data: object, error?: string }
 * ============================================================================
 */
export async function getColisageById(id: number) {
  try {
    // Vérification de l'authentification utilisateur
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    // Si pas de session, lance une erreur
    if (!session) {
      throw new Error("Missing User Session");
    }

    // Recherche du colisage par ID via la vue VColisageDossiers
    const colisage = await prisma.vColisageDossiers.findFirst({
      where: { ID_Colisage_Dossier: id }
    });

    // Si aucun colisage trouvé, retourne une erreur
    if (!colisage) {
      return { success: false, error: 'Colisage non trouvé' };
    }

    // Récupération de l'uploadKey depuis la table TColisageDossiers (non inclus dans la vue)
    const uploadKeyData = await prisma.tColisageDossiers.findUnique({
      where: { ID_Colisage_Dossier: colisage.ID_Colisage_Dossier },
      select: { UploadKey: true }
    });

    // Mapping vers les anciens noms de colonnes pour la compatibilité frontend
    const mappedColisage = {
      ID_Colisage_Dossier: colisage.ID_Colisage_Dossier,     // ID du colisage
      ID_Dossier: colisage.ID_Dossier,                     // ID du dossier parent
      HS_Code: colisage.HS_Code,                            // Code HS du produit
      Description_Colis: colisage.Description_Colis,         // Description du colis
      No_Commande: colisage.No_Commande,                    // Numéro de commande
      Nom_Fournisseur: colisage.Nom_Fournisseur,            // Nom du fournisseur
      No_Facture: colisage.No_Facture,                      // Numéro de facture
      Item_No: colisage.Item_No,                            // Numéro d'article
      Code_Devise: colisage.Code_Devise,                    // Code de la devise
      Qte_Colis: colisage.Qte_Colis,                     // Quantité de colis
      Prix_Unitaire_Colis: colisage.Prix_Unitaire_Colis, // Prix unitaire facturé
      Poids_Brut: colisage.Poids_Brut,                      // Poids brut
      Poids_Net: colisage.Poids_Net,                        // Poids net
      Volume: colisage.Volume,                             // Volume
      Pays_Origine: colisage.Pays_Origine,                  // Pays d'origine
      ID_Regime_Declaration: colisage.ID_Regime_Declaration, // ID du régime de déclaration
      ID_Regime_Douanier: colisage.ID_Regime_Douanier,       // ID du régime douanier
      Libelle_Regime_Declaration: colisage.Libelle_Regime_Declaration, // Libellé du régime
      Regroupement_Client: colisage.Regroupement_Client,   // Regroupement client
      UploadKey: uploadKeyData?.UploadKey || null,       // Clé d'upload
      Date_Creation: colisage.Date_Creation,               // Date de création
      Nom_Creation: colisage.Nom_Creation,                  // Nom du créateur
    };

    // Sérialisation des Decimal pour éviter les erreurs de sérialisation JSON
    const serializedColisage = JSON.parse(JSON.stringify(mappedColisage));

    // Résolution des IDs manquants pour la compatibilité
    // 1. ID_Devise à partir de Code_Devise
    if (serializedColisage.Code_Devise && !serializedColisage.ID_Devise) {
      const devise = await prisma.vDevises.findFirst({
        where: { Code_Devise: serializedColisage.Code_Devise },
        select: { ID_Devise: true }
      });
      if (devise) {
        serializedColisage.ID_Devise = devise.ID_Devise;
      }
    }

    // 2. ID_Pays_Origine à partir de Pays_Origine
    if (serializedColisage.Pays_Origine && !serializedColisage.ID_Pays_Origine) {
      const pays = await prisma.vPays.findFirst({
        where: { Libelle_Pays: serializedColisage.Pays_Origine },
        select: { ID_Pays: true }
      });
      if (pays) {
        serializedColisage.ID_Pays_Origine = pays.ID_Pays;
      }
    }

    // 3. ID_HS_Code à partir de HS_Code (string)
    if (serializedColisage.HS_Code && !serializedColisage.ID_HS_Code) {
      const hsCode = await prisma.vHSCodes.findFirst({
        where: { HS_Code: serializedColisage.HS_Code },
        select: { ID_HS_Code: true }
      });
      if (hsCode) {
        serializedColisage.ID_HS_Code = hsCode.ID_HS_Code;
      }
    }

    return { success: true, data: serializedColisage };
  } catch (error) {
    console.error('getColisageById error:', error);
    return { success: false, error: error instanceof Error ? error.message : "Erreur inconnue" };
  }
}

/**
 * Récupère tous les colisages via VColisageDossiers
 */
export async function getAllColisages(
  page = 1,
  take = 10000,
  search = ""
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Missing User Session");
    }

    let query = `
            SELECT DISTINCT * FROM VColisageDossiers
            WHERE 1=1
        `;

    if (search) {
      query += ` AND (
                Description_Colis LIKE '%${search}%' OR
                No_Commande LIKE '%${search}%' OR
                Nom_Fournisseur LIKE '%${search}%'
            )`;
    }

    query += ` ORDER BY Date_Creation DESC`;

    const colisages = await prisma.$queryRawUnsafe<any[]>(query);

    return {
      success: true,
      data: convertDecimalsToNumbers(colisages),
      total: colisages.length,
    };
  } catch (error) {
    console.error("getAllColisages error:", error);
    return { success: false, error, total: 0 };
  }
}

/**
 * Récupère tous les colisages d'un dossier via VColisageDossiers
 */
export async function getColisagesByDossierId(dossierId: number) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Missing User Session");
    }

    const colisages = await prisma.$queryRaw<any[]>`
            SELECT * FROM VColisageDossiers
            WHERE ID_Dossier = ${dossierId}
            ORDER BY Date_Creation ASC
        `;

    return {
      success: true,
      data: convertDecimalsToNumbers(colisages),
    };
  } catch (error) {
    console.error("getColisagesByDossierId error:", error);
    return { success: false, error };
  }
}

/**
 * Obtenir les statistiques des colisages d'un dossier
 */
export async function getColisagesStats(dossierId: number) {
  try {
    const colisages = await prisma.vColisageDossiers.findMany({
      where: { ID_Dossier: dossierId },
      select: {
        Qte_Colis: true,
        Poids_Brut: true,
        Poids_Net: true,
        Volume: true,
        Prix_Unitaire_Colis: true
      }
    });

    // Sérialiser les Decimal pour les calculs
    const serializedColisages = JSON.parse(JSON.stringify(colisages));

    const stats = {
      total: serializedColisages.length,
      qteTotal: serializedColisages.reduce((sum: number, c: any) => sum + Number(c.Qte_Colis || 0), 0),
      poidsBrutTotal: serializedColisages.reduce((sum: number, c: any) => sum + Number(c.Poids_Brut || 0), 0),
      poidsNetTotal: serializedColisages.reduce((sum: number, c: any) => sum + Number(c.Poids_Net || 0), 0),
      volumeTotal: serializedColisages.reduce((sum: number, c: any) => sum + Number(c.Volume || 0), 0),
      valeurTotal: serializedColisages.reduce(
        (sum: number, c: any) => sum + Number(c.Qte_Colis || 0) * Number(c.Prix_Unitaire_Colis || 0),
        0
      ),
    };

    return { success: true, data: stats };
  } catch (error: any) {
    console.error('Erreur getColisagesStats:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Interface TypeScript pour la création d'un colisage
 * Définit la structure des données attendues pour la création
 */
export interface CreateColisageInput {
  dossier: number;              // ID du dossier parent (obligatoire)
  hsCode?: number;              // ID du HS Code (optionnel)
  descriptionColis: string;     // Description du colis (obligatoire)
  noCommande?: string;          // Numéro de commande (optionnel)
  nomFournisseur?: string;      // Nom du fournisseur (optionnel)
  noFacture?: string;           // Numéro de facture (optionnel)
  itemNo?: string;              // Numéro d'article (optionnel)
  devise: number;               // ID de la devise (obligatoire)
  qteColisage?: number;         // Quantité (défaut: 1)
  prixUnitaireColis?: number; // Prix unitaire colis (défaut: 0)
  poidsBrut?: number;           // Poids brut (défaut: 0)
  poidsNet?: number;            // Poids net (défaut: 0)
  volume?: number;              // Volume (défaut: 0)
  ajustementValeur?: number;    // Ajustement de la valeur (optionnel)
  paysOrigine: number;           // ID du pays d'origine (obligatoire)
  regimeDeclaration?: number;   // ID du régime de déclaration (optionnel)
  regroupementClient?: string;  // Regroupement client (défaut: '-')
  uploadKey?: string;           // Clé d'upload pour l'import Excel (optionnel)
  sessionId: number;            // ID de la session utilisateur (obligatoire)
}

/**
 * Interface TypeScript pour la mise à jour d'un colisage
 * Définit la structure des données attendues pour la mise à jour
 */
export interface UpdateColisageInput {
  id: number;                   // ID du colisage à mettre à jour (obligatoire)
  hsCode?: number;              // ID du HS Code (optionnel)
  descriptionColis?: string;     // Description du colis (optionnel)
  noCommande?: string;          // Numéro de commande (optionnel)
  nomFournisseur?: string;      // Nom du fournisseur (optionnel)
  noFacture?: string;           // Numéro de facture (optionnel)
  itemNo?: string;              // Numéro d'article (optionnel)
  devise?: number;               // ID de la devise (optionnel)
  qteColisage?: number;         // Quantité (optionnel)
  prixUnitaireColis?: number; // Prix unitaire (optionnel)
  poidsBrut?: number;           // Poids brut (optionnel)
  poidsNet?: number;            // Poids net (optionnel)
  volume?: number;              // Volume (optionnel)
  ajustementValeur?: number;    // Ajustement de la valeur (optionnel)
  paysOrigine?: number;         // ID du pays d'origine (optionnel)
  regimeDeclaration?: number;   // ID du régime de déclaration (optionnel)
  regroupementClient?: string;  // Regroupement client (optionnel)
}


/**
 * ============================================================================
 * FONCTION : updateColisage (VERSION FUSIONNÉE PRO)
 * ============================================================================
 * - Typée (UpdateColisageInput)
 * - Sécurisée (auth obligatoire)
 * - Tolérante au frontend (plusieurs variantes de champs)
 * - Prisma-safe
 * - Maintenable long terme
 * ============================================================================
 */
/**
 * Met à jour un colisage existant dans la base de données
 * Utilise la table TColisageDossiers pour la mise à jour
 * @param input - Données du colisage à mettre à jour
 * @returns Objet de succès avec le colisage mis à jour
 */
export async function updateColisage(input: UpdateColisageInput) {
  try {

    // --------------------------------------------------------------------
    // 1️⃣ SÉCURITÉ : AUTHENTIFICATION
    // --------------------------------------------------------------------
    // Vérification de l'authentification utilisateur
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    // Si pas de session, lance une erreur
    if (!session) {
      throw new Error("Missing User Session");
    }

    // --------------------------------------------------------------------
    // 2️⃣ VALIDATION DE L’ID
    // --------------------------------------------------------------------
    const { id, ...payload } = input;

    if (!Number.isInteger(id)) {
      throw new Error("ID colisage invalide");
    }

    // --------------------------------------------------------------------
    // 3️⃣ CONSTRUCTION DES DONNÉES À METTRE À JOUR
    // (STRICTEMENT SELON LA BD)
    // --------------------------------------------------------------------
    const data: Prisma.TColisageDossiersUpdateInput = {};

    if (payload.hsCode !== undefined) {
      data.THSCodes = {
        connect: { ID_HS_Code: payload.hsCode },
      };
    }

    if (payload.descriptionColis !== undefined)
      data.Description_Colis = payload.descriptionColis;

    if (payload.noCommande !== undefined)
      data.No_Commande = payload.noCommande;

    if (payload.nomFournisseur !== undefined)
      data.Nom_Fournisseur = payload.nomFournisseur;

    if (payload.noFacture !== undefined)
      data.No_Facture = payload.noFacture;

    if (payload.itemNo !== undefined)
      data.Item_No = payload.itemNo;

    if (payload.devise !== undefined) {
      data.TDevises = {
        connect: { ID_Devise: payload.devise },
      };
    }

    if (payload.qteColisage !== undefined)
      data.Qte_Colis = payload.qteColisage;

    if (payload.prixUnitaireColis !== undefined)
      data.Prix_Unitaire_Colis = payload.prixUnitaireColis;

    if (payload.poidsBrut !== undefined)
      data.Poids_Brut = payload.poidsBrut;

    if (payload.poidsNet !== undefined)
      data.Poids_Net = payload.poidsNet;

    if (payload.volume !== undefined)
      data.Volume = payload.volume;

    if (payload.ajustementValeur !== undefined)
      data.Ajustement_Valeur = payload.ajustementValeur;

    if (payload.paysOrigine !== undefined) {
      data.TPays = {
        connect: { ID_Pays: payload.paysOrigine },
      };
    }

    if (payload.regimeDeclaration !== undefined) {
      data.TRegimesDeclarations = payload.regimeDeclaration
        ? { connect: { ID_Regime_Declaration: payload.regimeDeclaration } }
        : { disconnect: true };
    } // nullable OK

    if (payload.regroupementClient !== undefined)
      data.Regroupement_Client = payload.regroupementClient;

    // --------------------------------------------------------------------
    // 4️⃣ MISE À JOUR
    // --------------------------------------------------------------------
    // Met à jour le colisage dans la table TColisageDossiers avec Prisma
    const colisage = await prisma.tColisageDossiers.update({
      where: { ID_Colisage_Dossier: id },                    // Filtre par ID du colisage
      data,                             // Applique les modifications
    });

    // --------------------------------------------------------------------
    // 5️⃣ INVALIDATION DU CACHE
    // --------------------------------------------------------------------
    revalidatePath(`/dossiers/${colisage.Dossier}`);
    revalidatePath(`/dossiers/${colisage.Dossier}/colisages`);
    revalidatePath(`/dossiers/${colisage.Dossier}/colisages/${id}`);

    // --------------------------------------------------------------------
    // 6️⃣ RETOUR
    // --------------------------------------------------------------------
    return {
      success: true,
      data: JSON.parse(JSON.stringify(colisage)), // Decimal-safe
    };
  } catch (error) {
    console.error('updateColisage error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

/**
 * Supprime un colisage de la base de données
 * Utilise la table TColisageDossiers pour la suppression
 * @param id - ID du colisage à supprimer (string ou number)
 * @returns Objet de succès
 */
export async function deleteColisage(id: string | number) {
  try {
    // --------------------------------------------------------------------
    // 1️⃣ AUTHENTIFICATION
    // --------------------------------------------------------------------
    // Vérification de l'authentification utilisateur
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    // Si pas de session, lance une erreur
    if (!session) {
      throw new Error("Missing User Session");
    }

    // --------------------------------------------------------------------
    // 2️⃣ CONVERSION ET VALIDATION ID
    // --------------------------------------------------------------------
    // Convertit d'abord l'ID en nombre si c'est une chaîne
    const colisageId = typeof id === 'string' ? parseInt(id) : id;
    
    // Ensuite valide que c'est un entier valide
    if (!Number.isInteger(colisageId) || colisageId <= 0) {
      throw new Error("ID colisage invalide");
    }

    // Récupère l'ID du dossier avant suppression pour invalider le cache
    const colisage = await prisma.tColisageDossiers.findUnique({
      where: { ID_Colisage_Dossier: colisageId },
      select: { Dossier: true },       // Sélectionne uniquement l'ID du dossier
    });

    // Supprime le colisage de la table TColisageDossiers
    await prisma.tColisageDossiers.delete({
      where: { ID_Colisage_Dossier: colisageId },
    });

    // Invalide le cache de la page des colisages du dossier si trouvé
    if (colisage) {
      revalidatePath(`/dossiers/${colisage.Dossier}/colisages`);
    }

    // Retourne le succès
    return { success: true };
  } catch (error) {
    console.error('deleteColisage error:', error);
    return { success: false, error: error instanceof Error ? error.message : "Erreur inconnue" };
  }
}

/**
 * Supprime tous les colisages d'un dossier
 */
export async function deleteAllColisagesByDossierId(dossierId: number) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
 
    if (!session) {
      throw new Error("Missing User Session");
    }
 
    const result = await prisma.tColisageDossiers.deleteMany({
      where: {
        Dossier: dossierId,
      },
    });
 
    revalidatePath(`/dossiers/${dossierId}`);
    revalidatePath("/colisage");
 
    return {
      success: true,
      data: { deleted: result.count }
    };
  } catch (error) {
    console.error('deleteAllColisagesByDossierId error:', error);
    return { success: false, error: error instanceof Error ? error.message : "Erreur inconnue" };
  }
}

/**
 * Interface pour les lignes de colisage importées
 */
export interface ImportColisageRowNormalized {
  UploadKey: string;                 // clé unique ligne Excel
  HS_Code: number;                   // ID HS (0 = inconnu accepté)
  Devise: string;                    // ex: EUR
  Pays_Origine: string;              // ex: FR
  Regime_Declaration: string;        // texte ou code
  Regime_Code?: string;
  Description_Colis: string;         // peut être vide
  No_Commande?: string;
  Nom_Fournisseur?: string;
  No_Facture?: string;
  No_Article?: string;
  Regroupement_Client?: string;
  Regime_Ratio?: string | number;
  Qte_Colis: number;
  Prix_Unitaire_Colis: number;
  Poids_Brut: number;
  Poids_Net: number;
  Volume: number;
  // Propriétés ajoutées lors de la prévisualisation
  status?: 'new' | 'existing';       // Statut du colisage
  existingId?: number;               // ID si colisage existant
  existingData?: {                   // Données existantes pour comparaison
    HS_Code: number | null;
    Description_Colis: string | null;
    Qte_Colis: number;
  } | null;
}

/**
 * ============================================================================
 * FONCTION : parseColisageExcelFile
 * ============================================================================
 * Rôle global : Parse un fichier Excel de colisages avec validation et détection
 * des valeurs manquantes. Extrait les données et vérifie leur validité.
 * 
 * Paramètres :
 * @param formData - FormData contenant le fichier Excel
 * @param dossierId - ID optionnel du dossier pour récupérer le client associé
 * 
 * Retour : Objet { success: boolean, data: { rows, total, missingValues, clientId }, error?: string }
 * ============================================================================
 */
export async function parseColisageExcelFile(formData: FormData, dossierId?: number) {
    try {
        // --------------------------------------------------------------------
        // 1️⃣ VÉRIFICATION DE L'AUTHENTIFICATION
        // --------------------------------------------------------------------
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            throw new Error("Missing User Session");
        }

        // --------------------------------------------------------------------
        // 2️⃣ RÉCUPÉRATION ET VALIDATION DU FICHIER
        // --------------------------------------------------------------------
        const file = formData.get("file") as File;  // Récupère le fichier depuis FormData
        if (!file) {
            return { success: false, error: "Aucun fichier fourni" };
        }

        // --------------------------------------------------------------------
        // 3️⃣ RÉCUPÉRATION DU CLIENT ASSOCIÉ
        // --------------------------------------------------------------------
        // Récupérer le client du dossier si dossierId est fourni, sinon utilise l'utilisateur
        let clientId = parseInt(session.user.id);
        if (dossierId) {
            const dossier = await prisma.tDossiers.findUnique({
                where: { ID_Dossier: dossierId },
                select: { Client: true }  // Sélectionne uniquement l'ID du client
            });
            if (dossier) {
                clientId = dossier.Client;  // Utilise le client du dossier
            }
        }

        // --------------------------------------------------------------------
        // 4️⃣ PARSING DU FICHIER EXCEL
        // --------------------------------------------------------------------
        const buffer = await file.arrayBuffer();  // Convertit le fichier en buffer binaire
        const XLSX = await import("xlsx");       // Import dynamique de la librairie XLSX
        const workbook = XLSX.read(buffer, { type: "array" }); // Lit le fichier Excel
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]; // Prend la première feuille

        if (!worksheet) {
            return { success: false, error: "Aucune feuille trouvée dans le fichier" };
        }

        const rows = XLSX.utils.sheet_to_json(worksheet) as any[]; // Convertit la feuille en objets JSON

        if (rows.length === 0) {
            return { success: false, error: "Le fichier est vide" };
        }

        // --------------------------------------------------------------------
        // 5️⃣ MAPPING ET NORMALISATION DES DONNÉES
        // --------------------------------------------------------------------
        // Transforme chaque ligne Excel en format standardisé pour l'application
        const parsedRows = rows.map((row, index) => ({
            _rowIndex: index + 2,  // Index de ligne (commence à 2 pour correspondre à Excel)
            rowKey: row["Upload_Key"] || row["Upload Key"] || row["UploadKey"] || "", // Clé unique de la ligne
            hscode: row["HS_Code"] || row["HS Code"] || row["Code HS"] || null, // Code HS (optionnel)
            description: String(row["Descr"] || row["Description"] || row["Description Colis"] || ""), // Description
            numeroCommande: String(row["Command_No"] || row["No Commande"] || row["Numéro Commande"] || ""), // N° commande
            nomFournisseur: String(row["Supplier_Name"] || row["Nom Fournisseur"] || row["Fournisseur"] || ""), // Fournisseur
            numeroFacture: String(row["Invoice_No"] || row["No Facture"] || row["Numéro Facture"] || ""), // N° facture
            itemNo: String(row["Item_No"] || row["Item No"] || row["Numéro Ligne"] || ""), // Numéro d'article
            devise: row["Currency"] || row["Devise"] || row["Code Devise"], // Code devise
            quantite: parseFloat(row["Qty"] || row["Quantité"] || row["Qte Colis"]) || 1, // Quantité
            prixUnitaireColis: parseFloat(row["Unit_Prize_Colis"] || row["Prix Unitaire Colis"] || row["Prix Unitaire Colisage"]) || 0, // Prix unitaire
            poidsBrut: parseFloat(row["Gross_Weight"] || row["Poids Brut"]) || 0, // Poids brut
            poidsNet: parseFloat(row["Net_Weight"] || row["Poids Net"]) || 0, // Poids net
            volume: parseFloat(row["Volume"]) || 0, // Volume
            paysOrigine: row["Country_Origin"] || row["Pays Origine"] || row["Code Pays"], // Pays d'origine
            // Régime code optionnel (peut être vide)
            regimeCode: row["Regime_Code"] || row["Régime Code"] || row["Code Régime"] || null,
            regimeRatio: parseFloat(row["Regime_Ratio"] || row["Régime Ratio"] || row["Ratio Régime"]) || 0, // Ratio en %
            regroupementClient: row["Customer_Grouping"] || row["Regroupement Client"] || "", // Regroupement
        }));

        // --------------------------------------------------------------------
        // 6️⃣ VALIDATION ET DÉTECTION DES VALEURS MANQUANTES
        // --------------------------------------------------------------------
        // Valide toutes les données contre la base de données et détecte ce qui manque
        const missingValues = await validateAndDetectMissing(parsedRows, clientId);

        // --------------------------------------------------------------------
        // 7️⃣ RETOUR DES RÉSULTATS
        // --------------------------------------------------------------------
        return {
            success: true,
            data: {
                rows: parsedRows,                    // Lignes parsées et normalisées
                total: parsedRows.length,            // Nombre total de lignes
                missingValues,                       // Devises, Pays, HS Codes manquants
                clientId,                           // ID du client pour créer les associations
            },
        };
    } catch (error) {
        console.error("parseColisageExcelFile error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Erreur lors du parsing" };
    }
}

/**
 * ============================================================================
 * FONCTION : validateAndDetectMissing
 * ============================================================================
 * Rôle global : Valide les données et détecte les valeurs manquantes dans la base de données.
 * 
 * Paramètres :
 * @param rows - Lignes parsées et normalisées
 * @param clientId - ID du client pour créer les associations
 * 
 * Retour : Objet { devises, pays, hscodes, regimes, unassociatedRegimes }
 * ============================================================================
 */
async function validateAndDetectMissing(rows: any[], clientId: number) {
    const missingDevises: string[] = [];
    const missingPays: string[] = [];
    const missingHscodes: string[] = [];
    const missingRegimes: Array<{ code: string; ratio: number }> = [];
    const unassociatedRegimes: Array<{ code: string; ratio: number; libelle: string }> = [];

    // Extraire les valeurs distinctes
    const distinctDevises = [...new Set(rows.map(r => r.devise).filter(Boolean))];
    const distinctPays = [...new Set(rows.map(r => r.paysOrigine).filter(Boolean))];
    // Convertir les HS codes en strings pour la comparaison, mapper "0" vers "-"
    const distinctHscodes = [...new Set(rows.map(r => r.hscode).filter(h => h !== null && h !== undefined).map(h => {
        const hsCode = String(h);
        return hsCode === '0' ? '-' : hsCode; // Mapper "0" vers "-" qui correspond à l'ID 0
    }))];

    // Vérifier les devises
    if (distinctDevises.length > 0) {
        const foundDevises = await prisma.vDevises.findMany({
            where: { Code_Devise: { in: distinctDevises } },
            select: { Code_Devise: true }
        });
        const foundDevisesCodes = new Set(foundDevises.map(d => d.Code_Devise));
        missingDevises.push(...distinctDevises.filter(d => !foundDevisesCodes.has(d)));
    }

    // Vérifier les pays
    if (distinctPays.length > 0) {
        const foundPays = await prisma.vPays.findMany({
            where: { Code_Pays: { in: distinctPays } },
            select: { Code_Pays: true }
        });
        const foundPaysCodes = new Set(foundPays.map(p => p.Code_Pays));
        const missingPaysFound = distinctPays.filter(p => !foundPaysCodes.has(p));
        missingPays.push(...missingPaysFound);
    }

    // Vérifier les HS Codes
    if (distinctHscodes.length > 0) {
        console.log('🔍 [validateAndDetectMissing] Vérification HS Codes:', distinctHscodes);
        
        const foundHscodes = await prisma.vHSCodes.findMany({
            where: { 
                OR: [
                    { HS_Code: { in: distinctHscodes } },
                    { ID_HS_Code: 0 } // Inclure explicitement l'ID 0
                ]
            },
            select: { HS_Code: true }
        });
        
        console.log('📊 [validateAndDetectMissing] HS Codes trouvés:', foundHscodes);
        
        const foundHscodesCodes = new Set(foundHscodes.map(h => h.HS_Code));
        const missingHscodesFound = distinctHscodes.filter(h => !foundHscodesCodes.has(h));
        
        console.log('✅ [validateAndDetectMissing] HS Codes trouvés:', Array.from(foundHscodesCodes));
        console.log('❌ [validateAndDetectMissing] HS Codes manquants:', missingHscodesFound);
        
        missingHscodes.push(...missingHscodesFound);
    }

    // Vérifier les régimes (seulement si fournis)
    const rowsWithRegime = rows.filter(r => r.regimeRatio !== null && r.regimeRatio !== undefined);
    if (rowsWithRegime.length > 0) {
        const distinctRegimes = [...new Set(rowsWithRegime.map(r => {
            const ratio = typeof r.regimeRatio === 'string' ? parseFloat(r.regimeRatio) : r.regimeRatio;
            return (ratio / 100).toFixed(4); // Utiliser toFixed pour éviter les problèmes de précision
        }))];

        console.log('🔍 [validateAndDetectMissing] Client ID:', clientId);
        console.log('🔍 [validateAndDetectMissing] Régimes distincts à vérifier:', distinctRegimes);

        console.log('🔍 [validateAndDetectMissing] Client ID:', clientId);
        console.log('🔍 [validateAndDetectMissing] Régimes distincts à vérifier:', distinctRegimes);

        // Récupérer les associations client-régime pour ce client
        const clientRegimeAssociations = await prisma.tRegimesClients.findMany({
            where: { Client: clientId },
            include: {
                TRegimesDeclarations: {
                    select: {
                        ID_Regime_Declaration: true,
                        Libelle_Regime_Declaration: true,
                        Taux_DC: true,
                        Regime_Douanier: true
                    }
                }
            }
        });
        
        // Filtrer seulement les régimes douaniers 0
        const filteredAssociations = clientRegimeAssociations.filter(assoc => 
            assoc.TRegimesDeclarations && assoc.TRegimesDeclarations.Regime_Douanier === 0
        );
        
        console.log('🔍 [validateAndDetectMissing] Associations manuelles trouvées:', filteredAssociations);
        
        // Créer un Set des taux DC disponibles pour ce client
        const availableRegimeTaux = new Set(
            filteredAssociations
                .filter(assoc => assoc.TRegimesDeclarations)
                .map(assoc => parseFloat(assoc.TRegimesDeclarations!.Taux_DC.toString()).toFixed(4))
        );
        
        console.log('✅ [validateAndDetectMissing] Régimes trouvés et associés:', Array.from(availableRegimeTaux));
        
        // Pour chaque régime demandé, vérifier s'il existe et s'il est associé
        for (const row of rowsWithRegime) {
            const ratio = typeof row.regimeRatio === 'string' ? parseFloat(row.regimeRatio) : row.regimeRatio;
            const decimal = (ratio / 100).toFixed(4); // Normaliser à 4 décimales
            
            console.log(`🔍 [validateAndDetectMissing] Vérification régime ${ratio}% (${decimal})`);
            
            if (!availableRegimeTaux.has(decimal)) {
                console.log(`❌ [validateAndDetectMissing] Régime ${ratio}% non trouvé dans les associations client`);
                
                // Le régime n'est pas trouvé pour ce client
                // Vérifier s'il existe dans la base mais n'est pas associé
                let libelle: string;
                if (ratio === 0) {
                    libelle = 'EXO';
                } else if (ratio === 100) {
                    libelle = '100% DC';
                } else {
                    const dcPercent = Math.round(ratio * 100) / 100;
                    const trPercent = Math.round((100 - ratio) * 100) / 100;
                    // Générer le libellé sans préfixe pour correspondre à la BD
                    libelle = `${trPercent.toFixed(2)}% TR et ${dcPercent.toFixed(2)}% DC`;
                }

                console.log(`📝 [validateAndDetectMissing] Libellé généré: "${libelle}"`);

                // Chercher le régime avec différents formats possibles
                const regimeExists = await prisma.tRegimesDeclarations.findFirst({
                    where: {
                        OR: [
                            { Libelle_Regime_Declaration: libelle },
                            // Essayer aussi avec le format avec préfixe
                            { Libelle_Regime_Declaration: `${row.regimeCode || 'IM4'} ${libelle}` },
                            // Essayer avec le taux DC directement
                            { Taux_DC: ratio / 100 },
                        ]
                    }
                });

                console.log(`🔍 [validateAndDetectMissing] Régime trouvé en BD:`, regimeExists);

                if (regimeExists) {
                    // Le régime existe mais n'est pas associé au client
                    const alreadyAdded = unassociatedRegimes.find(r => r.ratio === ratio);
                    if (!alreadyAdded) {
                        unassociatedRegimes.push({ 
                            code: row.regimeCode || 'IM4', 
                            ratio,
                            libelle: regimeExists.Libelle_Regime_Declaration
                        });
                        console.log(`🔗 [validateAndDetectMissing] Régime non associé ajouté: ${ratio}%`);
                    }
                } else {
                    // Le régime n'existe pas du tout
                    const alreadyAdded = missingRegimes.find(m => m.ratio === ratio);
                    if (!alreadyAdded) {
                        missingRegimes.push({ 
                            code: row.regimeCode || 'IM4', 
                            ratio,
                        });
                        console.log(`❌ [validateAndDetectMissing] Régime manquant ajouté: ${ratio}%`);
                    }
                }
            } else {
                console.log(`✅ [validateAndDetectMissing] Régime ${ratio}% OK (trouvé dans les associations client)`);
            }
        }
    }

    const result = {
        devises: missingDevises,
        pays: missingPays,
        hscodes: missingHscodes,
        regimes: missingRegimes,
        unassociatedRegimes, // Régimes existants mais non associés au client
    };

    console.log('📋 [validateAndDetectMissing] Résultat final:', result);

    return result;
}

/**
 * Vérifie les rowKeys existants dans un dossier
 */
export async function checkExistingRowKeys(dossierId: number, rowKeys: string[]) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            throw new Error("Missing User Session");
        }

        const existingColisages = await prisma.tColisageDossiers.findMany({
            where: {
                Dossier: dossierId,
                UploadKey: {
                    in: rowKeys.filter(Boolean),
                },
            },
            select: {
                ID_Colisage_Dossier: true,
                UploadKey: true,
                Description_Colis: true,
            },
        });

        return {
            success: true,
            data: existingColisages,
        };
    } catch (error) {
        console.error("checkExistingRowKeys error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Erreur lors de la vérification" };
    }
}

/**
 * Vérifie si un colisage existe déjà dans la base de données
 * Utilise les colonnes de l'index unique: (No_Facture, Nom_Fournisseur, Item_No, No_Commande)
 */
export async function checkColisageExists(dossierId: number, item: any) {
  try {
    // Vérifier sur les colonnes de l'index unique + Dossier
    const existingColisages = await prisma.tColisageDossiers.findMany({
      where: {
        Dossier: dossierId,
        No_Facture: item.No_Facture || "",
        Nom_Fournisseur: item.Nom_Fournisseur || "",
        Item_No: item.No_Article || "1",
        No_Commande: item.No_Commande || "",
      },
      take: 1,
    });
    
    if (existingColisages.length > 0) {
      console.log(`🔍 Colisage existant trouvé: Facture=${item.No_Facture}, Fournisseur=${item.Nom_Fournisseur}, Article=${item.No_Article}, Commande=${item.No_Commande}`);
    }
    
    return existingColisages.length > 0 ? existingColisages[0] : null;
  } catch (error) {
    console.error("checkColisageExists error:", error);
    return null;
  }
}

export async function previewColisagesImport(
  formData: FormData,
  dossierId: number,
) {
  try {
    // ========================================================================
    // ÉTAPE 1 : AUTHENTIFICATION
    // ========================================================================
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Missing User Session");
    console.log("✅ [previewColisagesImport] Session utilisateur validée");

    // ========================================================================
    // ÉTAPE 2 : LECTURE DU FICHIER EXCEL
    // ========================================================================
    const file = formData.get("file") as File;
    if (!file) return { success: false, error: "Aucun fichier fourni" };

    const XLSX = require("xlsx");
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

    if (rows.length === 0) return { success: false, error: "Le fichier est vide" };
    console.log(`📊 [previewColisagesImport] ${rows.length} lignes trouvées dans le fichier Excel`);

    // ========================================================================
    // ÉTAPE 3 : INITIALISATION DES VARIABLES
    // ========================================================================
    const previewData: ImportColisageRowNormalized[] = [];
    const errors: string[] = [];
    const missingHsCodes = new Set<string>();  // HS Codes non trouvés dans la BD

    // Fonction utilitaire : récupère une valeur texte ou retourne la valeur par défaut
    const getValue = (value: any, defaultValue: any = null): string | null => {
      if (value === null || value === undefined || value === "") return defaultValue;
      return String(value).trim();
    };

    // Fonction utilitaire : récupère une valeur numérique ou retourne 0
    const getNumericValue = (value: any, defaultValue: number = 0): number => {
      if (value === null || value === undefined || value === "") return defaultValue;
      const num = Number(String(value).trim());
      return isNaN(num) ? defaultValue : num;
    };

    // ========================================================================
    // ÉTAPE 4 : TRAITEMENT DE CHAQUE LIGNE DU FICHIER EXCEL
    // ========================================================================
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      try {
        // --------------------------------------------------------------------
        // 4.1 : EXTRACTION DES VALEURS BRUTES DEPUIS EXCEL
        // --------------------------------------------------------------------
        const hsCodeStr = getValue(row.HS_Code || row["HS_Code"], "");
        const deviseStr = getValue(row.Currency || row["Currency"] || row.Devise, "");
        const paysOrigineStr = getValue(row.Country_Origin || row["Country_Origin"] || row.Pays_Origine, "");
        const regimeRatioStr = getValue(row.Regime_Ratio || row["Regime_Ratio"], "0");
        const regimeCodeStr = getValue(row.Regime_Code || row["Regime_Code"], "");

        // --------------------------------------------------------------------
        // 4.2 : RECHERCHE DU HS CODE DANS LA BASE DE DONNÉES
        // --------------------------------------------------------------------
        // RÈGLE IMPORTANTE :
        // - HS_Code vide ou "0" dans Excel → hsCodeId = 0 (valeur spéciale acceptée)
        // - HS_Code valide dans Excel → chercher l'ID correspondant dans THSCodes
        let hsCodeId: number = 0;
        
        // Si le HS_Code Excel est vide, null, ou "0" → on garde hsCodeId = 0
        if (!hsCodeStr || hsCodeStr === "0" || hsCodeStr === "") {
          console.log(`📝 [Ligne ${i + 2}] HS_Code VIDE ou ZERO → hsCodeId = 0 (accepté)`);
        } else {
          // Le HS_Code Excel a une valeur → chercher dans la BD
          const hsCodeRecord = await prisma.tHSCodes.findFirst({
            where: { HS_Code: hsCodeStr },
            select: { ID_HS_Code: true }
          });
          
          if (hsCodeRecord) {
            // HS Code trouvé dans la BD → utiliser son ID
            hsCodeId = hsCodeRecord.ID_HS_Code;
            console.log(`✅ [Ligne ${i + 2}] HS_Code "${hsCodeStr}" TROUVÉ → ID = ${hsCodeId}`);
          } else {
            // HS Code NON trouvé dans la BD → garder hsCodeId = 0 et noter le manquant
            missingHsCodes.add(hsCodeStr);
            console.log(`⚠️ [Ligne ${i + 2}] HS_Code "${hsCodeStr}" NON TROUVÉ dans BD → hsCodeId = 0`);
          }
        }
 
        const rowData: ImportColisageRowNormalized = {
          UploadKey: String(row.Upload_Key || row["Upload_Key"] || `ROW_${i + 1}`),
          HS_Code: hsCodeId,
          Devise: deviseStr || "",
          Pays_Origine: paysOrigineStr || "",
          Regime_Declaration: regimeRatioStr || "",
          Regime_Code: regimeCodeStr || "",
          Description_Colis: getValue(row.Descr || row["Descr"] || row.Description_Colis, "") || "",
          No_Commande: getValue(row.Command_No || row["Command_No"] || row.No_Commande, "") || "",
          Nom_Fournisseur: getValue(row.Supplier_Name || row["Supplier_Name"] || row.Nom_Fournisseur, "") || "",
          No_Facture: getValue(row.Invoice_No || row["Invoice_No"] || row.No_Facture, "") || "",
          No_Article: getValue(row.Item_No || row["Item_No"] || row.No_Article, "1") || "1",
          Regroupement_Client: getValue(row.Customer_Grouping || row["Customer_Grouping"] || row.Regroupement_Client, "Sanaga") || "Sanaga",
          Regime_Ratio: getNumericValue(row.Regime_Ratio || row["Regime_Ratio"], 0),
          Qte_Colis: getNumericValue(row.Qty || row["Qty"] || row.Qte_Colis, 1),
          Prix_Unitaire_Colis: getNumericValue(row.Unit_Prize || row["Unit_Prize"] || row.Prix_Unitaire_Colis, 0),
          Poids_Brut: getNumericValue(row.Gross_Weight || row["Gross_Weight"] || row.Poids_Brut, 0),
          Poids_Net: getNumericValue(row.Net_Weight || row["Net_Weight"] || row.Poids_Net, 0),
          Volume: getNumericValue(row.Volume || row["Volume"], 0),
        };

        // ⚠️ PLUS DE VALIDATION BLOQUANTE - On accepte tout !
        // Les valeurs vides seront gérées avec des valeurs par défaut
        // Si Devise vide → on met "EUR" par défaut
        if (!rowData.Devise) {
          rowData.Devise = "EUR";
          console.log(`⚠️ [Ligne ${i + 2}] Devise vide → défaut "EUR"`);
        }
        // Si Quantité invalide → on met 1 par défaut
        if (!rowData.Qte_Colis || rowData.Qte_Colis <= 0) {
          rowData.Qte_Colis = 1;
          console.log(`⚠️ [Ligne ${i + 2}] Quantité invalide → défaut 1`);
        }

        const existingColisage = await checkColisageExists(dossierId, rowData);
 
        previewData.push({
          ...rowData,
          status: existingColisage ? "existing" : "new",
          existingId: existingColisage?.ID_Colisage_Dossier,
          existingData: existingColisage ? {
            HS_Code: existingColisage.HS_Code,
            Description_Colis: existingColisage.Description_Colis,
            Qte_Colis: Number(existingColisage.Qte_Colis),
          } : null,
        });
 
      } catch (error: any) {
        console.error(`❌ [Ligne ${i + 2}] Erreur inattendue:`, error.message);
        errors.push(`Ligne ${i + 2}: ${error.message}`);
      }
    }

    // ========================================================================
    // ÉTAPE 5 : LOG RÉCAPITULATIF ET RETOUR DES RÉSULTATS
    // ========================================================================
    const statsNew = previewData.filter((p) => p.status === "new").length;
    const statsExisting = previewData.filter((p) => p.status === "existing").length;
    
    console.log(`\n🎉 ============== RÉCAPITULATIF PRÉVISUALISATION ==============`);
    console.log(`📊 Total lignes Excel: ${rows.length}`);
    console.log(`✅ Lignes valides: ${previewData.length}`);
    console.log(`   - Nouveaux colisages: ${statsNew}`);
    console.log(`   - Colisages existants: ${statsExisting}`);
    console.log(`❌ Lignes en erreur: ${errors.length}`);
    if (missingHsCodes.size > 0) {
      console.log(`⚠️ HS Codes non trouvés dans BD: ${Array.from(missingHsCodes).join(", ")}`);
    }
    console.log(`===============================================================\n`);

    return {
      success: true,
      data: {
        preview: previewData,
        total: rows.length,
        valid: previewData.length,
        errors: errors.length > 0 ? errors : undefined,
        stats: {
          new: statsNew,
          existing: statsExisting,
        },
        missingData: {
          hsCodes: Array.from(missingHsCodes),
        },
      },
    };
  } catch (error) {
    console.error("❌ [previewColisagesImport] Erreur globale:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la prévisualisation",
    };
  }
}

/**
 * ============================================================================
 * FONCTION : importSelectedColisages
 * ============================================================================
 * Rôle : Importe les colisages sélectionnés dans la base de données via
 * la procédure stockée pSP_AjouterColisageDossier.
 * 
 * FLUX :
 * 1. Vérifie l'authentification utilisateur
 * 2. Vérifie que le dossier existe
 * 3. Pour chaque ligne :
 *    a. Convertit HS_Code ID → Code texte (ex: 123 → "8204110000")
 *    b. Convertit Devise (texte ou ID) → Code texte (ex: "EUR")
 *    c. Convertit Pays (texte ou ID) → Code texte (ex: "FR")
 *    d. Appelle la procédure stockée SQL
 * 4. Gère les erreurs (doublons, données manquantes)
 * 
 * PARAMÈTRES :
 * @param dossierId - ID du dossier cible
 * @param rows - Tableau des lignes à importer (depuis previewColisagesImport)
 * @param updateExisting - Si true, met à jour les colisages existants
 * ============================================================================
 */
export async function importSelectedColisages(
  dossierId: number,
  rows: any[],
  updateExisting: boolean = false,
) {
  // ========================================================================
  // ÉTAPE 1 : VÉRIFICATION DE L'AUTHENTIFICATION
  // ========================================================================
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Missing User Session");
  }

  // ========================================================================
  // ÉTAPE 2 : VÉRIFICATION QUE LE DOSSIER EXISTE
  // ========================================================================
  const dossierExists = await prisma.tDossiers.findUnique({
    where: { ID_Dossier: dossierId },
    select: { ID_Dossier: true }
  });

  if (!dossierExists) {
    return {
      success: false,
      error: `Le dossier ID ${dossierId} n'existe pas`,
      data: { created: 0, updated: 0, total: rows.length, errors: [{ row: 0, error: `Dossier ${dossierId} introuvable` }] },
    };
  }

  // ========================================================================
  // ÉTAPE 3 : INITIALISATION DES COMPTEURS
  // ========================================================================
  const createdColisages: any[] = [];
  const updatedColisages: any[] = [];
  const skippedColisages: any[] = [];  // Doublons sautés
  const errors: Array<{ row: number; uploadKey?: string; error: string }> = [];

   // Extraire les valeurs distinctes pour chaque type
          const distinctDevises = [...new Set(rows.map(r => r.devise).filter(Boolean))];
          const distinctPays = [...new Set(rows.map(r => r.paysOrigine).filter(Boolean))];
          // Convertir les HS codes en strings pour la comparaison, mapper "0" vers "-"
          const distinctHscodes = [...new Set(rows.map(r => r.hscode).filter(h => h !== null && h !== undefined).map(h => {
              const hsCode = String(h);
              return hsCode === '0' ? '-' : hsCode; // Mapper "0" vers "-" qui correspond à l'ID 0
          }))];
          
          // Préparer les régimes avec leurs taux DC
          const distinctRegimes = [...new Set(rows
              .filter(r => r.regimeRatio !== undefined && r.regimeRatio !== null)
              .map(r => {
                  const ratio = typeof r.regimeRatio === 'string' ? parseFloat(r.regimeRatio) : r.regimeRatio;
                  return (ratio / 100).toString(); // Convertir en décimal (0-1)
              })
          )];
  
          // Utiliser Prisma pour récupérer les IDs
          const devisesMap = new Map<string, number>();
          if (distinctDevises.length > 0) {
              const devisesResult = await prisma.vDevises.findMany({
                  where: { Code_Devise: { in: distinctDevises } },
                  select: { ID_Devise: true, Code_Devise: true }
              });
              devisesResult.forEach(d => devisesMap.set(d.Code_Devise, d.ID_Devise));
          }
  
          const paysMap = new Map<string, number>();
          if (distinctPays.length > 0) {
              const paysResult = await prisma.vPays.findMany({
                  where: { Code_Pays: { in: distinctPays } },
                  select: { ID_Pays: true, Code_Pays: true }
              });
              paysResult.forEach(p => paysMap.set(p.Code_Pays, p.ID_Pays));
          }
  
          const hscodesMap = new Map<string, number>();
          if (distinctHscodes.length > 0) {
              const hscodesResult = await prisma.vHSCodes.findMany({
                  where: { 
                      OR: [
                          { HS_Code: { in: distinctHscodes } },
                          { ID_HS_Code: 0 } // Inclure explicitement l'ID 0
                      ]
                  },
                  select: { ID_HS_Code: true, HS_Code: true }
              });
              hscodesResult.forEach(h => hscodesMap.set(h.HS_Code, h.ID_HS_Code));
          }

  console.log(`\n🚀 ============================================================`);
  console.log(`🚀 [importSelectedColisages] DÉBUT IMPORT`);
  console.log(`🚀 Dossier ID: ${dossierId}`);
  console.log(`🚀 Nombre de lignes: ${rows.length}`);
  console.log(`🚀 Mode mise à jour: ${updateExisting ? 'OUI' : 'NON'}`);
  console.log(`🚀 ============================================================\n`);
  
  // DEBUG : Afficher la structure de la première ligne pour comprendre les noms de propriétés
  if (rows.length > 0) {
    console.log(`📋 [DEBUG] Structure de la première ligne reçue:`);
    console.log(JSON.stringify(rows[0], null, 2));
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const uploadKey = row.UploadKey || row.Upload_Key || `ROW_${i + 1}`;
          let hsCodeValue = "0";
          let DeviseValue = "EUR";
          let PaysValue = "";
          let regimeRatio = 0;
          let regimeCode = "";
          
          try {
            console.log(`\n========== LIGNE ${i + 1}/${rows.length} ==========`);
            
            console.log(` Données brutes reçues:`, {
              HS_Code: row.HS_Code,
              Devise: row.Devise,
              Pays_Origine: row.Pays_Origine,
              Regime_Ratio: row.Regime_Ratio,
              Regime_Code: row.Regime_Code,
              Description: row.Description_Colis?.substring(0, 30),
              UploadKey: uploadKey,
              status: row.status,  // "new" ou "existing"
              existingId: row.existingId,  // ID si existant
            });

            // ============================================================
            // HS_CODE : Convertir ID → Code texte
            // Si ID = 0 ou non trouvé → "0" (désactive validations Pays/Régime)
            // ============================================================
            if (row.HS_Code && row.HS_Code !== 0) {
              const hsCodeRecord = await tx.tHSCodes.findUnique({
                where: { ID_HS_Code: row.HS_Code },
                select: { HS_Code: true }
              });
              if (hsCodeRecord) {
                hsCodeValue = hsCodeRecord.HS_Code;
                console.log(`✅ HS_Code ID ${row.HS_Code} → Code "${hsCodeValue}"`);
              } else {
                hsCodeValue = "0";
                console.log(`⚠️ HS_Code ID ${row.HS_Code} NON TROUVÉ → utilisation de "0"`);
              }
            } else {
              console.log(`📝 HS_Code vide/0 → utilisation de "0"`);
            }

            // ============================================================
            // DEVISE : Convertir ID → Code_Devise (ex: 5 → "EUR")
            // ============================================================
            if (row.Devise && row.Devise !== 0 && row.Devise !== "0") {
              if (typeof row.Devise === "number") {
                const deviseRecord = await tx.tDevises.findUnique({
                  where: { ID_Devise: row.Devise },
                  select: { Code_Devise: true }
                });
                if (deviseRecord) {
                  DeviseValue = deviseRecord.Code_Devise;
                  console.log(`✅ Devise ID ${row.Devise} → Code "${DeviseValue}"`);
                } else {
                  console.log(`⚠️ Devise ID ${row.Devise} NON TROUVÉ → défaut "EUR"`);
                }
              } else {
                DeviseValue = String(row.Devise);
                console.log(`💱 Devise (texte): "${DeviseValue}"`);
              }
            } else {
              console.log(`📝 Devise vide → défaut "EUR"`);
            }

            // ============================================================
            // PAYS : Convertir ID → Code_Pays (ex: 75 → "FR")
            // ============================================================
            if (row.Pays_Origine && row.Pays_Origine !== 0 && row.Pays_Origine !== "0") {
              if (typeof row.Pays_Origine === "number") {
                const paysRecord = await tx.tPays.findUnique({
                  where: { ID_Pays: row.Pays_Origine },
                  select: { Code_Pays: true }
                });
                if (paysRecord) {
                  PaysValue = paysRecord.Code_Pays;
                  console.log(`✅ Pays ID ${row.Pays_Origine} → Code "${PaysValue}"`);
                } else {
                  console.log(`⚠️ Pays ID ${row.Pays_Origine} NON TROUVÉ → vide`);
                }
              } else {
                PaysValue = String(row.Pays_Origine);
                console.log(`🌍 Pays (texte): "${PaysValue}"`);
              }
            } else {
              console.log(`📝 Pays vide`);
            }

            // ============================================================
            // RÉGIME : Utiliser les valeurs des données ou défaut 0
            // ============================================================
            regimeRatio = (row.Regime_Ratio !== undefined && row.Regime_Ratio !== null && !isNaN(row.Regime_Ratio))
              ? (typeof row.Regime_Ratio === "string" ? parseFloat(row.Regime_Ratio) : row.Regime_Ratio)
              : 0;
            regimeCode = row.Regime_Code || "";
            console.log(`📜 Régime: Code="${regimeCode}", Ratio=${regimeRatio}`);

            // ========================================================================
            // CONSTRUCTION DE LA REQUÊTE SQL
            // ========================================================================
            // La procédure stockée pSP_AjouterColisageDossier fait :
            // - INSERT si le colisage n'existe pas (basé sur UploadKey)
            // - UPDATE si le colisage existe déjà
            const query = `
              EXEC [dbo].[pSP_AjouterColisageDossier]
                @Id_Dossier = ${dossierId},
                @Upload_Key = N'${uploadKey.replace(/'/g, "''")}',  -- Clé unique pour détecter les doublons
                @HS_Code = N'${hsCodeValue}',
                @Descr = N'${(row.Description_Colis || "").replace(/'/g, "''")}',
                @Command_No = N'${(row.No_Commande || "").replace(/'/g, "''")}',
                @Supplier_Name = N'${(row.Nom_Fournisseur || "").replace(/'/g, "''")}',
                @Invoice_No = N'${(row.No_Facture || "").replace(/'/g, "''")}',
                @Item_No = N'${(row.No_Article || "").replace(/'/g, "''")}',
                @Currency = N'${DeviseValue}',
                @Qty = ${row.Qte_Colis || 1},
                @Unit_Prize = ${row.Prix_Unitaire_Colis || 0},
                @Gross_Weight = ${row.Poids_Brut || 0},
                @Net_Weight = ${row.Poids_Net || 0},
                @Volume = ${row.Volume || 0},
                @Country_Origin = N'${PaysValue}',
                @Regime_Code = N'${regimeCode}',
                @Regime_Ratio = ${regimeRatio},
                @Customer_Grouping = N'${String(row.Regroupement_Client || "").replace(/'/g, "''")}',
                @Session = ${parseInt(session.user.id)}
            `;

            // ========================================================================
            // EXÉCUTION DE LA PROCÉDURE STOCKÉE
            // ========================================================================
            console.log(`🔧 Exécution procédure stockée avec:`);
            console.log(`   - @HS_Code = "${hsCodeValue}"`);
            console.log(`   - @Currency = "${DeviseValue}"`);
            console.log(`   - @Country_Origin = "${PaysValue}"`);
            console.log(`   - @Regime_Code = "${regimeCode}", @Regime_Ratio = ${regimeRatio}`);
            
            const colisage = await tx.$executeRawUnsafe(query);
            convertDecimalsToNumbers(colisage);
            
            // Déterminer si c'était une création ou une mise à jour
            if (row.status === "existing" && row.existingId) {
              console.log(`✅ LIGNE ${i + 1} MISE À JOUR (ID: ${row.existingId})`);
              updatedColisages.push({ uploadKey: uploadKey, processed: true, updated: true });
            } else {
              console.log(`✅ LIGNE ${i + 1} CRÉÉE AVEC SUCCÈS`);
              createdColisages.push({ uploadKey: uploadKey, processed: true });
            }

          } catch (error: any) {
            // ========================================================================
            // GESTION DES ERREURS
            // ========================================================================
            const errorMessage = error.message || "Erreur inconnue";
            
            console.log(`❌ [Ligne ${i + 1}] ERREUR:`, errorMessage);
            
            // Analyser le type d'erreur SQL Server
            let userFriendlyError = errorMessage;
            
            if (errorMessage.includes("HS CODE") && errorMessage.includes("NOT EXIST")) {
              userFriendlyError = `HS Code "${hsCodeValue}" non trouvé pour l'entité du dossier`;
              console.log(`   → Le HS Code existe peut-être mais pas pour cette entité`);
            } else if (errorMessage.includes("CURRENCY") && errorMessage.includes("NOT EXIST")) {
              userFriendlyError = `Devise "${DeviseValue}" non trouvée dans la base`;
            } else if (errorMessage.includes("COUNTRY CODE") && errorMessage.includes("NOT EXIST")) {
              userFriendlyError = `Pays "${PaysValue}" non trouvé dans la base`;
            } else if (errorMessage.includes("REGIME") && errorMessage.includes("NOT EXIST")) {
              userFriendlyError = `Régime "${regimeCode}" (${regimeRatio}%) non trouvé pour ce client`;
            } else if (errorMessage.includes("FILE ID") && errorMessage.includes("NOT EXIST")) {
              userFriendlyError = `Dossier ${dossierId} non trouvé`;
            }
            
            // GESTION DES DOUBLONS - On les saute sans erreur
            if (errorMessage.includes("2601") || errorMessage.includes("clé en double") || errorMessage.includes("duplicate key")) {
              console.log(`⏭️ [Ligne ${i + 1}] Doublon détecté - colisage existant non mis à jour`);
              // Ne pas compter comme créé, juste loguer
              skippedColisages.push({ uploadKey: uploadKey, processed: true, skipped: true });
              errors.push({ row: i + 1, uploadKey: uploadKey, error: "Colisage existant (cochez 'Mettre à jour' pour modifier)" });
              continue;  // Passer à la ligne suivante
            }

            // Ajouter l'erreur à la liste
            errors.push({ row: i + 1, uploadKey: uploadKey, error: userFriendlyError });
            console.log(`   → Erreur ajoutée: ${userFriendlyError}`);
          }
        }
      },
      { maxWait: 60000, timeout: 120000 },
    );

    // ========================================================================
    // RÉCAPITULATIF FINAL
    // ========================================================================
    console.log(`\n🎉 ============================================================`);
    console.log(`🎉 [importSelectedColisages] IMPORT TERMINÉ`);
    console.log(`🎉 Créés: ${createdColisages.length}`);
    console.log(`🎉 Mis à jour: ${updatedColisages.length}`);
    console.log(`🎉 Erreurs: ${errors.length}`);
    if (errors.length > 0) {
      console.log(`🎉 Détail des erreurs:`);
      errors.forEach(e => console.log(`   - Ligne ${e.row}: ${e.error}`));
    }
    console.log(`🎉 ============================================================\n`);
    
    // Invalider le cache pour rafraîchir les données
    revalidatePath(`/dossiers/${dossierId}`);
    revalidatePath("/colisage");

    return {
      success: true,
      data: { 
        created: createdColisages.length, 
        updated: updatedColisages.length, 
        total: rows.length, 
        errors: errors.length > 0 ? errors : undefined 
      },
    };
  } catch (transactionError: any) {
    console.error("❌ [importSelectedColisages] Erreur transaction:", transactionError);
    return {
      success: false,
      error: `Importation annulée : ${transactionError.message}`,
      data: { created: 0, updated: 0, total: rows.length, errors: errors.length > 0 ? errors : [{ row: 0, error: transactionError.message }] },
    };
  }
}

/**
 * Actions simples pour récupérer les données de référence
 */

// Actions compatibles avec le formulaire du module colisage (format: id, code, libelle)
export async function getAllHscodesForSelect() {
    try {
      const hscodes = await prisma.vHSCodes.findMany({
        where: { ID_HS_Code: { gt: 0 } },
        select: {
          ID_HS_Code: true,
          HS_Code: true,
          Libelle_HS_Code: true
        },
        orderBy: { HS_Code: 'asc' },
        distinct: ["Libelle_HS_Code"]
      });

      // Mapper vers le format attendu
      const mappedData = hscodes.map(h => ({
        id: h.ID_HS_Code,
        code: h.HS_Code,
        libelle: h.Libelle_HS_Code
      }));

      return { success: true, data: mappedData };
    } catch (error: any) {
      console.error('Erreur getAllHscodesForSelect:', error);
      return { success: false, error: error.message };
    }
  }

  export async function getAllDevisesForSelect() {
    try {
      const devises = await prisma.vDevises.findMany({
        where: { ID_Devise: { gt: 0 } },
        select: {
          ID_Devise: true,
          Code_Devise: true,
          Libelle_Devise: true
        },
        orderBy: { Code_Devise: 'asc' }
      });

      // Mapper vers le format attendu
      const mappedData = devises.map(d => ({
        id: d.ID_Devise,
        code: d.Code_Devise,
        libelle: d.Libelle_Devise
      }));

      return { success: true, data: mappedData };
    } catch (error: any) {
      console.error('Erreur getAllDevisesForSelect:', error);
      return { success: false, error: error.message };
    }
  }

  export async function getAllPaysForSelect() {
    try {
      const pays = await prisma.vPays.findMany({
        where: { ID_Pays: { gt: 0 } },
        select: {
          ID_Pays: true,
          Code_Pays: true,
          Libelle_Pays: true
        },
        orderBy: { Libelle_Pays: 'asc' }
      });
      console.log("pays", pays);

      // Mapper vers le format attendu
      const mappedData = pays.map(p => ({
        id: p.ID_Pays,
        code: p.Code_Pays,
        libelle: p.Libelle_Pays
      }));

      return { success: true, data: mappedData };
    } catch (error: any) {
      console.error('Erreur getAllPaysForSelect:', error);
      return { success: false, error: error.message };
    }
  }

  export async function getAllRegimeDeclarationsForSelect() {
    try {
      const regimesDeclarations = await prisma.vRegimesDeclarations.findMany({
        where: {
          ID_Regime_Declaration: {
            notIn: [0, 1]
          }
        },
        select: {
          ID_Regime_Declaration: true,
          Libelle_Regime_Declaration: true
        },
        orderBy: { Libelle_Regime_Declaration: 'asc' }
      });

      // Mapper vers le format attendu
      const mappedData = regimesDeclarations.map(r => ({
        id: r.ID_Regime_Declaration,
        libelle: r.Libelle_Regime_Declaration
      }));

      return { success: true, data: mappedData };
    } catch (error: any) {
      console.error('Erreur getAllRegimeDeclarationsForSelect:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Récupère un colisage au format du module colisage (pour le formulaire)
   */
  export async function getColisageForEdit(id: number) {
    try {
      const colisage = await prisma.vColisageDossiers.findFirst({
        where: { ID_Colisage_Dossier: id }
      });

      if (!colisage) {
        return { success: false, error: 'Colisage non trouvé' };
      }

      // Récupérer l'uploadKey depuis la table TColisageDossiers
      const uploadKeyData = await prisma.tColisageDossiers.findUnique({
        where: { ID_Colisage_Dossier: colisage.ID_Colisage_Dossier },
        select: { UploadKey: true }
      });

      // Mapper vers les anciens noms de colonnes pour la compatibilité frontend
      const mappedColisage = {
        ID_Colisage_Dossier: colisage.ID_Colisage_Dossier,
        ID_Dossier: colisage.ID_Dossier,
        HS_Code: colisage.HS_Code,
        Description_Colis: colisage.Description_Colis,
        No_Commande: colisage.No_Commande,
        Nom_Fournisseur: colisage.Nom_Fournisseur,
        No_Facture: colisage.No_Facture,
        Item_No: colisage.Item_No,
        Code_Devise: colisage.Code_Devise,
        Qte_Colis: colisage.Qte_Colis,
        Prix_Unitaire_Colis: colisage.Prix_Unitaire_Colis,
        Poids_Brut: colisage.Poids_Brut,
        Poids_Net: colisage.Poids_Net,
        Volume: colisage.Volume,
        Pays_Origine: colisage.Pays_Origine,
        ID_Regime_Declaration: colisage.ID_Regime_Declaration,
        ID_Regime_Douanier: colisage.ID_Regime_Douanier,
        Libelle_Regime_Declaration: colisage.Libelle_Regime_Declaration, // Afficher le libellé de déclaration
        Regroupement_Client: colisage.Regroupement_Client,
        UploadKey: uploadKeyData?.UploadKey || null, // Récupéré depuis TColisageDossiers
        Date_Creation: colisage.Date_Creation,
        Nom_Creation: colisage.Nom_Creation,
      };

      const serializedColisage = JSON.parse(JSON.stringify(mappedColisage));

      // Résoudre les IDs manquants
      if (serializedColisage.Code_Devise && !serializedColisage.ID_Devise) {
        const devise = await prisma.vDevises.findFirst({
          where: { Code_Devise: serializedColisage.Code_Devise },
          select: { ID_Devise: true }
        });
        if (devise) {
          serializedColisage.ID_Devise = devise.ID_Devise;
        }
      }

      if (serializedColisage.Pays_Origine && !serializedColisage.ID_Pays_Origine) {
        const pays = await prisma.vPays.findFirst({
          where: { Libelle_Pays: serializedColisage.Pays_Origine },
          select: { ID_Pays: true }
        });
        if (pays) {
          serializedColisage.ID_Pays_Origine = pays.ID_Pays;
        }
      }

      if (serializedColisage.HS_Code && !serializedColisage.ID_HS_Code) {
        const hsCode = await prisma.vHSCodes.findFirst({
          where: { ID_HS_Code: serializedColisage.HS_Code },
          select: { ID_HS_Code: true }
        });
        if (hsCode) {
          serializedColisage.ID_HS_Code = hsCode.ID_HS_Code;
        }
      }

      // Convertir au format attendu par le formulaire du module colisage
      const formattedColisage = {
        id: serializedColisage.ID_Colisage_Dossier.toString(),
        description: serializedColisage.Description_Colis || "",
        numeroCommande: serializedColisage.No_Commande || null,
        nomFournisseur: serializedColisage.Nom_Fournisseur || null,
        numeroFacture: serializedColisage.No_Facture || null,
        quantite: Number(serializedColisage.Qte_Colis) || 1,
        prixUnitaireColis: Number(serializedColisage.Prix_Unitaire_Colis) || 0,
        poidsBrut: Number(serializedColisage.Poids_Brut) || 0,
        poidsNet: Number(serializedColisage.Poids_Net) || 0,
        volume: Number(serializedColisage.Volume) || 0,
        regroupementClient: serializedColisage.Regroupement_Client || null,
        hscodeId: serializedColisage.ID_HS_Code?.toString() || null,
        deviseId: serializedColisage.ID_Devise?.toString() || undefined,
        paysOrigineId: serializedColisage.ID_Pays_Origine?.toString() || undefined,
        regimeDeclarationId: serializedColisage.ID_Regime_Declaration?.toString() || null,
      };

      return { success: true, data: formattedColisage };
    } catch (error: any) {
      console.error('Erreur getColisageForEdit:', error);
      return { success: false, error: error.message };
    }
  }