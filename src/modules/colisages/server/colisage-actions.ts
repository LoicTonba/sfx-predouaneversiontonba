"use server";

// ============================================================================
// MODULE COLISAGE-ACTIONS.TS - GESTION DES COLISAGES
// ============================================================================
// Role global : Ce fichier contient toutes les actions serveur pour la gestion
// des colisages (packages) dans les dossiers de douane. Il gere les operations
// CRUD (Creer, Lire, Mettre a jour, Supprimer), l'import Excel et les
// statistiques des colisages.
//
// Architecture :
// - Utilise VColisageDossiers (vue) pour les lectures avec jointures
// - Utilise TColisageDossiers (table) pour les ecritures
// - Inclut l'authentification utilisateur pour securiser les actions
// - Gere la serialisation des Decimal Prisma
// - Invalide le cache Next.js apres modifications
// ============================================================================

// Import des bibliotheques necessaires
import auth from "@/lib/auth";  // Systeme d'authentification pour securiser les actions
import prisma from "@/lib/prisma";  // prisma pour les interactions avec la base de donnees
import { Prisma } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";  // Fonction Next.js pour invalider le cache
import { headers } from "next/headers";  // Fonction Next.js pour recuperer les en-tetes HTTP (sessions)

/**
 * ============================================================================
 * FONCTION UTILITAIRE : convertDecimalsToNumbers
 * ============================================================================
 * Role global : Convertit les objets Decimal Prisma en nombres JavaScript.
 * Essentiel pour la serialisation JSON et la compatibilite avec le frontend.
 * 
 * Parametre :
 * @param data - Objet contenant potentiellement des Decimal A convertir
 * 
 * Retour : Objet avec tous les Decimal convertis en nombres
 * ============================================================================
 */
function convertDecimalsToNumbers(data: any): any {
    // Convertit l'objet en JSON string en remplacant les Decimal par des nombres
    const jsonString = JSON.stringify(data, (_, value) => {
        // Verifie si la valeur est un objet Decimal Prisma
        if (value && typeof value === 'object' && value.constructor.name === 'Decimal') {
            return parseFloat(value.toString()); // Convertit le Decimal en nombre
        }
        return value; // Garde les autres valeurs inchangees
    });
    // Reparse le JSON pour obtenir l'objet avec des nombres normaux
    return JSON.parse(jsonString);
}

/**
 * Normalise un ratio regime pour comparaison avec SQL Server.
 *
 * Pourquoi:
 * - l'import peut envoyer 0.4851 (decimal) ou parfois 48.51 (pourcentage),
 * - la colonne [Taux Regime] est DECIMAL(24,3), donc on aligne la precision a 3 decimales.
 */
function normalizeRegimeRatio(input: number): number {
    if (!Number.isFinite(input)) return 0;
    if (input === -2 || input === -1 || input === 0 || input === 1) return input;

    const decimal = input > 1 ? input / 100 : input;
    return Number(decimal.toFixed(3));
}

/**
 * Genere le libelle humain d'un regime a partir du ratio normalise.
 */
function buildRegimeLibelle(normalizedRatio: number): string {
    if (normalizedRatio === -2) return "TTC";
    if (normalizedRatio === -1) return "100% TR";
    if (normalizedRatio === 0) return "EXO";
    if (normalizedRatio === 1) return "100% DC";

    const dcPercent = normalizedRatio * 100;
    const trPercent = 100 - dcPercent;
    return `${trPercent.toFixed(2)}% TR et ${dcPercent.toFixed(2)}% DC`;
}

/**
 * ============================================================================
 * FONCTION : getColisagesDossier
 * ============================================================================
 * Role global : Recupere TOUS les colisages d'un dossier specifique avec
 * toutes leurs informations (jointures incluses) via la vue VColisageDossiers.
 * 
 * Parametre :
 * @param dossierId - ID numerique du dossier pour lequel on veut les colisages
 * 
 * Retour : Objet { success: boolean, data: array, error?: string }
 * ============================================================================
 */
export async function getColisagesDossier(dossierId: number) {
  try {
    // --------------------------------------------------------------------
    // 1. LA VERIFICATION DE L'AUTHENTIFICATION
    // --------------------------------------------------------------------
    // Recupere la session utilisateur depuis les en-tÃªtes HTTP
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Si aucune session n'est trouvee, l'utilisateur n'est pas authentifie
    if (!session) {
      throw new Error("Missing User Session");
    }

    // --------------------------------------------------------------------
    // 2. LA RECUPERATION  DES COLISAGES PRINCIPAUX
    // --------------------------------------------------------------------
    // Interroge la vue VColisageDossiers qui contient deje  toutes les jointures
    const colisages = await prisma.vColisageDossiers.findMany({
      where: { ID_Dossier: dossierId },    // Filtre : uniquement les colisages du dossier specifie
      orderBy: { Date_Creation: 'asc' },     // Tri : par date de creation croissante (plus ancien d'abord)
      distinct: ["ID_Colisage_Dossier"]
    });

    // --------------------------------------------------------------------
    // 3. LA RECUPERATION DES UPLOADKEYS MANQUANTS
    // --------------------------------------------------------------------
    // La vue VColisageDossiers ne contient pas l'UploadKey, on va la chercher
    // dans la table TColisageDossiers pour chaque colisage
    const uploadKeys = await prisma.tColisageDossiers.findMany({
      where: { Dossier: dossierId },                    // Meme filtre que ci-dessus
      select: { ID_Colisage_Dossier: true, UploadKey: true }  // Selectionne uniquement l'ID et l'UploadKey
    });

    // Cree une Map (dictionnaire) pour un access O(1) aux UploadKeys par ID
    // Format : Map( ID_Colisage_Dossier => UploadKey )
    const uploadKeyMap = new Map(uploadKeys.map(uk => [uk.ID_Colisage_Dossier, uk.UploadKey]));

    // --------------------------------------------------------------------
    // 4. LE MAPPING DES DONNEES POUR LE FRONTEND
    // --------------------------------------------------------------------
    // Transforme les donnees de la vue en format compatible avec le frontend
    // Conserve les noms de colonnes originaux pour la retrocompatibilite
    const mappedColisages = colisages.map(c => ({
      ID_Colisage_Dossier: c.ID_Colisage_Dossier,     // Identifiant unique du colisage
      ID_Dossier: c.ID_Dossier,                     // ID du dossier parent
      HS_Code: c.HS_Code,                            // Code HS (Harmonized System) du produit
      Description_Colis: c.Description_Colis,         // Description detaillee du colisage
      No_Commande: c.No_Commande,                    // Numero de commande client
      Nom_Fournisseur: c.Nom_Fournisseur,            // Nom du fournisseur
      No_Facture: c.No_Facture,                      // Numero de facture
      Item_No: c.Item_No,                            // Numero d'article (SKU)
      Code_Devise: c.Code_Devise,                    // Code de la devise (EUR, USD, etc.)
      Qte_Colis: c.Qte_Colis,                     // Quantite de colis
      Prix_Unitaire_Colis: c.Prix_Unitaire_Colis, // Prix unitaire du colisage
      Poids_Brut: c.Poids_Brut,                      // Poids brut en kg
      Poids_Net: c.Poids_Net,                        // Poids net en kg
      Volume: c.Volume,                             // Volume en m³
      Pays_Origine: c.Pays_Origine,                  // Pays d'origine du produit
      ID_Regime_Declaration: c.ID_Regime_Declaration, // ID du regime douanier de declaration
      ID_Regime_Douanier: c.ID_Regime_Douanier,       // ID du regime douanier
      Libelle_Regime_Declaration: c.Libelle_Regime_Declaration, // Libelle lisible du regime
      Regroupement_Client: c.Regroupement_Client,   // Champ de regroupement pour le client
      UploadKey: uploadKeyMap.get(c.ID_Colisage_Dossier) || null, // Cle d'upload (recupere depuis la Map)
      Date_Creation: c.Date_Creation,               // Date et heure de creation
      Nom_Creation: c.Nom_Creation,                  // Nom de l'utilisateur qui a cree
    }));

    // --------------------------------------------------------------------
    // 5. LA SERIALISATION DES DONNEES
    // --------------------------------------------------------------------
    // Prisma retourne des objets Decimal qui ne peuvent pas etre serialises en JSON
    // JSON.parse(JSON.stringify()) convertit les Decimal en nombres normaux
    const serializedColisages = JSON.parse(JSON.stringify(mappedColisages));

    // --------------------------------------------------------------------
    // 6. LE RETOUR DU RESULTAT
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
 * Role global : Recupere UN SEUL colisage specifique par son ID avec toutes
 * ses informations detaillees. Resout egalement les IDs manquants en faisant
 * des recherches supplementaires dans les tables de reference.
 * 
 * Parametre :
 * @param id - ID numerique du colisage A recuperer
 * 
 * Retour : Objet { success: boolean, data: object, error?: string }
 * ============================================================================
 */
export async function getColisageById(id: number) {
  try {
    // VÃ©rification de l'authentification utilisateur
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

    // Si aucun colisage trouve, retourne une erreur
    if (!colisage) {
      return { success: false, error: 'Colisage non trouvÃ©' };
    }

    // Recuperation de l'uploadKey depuis la table TColisageDossiers (non inclus dans la vue)
    const uploadKeyData = await prisma.tColisageDossiers.findUnique({
      where: { ID_Colisage_Dossier: colisage.ID_Colisage_Dossier },
      select: { UploadKey: true }
    });

    // Mapping vers les anciens noms de colonnes pour la compatibilite frontend
    const mappedColisage = {
      ID_Colisage_Dossier: colisage.ID_Colisage_Dossier,     // ID du colisage
      ID_Dossier: colisage.ID_Dossier,                     // ID du dossier parent
      HS_Code: colisage.HS_Code,                            // Code HS du produit
      Description_Colis: colisage.Description_Colis,         // Description du colis
      No_Commande: colisage.No_Commande,                    // Numero de commande
      Nom_Fournisseur: colisage.Nom_Fournisseur,            // Nom du fournisseur
      No_Facture: colisage.No_Facture,                      // Numero de facture
      Item_No: colisage.Item_No,                            // Numero d'article
      Code_Devise: colisage.Code_Devise,                    // Code de la devise
      Qte_Colis: colisage.Qte_Colis,                     // Quantite de colis
      Prix_Unitaire_Colis: colisage.Prix_Unitaire_Colis, // Prix unitaire facture
      Poids_Brut: colisage.Poids_Brut,                      // Poids brut
      Poids_Net: colisage.Poids_Net,                        // Poids net
      Volume: colisage.Volume,                             // Volume
      Pays_Origine: colisage.Pays_Origine,                  // Pays d'origine
      ID_Regime_Declaration: colisage.ID_Regime_Declaration, // ID du regime de declaration
      ID_Regime_Douanier: colisage.ID_Regime_Douanier,       // ID du regime douanier
      Libelle_Regime_Declaration: colisage.Libelle_Regime_Declaration, // Libelle du regime
      Regroupement_Client: colisage.Regroupement_Client,   // Regroupement client
      UploadKey: uploadKeyData?.UploadKey || null,       // Cle d'upload
      Date_Creation: colisage.Date_Creation,               // Date de creation
      Nom_Creation: colisage.Nom_Creation,                  // Nom du createur
    };

    // Serialisation des Decimal pour eviter les erreurs de serialisation JSON
    const serializedColisage = JSON.parse(JSON.stringify(mappedColisage));

    // Resolution des IDs manquants pour la compatibilite
    // 1. ID_Devise A partir de Code_Devise
    if (serializedColisage.Code_Devise && !serializedColisage.ID_Devise) {
      const devise = await prisma.vDevises.findFirst({
        where: { Code_Devise: serializedColisage.Code_Devise },
        select: { ID_Devise: true }
      });
      if (devise) {
        serializedColisage.ID_Devise = devise.ID_Devise;
      }
    }

    // 2. ID_Pays_Origine A partir de Pays_Origine
    if (serializedColisage.Pays_Origine && !serializedColisage.ID_Pays_Origine) {
      const pays = await prisma.vPays.findFirst({
        where: { Libelle_Pays: serializedColisage.Pays_Origine },
        select: { ID_Pays: true }
      });
      if (pays) {
        serializedColisage.ID_Pays_Origine = pays.ID_Pays;
      }
    }

    // 3. ID_HS_Code A partir de HS_Code (string)
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
 * Recupere tous les colisages via VColisageDossiers
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
 * Recupere tous les colisages d'un dossier via VColisageDossiers
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

    // Serialiser les Decimal pour les calculs
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
 * Interface TypeScript pour la creation d'un colisage
 * Definit la structure des donnees attendues pour la creation
 */
export interface CreateColisageInput {
  dossier: number;              // ID du dossier parent (obligatoire)
  hsCode?: number;              // ID du HS Code (optionnel)
  descriptionColis: string;     // Description du colis (obligatoire)
  noCommande?: string;          // Numero de commande (optionnel)
  nomFournisseur?: string;      // Nom du fournisseur (optionnel)
  noFacture?: string;           // Numero de facture (optionnel)
  itemNo?: string;              // Numero d'article (optionnel)
  devise: number;               // ID de la devise (obligatoire)
  qteColisage?: number;         // Quantite (defaut: 1)
  prixUnitaireColis?: number; // Prix unitaire colis (defaut: 0)
  poidsBrut?: number;           // Poids brut (defaut: 0)
  poidsNet?: number;            // Poids net (defaut: 0)
  volume?: number;              // Volume (defaut: 0)
  ajustementValeur?: number;    // Ajustement de la valeur (optionnel)
  paysOrigine: number;           // ID du pays d'origine (obligatoire)
  regimeDeclaration?: number;   // ID du regime de declaration (optionnel)
  regroupementClient?: string;  // Regroupement client (defaut: '-')
  uploadKey?: string;           // Cle d'upload pour l'import Excel (optionnel)
  sessionId: number;            // ID de la session utilisateur (obligatoire)
}

/**
 * Cree un nouveau colisage dans un dossier
 */
export async function createColisage(data: any) {
  try {
    // 1) Verifier la session utilisateur avant toute ecriture.
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Missing User Session");
    }

    // 2) Normaliser et valider les donnees minimales.
    const sessionId = Number(session.user.id);
    if (!Number.isInteger(sessionId)) {
      throw new Error("Session utilisateur invalide");
    }

    const dossierId = Number(data.dossierId);
    if (!Number.isInteger(dossierId) || dossierId <= 0) {
      throw new Error("ID dossier invalide");
    }

    const hsCodeId = data.hsCodeId ? Number(data.hsCodeId) : 0;
    const deviseId = data.deviseId ? Number(data.deviseId) : 0;
    const paysOrigineId = data.paysOrigineId ? Number(data.paysOrigineId) : 0;
    const regimeDeclarationId = data.regimeDeclarationId ? Number(data.regimeDeclarationId) : null;

    const descriptionColis = String(data.description ?? "").trim();
    if (!descriptionColis) {
      throw new Error("La description du colis est obligatoire");
    }

    const noCommande = String(data.numeroCommande ?? "");
    const nomFournisseur = String(data.nomFournisseur ?? "");
    const noFacture = String(data.numeroFacture ?? "");
    const itemNo = data.article?.toString() || "1";
    const qteColis = Number(data.quantite ?? 1);
    const prixUnitaireColis = Number(data.prixUnitaireColis ?? 0);
    const poidsBrut = Number(data.poidsBrut ?? 0);
    const poidsNet = Number(data.poidsNet ?? 0);
    const volume = Number(data.volume ?? 0);
    const regroupementClient = String(data.regroupementClient ?? "-");
    const uploadKey = String(
      data.uploadKey ?? `COL_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
    );
    const dateCreation = new Date();

    // 3) Insertion SQL parametree.
    // Pourquoi: dans ton client Prisma genere, tColisageDossiers.create() n'existe pas.
    // OUTPUT ... INTO est utilise pour rester compatible SQL Server (tables avec triggers).
    const insertedRows = await prisma.$queryRaw<Array<{ ID_Colisage_Dossier: number }>>`
      DECLARE @Inserted TABLE (ID_Colisage_Dossier INT);

      INSERT INTO dbo.TColisageDossiers (
        [Dossier],
        [HS Code],
        [Description Colis],
        [No Commande],
        [Nom Fournisseur],
        [No Facture],
        [Devise],
        [Item No],
        [Qte Colis],
        [Prix Unitaire Colis],
        [Poids Brut],
        [Poids Net],
        [Volume],
        [Pays Origine],
        [Regime Declaration],
        [Regroupement Client],
        [UploadKey],
        [Session],
        [Date Creation]
      )
      OUTPUT INSERTED.[ID Colisage Dossier] INTO @Inserted (ID_Colisage_Dossier)
      VALUES (
        ${dossierId},
        ${hsCodeId},
        ${descriptionColis},
        ${noCommande},
        ${nomFournisseur},
        ${noFacture},
        ${deviseId},
        ${itemNo},
        ${qteColis},
        ${prixUnitaireColis},
        ${poidsBrut},
        ${poidsNet},
        ${volume},
        ${paysOrigineId},
        ${regimeDeclarationId},
        ${regroupementClient},
        ${uploadKey},
        ${sessionId},
        ${dateCreation}
      );

      SELECT ID_Colisage_Dossier FROM @Inserted;
    `;

    const createdId = insertedRows[0]?.ID_Colisage_Dossier;
    if (!createdId) {
      throw new Error("Echec de creation du colisage");
    }

    // 4) Relire la ligne creee via Prisma pour renvoyer un objet stable.
    const colisage = await prisma.tColisageDossiers.findUnique({
      where: { ID_Colisage_Dossier: createdId },
    });

    if (!colisage) {
      throw new Error("Colisage cree introuvable");
    }

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
 * Interface TypeScript pour la mise a jour d'un colisage
 * DÃ©finit la structure des donnees attendues pour la mise Ã  jour
 */
export interface UpdateColisageInput {
  id: number;                   // ID du colisage a  mettre a  jour (obligatoire)
  hsCode?: number;              // ID du HS Code (optionnel)
  descriptionColis?: string;     // Description du colis (optionnel)
  noCommande?: string;          // Numero de commande (optionnel)
  nomFournisseur?: string;      // Nom du fournisseur (optionnel)
  noFacture?: string;           // Numero de facture (optionnel)
  itemNo?: string;              // Numero d'article (optionnel)
  devise?: number;               // ID de la devise (optionnel)
  qteColisage?: number;         // Quantite (optionnel)
  prixUnitaireColis?: number; // Prix unitaire (optionnel)
  poidsBrut?: number;           // Poids brut (optionnel)
  poidsNet?: number;            // Poids net (optionnel)
  volume?: number;              // Volume (optionnel)
  paysOrigine?: number;         // ID du pays d'origine (optionnel)
  regimeDeclaration?: number;   // ID du regime de declaration (optionnel)
  regroupementClient?: string;  // Regroupement client (optionnel)
}


/**
 * ============================================================================
 * FONCTION : updateColisage (VERSION FUSIONNÃ‰E PRO)
 * ============================================================================
 * - Type (UpdateColisageInput)
 * - Securise (auth obligatoire)
 * - Tolerante au frontend (plusieurs variantes de champs)
 * - Prisma-safe
 * - Maintenable long terme
 * ============================================================================
 */
/**
 * Met a jour un colisage existant dans la base de donnÃ©es
 * Utilise la table TColisageDossiers pour la mise a jour
 * @param input - Donnees du colisage a mettre a jour
 * @returns Objet de success avec le colisage mis a jour
 */
export async function updateColisage(input: UpdateColisageInput) {
  try {

    // --------------------------------------------------------------------
    // 1. LA SECURITE : AUTHENTIFICATION
    // --------------------------------------------------------------------
    // Verification de l'authentification utilisateur
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    // Si pas de session, lance une erreur
    if (!session) {
      throw new Error("Missing User Session");
    }

    // --------------------------------------------------------------------
    // 2. LA VALIDATION DE ID
    // --------------------------------------------------------------------
    const { id, ...payload } = input;

    if (!Number.isInteger(id)) {
      throw new Error("ID colisage invalide");
    }

    // --------------------------------------------------------------------
    // 3. LA CONSTRUCTION DES DONNEES A METTRE A JOUR
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
    // 4. LA MISE A JOUR
    // --------------------------------------------------------------------
    // Met A  jour le colisage dans la table TColisageDossiers avec Prisma
    const colisage = await prisma.tColisageDossiers.update({
      where: { ID_Colisage_Dossier: id },                    // Filtre par ID du colisage
      data,                             // Applique les modifications
    });

    // --------------------------------------------------------------------
    // 5. INVALIDATION DU CACHE
    // --------------------------------------------------------------------
    revalidatePath(`/dossiers/${colisage.Dossier}`);
    revalidatePath(`/dossiers/${colisage.Dossier}/colisages`);
    revalidatePath(`/dossiers/${colisage.Dossier}/colisages/${id}`);

    // --------------------------------------------------------------------
    // 6. LE RETOUR
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
 * Supprime un colisage de la base de donnees
 * Utilise la table TColisageDossiers pour la suppression
 * @param id - ID du colisage A supprimer (string ou number)
 * @returns Objet de success
 */
export async function deleteColisage(id: string | number) {
  try {
    // --------------------------------------------------------------------
    // 1. AUTHENTIFICATION
    // --------------------------------------------------------------------
    // Verification de l'authentification utilisateur
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    // Si pas de session, lance une erreur
    if (!session) {
      throw new Error("Missing User Session");
    }

    // --------------------------------------------------------------------
    // 2. LA CONVERSION ET VALIDATION ID
    // --------------------------------------------------------------------
    // Convertit d'abord l'ID en nombre si c'est une chaine
    const colisageId = typeof id === 'string' ? parseInt(id) : id;
    
    // Ensuite valide que c'est un entier valide
    if (!Number.isInteger(colisageId) || colisageId <= 0) {
      throw new Error("ID colisage invalide");
    }

    // Recupere l'ID du dossier avant suppression pour invalider le cache
    const colisage = await prisma.tColisageDossiers.findUnique({
      where: { ID_Colisage_Dossier: colisageId },
      select: { Dossier: true },       // Selectionne uniquement l'ID du dossier
    });

    // Supprime le colisage de la table TColisageDossiers
    await prisma.tColisageDossiers.delete({
      where: { ID_Colisage_Dossier: colisageId },
    });

    // Invalide le cache de la page des colisages du dossier si trouve
    if (colisage) {
      revalidatePath(`/dossiers/${colisage.Dossier}/colisages`);
    }

    // Retourne le succes
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
 * Interface pour les lignes de colisage importÃ©es
 */
export interface ImportColisageRowNormalized {
  UploadKey: string;                 // cle unique ligne Excel
  HS_Code: number;                   // ID HS (0 = inconnu accepte)
  Devise: string;                    // ex: EUR
  Pays_Origine: string;              // ex: FR
  Regime_Declaration: string;        // texte ou code
  Regime_Code?: string;
  Description_Colis: string;         // peut etre vide
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
  // Proprietes ajoutees lors de la previsualisation
  status?: 'new' | 'existing';       // Statut du colisage
  existingId?: number;               // ID si colisage existant
  existingData?: {                   // Donnees existantes pour comparaison
    HS_Code: number | null;
    Description_Colis: string | null;
    Qte_Colis: number;
  } | null;
}

/**
 * ============================================================================
 * FONCTION : parseColisageExcelFile
 * ============================================================================
 * Role global : Parse un fichier Excel de colisages avec validation et detection
 * des valeurs manquantes. Extrait les donnees et verifie leur validite.
 * 
 * Parametres :
 * @param formData - FormData contenant le fichier Excel
 * @param dossierId - ID optionnel du dossier pour recuperer le client associe
 * 
 * Retour : Objet { success: boolean, data: { rows, total, missingValues, clientId }, error?: string }
 * ============================================================================
 */
export async function parseColisageExcelFile(formData: FormData, dossierId?: number) {
    try {
        // --------------------------------------------------------------------
        // 1. LA VERIFICATION DE L'AUTHENTIFICATION
        // --------------------------------------------------------------------
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            throw new Error("Missing User Session");
        }

        // --------------------------------------------------------------------
        // 2. LA RECUPERATION ET VALIDATION DU FICHIER
        // --------------------------------------------------------------------
        const file = formData.get("file") as File;  // Recupere le fichier depuis FormData
        if (!file) {
            return { success: false, error: "Aucun fichier fourni" };
        }

        // --------------------------------------------------------------------
        // 3. LA RECUPERATION DU CLIENT ASSOCIE
        // --------------------------------------------------------------------
        // Recuperer le client du dossier si dossierId est fourni, sinon utilise l'utilisateur
        let clientId = parseInt(session.user.id);
        if (dossierId) {
            const dossier = await prisma.tDossiers.findUnique({
                where: { ID_Dossier: dossierId },
                select: { Client: true }  // Selectionne uniquement l'ID du client
            });
            if (dossier) {
                clientId = dossier.Client;  // Utilise le client du dossier
            }
        }

        // --------------------------------------------------------------------
        // 4. LE PARSING DU FICHIER EXCEL
        // --------------------------------------------------------------------
        const buffer = await file.arrayBuffer();  // Convertit le fichier en buffer binaire
        const XLSX = await import("xlsx");       // Import dynamique de la librairie XLSX
        const workbook = XLSX.read(buffer, { type: "array" }); // Lit le fichier Excel
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]; // Prend la premiere feuille

        if (!worksheet) {
            return { success: false, error: "Aucune feuille trouvÃ©e dans le fichier" };
        }

        const rows = XLSX.utils.sheet_to_json(worksheet) as any[]; // Convertit la feuille en objets JSON

        if (rows.length === 0) {
            return { success: false, error: "Le fichier est vide" };
        }

        // --------------------------------------------------------------------
        // 5. LE MAPPING ET NORMALISATION DES DONNEES
        // --------------------------------------------------------------------
        // Transforme chaque ligne Excel en format standardise pour l'application
        const parsedRows = rows.map((row, index) => {
          // Gérer le HS Code : 
          // - Si vide/undefined/null dans Excel = null (pas de HS Code)
          // - Si 0 dans Excel = 0 (HS Code ID 0 qui correspond au code "0")
          // - Sinon = la valeur
          const hsCodeValue = row["HS_Code"] ?? row["HS Code"] ?? row["Code HS"];
          let hscode = null;
          if (hsCodeValue !== undefined && hsCodeValue !== null && hsCodeValue !== "") {
            hscode = hsCodeValue; // Peut être 0 ou une autre valeur
          }
          
          return {
            _rowIndex: index + 2,  // Index de ligne (commence A 2 pour correspondre A Excel)
            // Accepter UploadKey ET Row_Key pour compatibilite avec les templates differents.
            uploadKey: row["Upload_Key"] || row["Upload Key"] || row["UploadKey"] || row["Row_Key"] || row["Row Key"] || "",
            hscode: hscode,
            description: String(row["Descr"] ?? row["Description"] ?? row["Description Colis"] ?? ""), // Description
            numeroCommande: String(row["Command_No"] ?? row["No Commande"] ?? row["Numéro Commande"] ?? ""), // N° commande
            nomFournisseur: String(row["Supplier_Name"] ?? row["Nom Fournisseur"] ?? row["Fournisseur"] ?? ""), // Fournisseur
            numeroFacture: String(row["Invoice_No"] ?? row["No Facture"] ?? row["Numéro Facture"] ?? ""), // N° facture
            itemNo: String(row["Item_No"] ?? row["Item No"] ?? row["Numéro Ligne"] ?? ""), // Numero d'article
            devise: (row["Currency"] ?? row["Devise"] ?? row["Code Devise"] ?? ""), // Code devise
            quantite: parseFloat(row["Qty"] ?? row["Quantité"] ?? row["Qte Colis"]) || 1, // Quantite
            prixUnitaireColis: parseFloat(row["Unit_Prize"] ?? row["Prix Unitaire"] ?? row["Prix Unitaire Colisage"]) || 0, // Prix unitaire
            poidsBrut: parseFloat(row["Gross_Weight"] ?? row["Poids Brut"]) || 0, // Poids brut
            poidsNet: parseFloat(row["Net_Weight"] ?? row["Poids Net"]) || 0, // Poids net
            volume: parseFloat(row["Volume"]) || 0, // Volume
            paysOrigine: (row["Country_Origin"] ?? row["Pays Origine"] ?? row["Code Pays"]?? "").toString().trim(), // Pays d'origine
            // Regime code optionnel (peut être vide, mais jamais null)
            regimeCode: row["Regime_Code"] ?? row["Regime Code"] ?? row["Code Regime"] ?? "",
            regimeRatio: (() => {
              const value = row["Regime_Ratio"] ?? row["Régime Ratio"] ?? row["Ratio Régime"];
              if (value === undefined || value === null || value === '') return 0;
              const parsed = parseFloat(value);
              return isNaN(parsed) ? 0 : parsed;
            })(),
            regroupementClient: row["Customer_Grouping"] ?? row["Regroupement Client"] ?? "", // Regroupement
          };
        });

        // --------------------------------------------------------------------
        // 6. LA VALIDATION ET DETECTION DES VALEURS MANQUANTES
        // --------------------------------------------------------------------
        // Valide toutes les données contre la base de données et détecte ce qui manque
        const missingValues = await validateAndDetectMissing(parsedRows, clientId, dossierId);

        // --------------------------------------------------------------------
        // 7. RETOUR DES RESULTATS
        // --------------------------------------------------------------------
        return {
            success: true,
            data: {
                rows: parsedRows,                    // Lignes parsÃ©es et normalisÃ©es
                total: parsedRows.length,            // Nombre total de lignes
                missingValues,                       // Devises, Pays, HS Codes manquants
                clientId,                           // ID du client pour crÃ©er les associations
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
 * Role global : Valide les donnees et detecte les valeurs manquantes dans la base de donnees.
 * 
 * Parametres :
 * @param rows - Lignes parsees et normalisees
 * @param clientId - ID du client pour creer les associations
 * 
 * Retour : Objet { devises, pays, hscodes, regimes, unassociatedRegimes }
 * ============================================================================
 */
async function validateAndDetectMissing(rows: any[], clientId: number, dossierId?: number) {
    const missingDevises: string[] = [];
    const missingPays: string[] = [];
    const missingHscodes: string[] = [];
    const missingRegimes: Array<{ code: string; ratio: number }> = [];
    const unassociatedRegimes: Array<{ code: string; ratio: number; libelle: string }> = [];

    // Extraire les valeurs distinctes
    const distinctDevises = [...new Set(rows.map(r => r.devise).filter(Boolean))];
    const distinctPays = [...new Set(rows.map(r => r.paysOrigine).filter(Boolean))];
    // Convertir les HS codes en strings pour la comparaison, mapper "0" vers "-"
    const distinctHscodes = [...new Set(rows.map(r => r.hscode).filter(h => h !== null && h !== undefined).map(h => String(h)))];

    // Verifier les devises
    if (distinctDevises.length > 0) {
        const foundDevises = await prisma.tDevises.findMany({
            where: { 
              Code_Devise: { in: distinctDevises }, 
              Devise_Inactive: false //  Seulement les devises actives
            },
           
            select: {Code_Devise: true}
        });
        const foundDevisesCodes = new Set(foundDevises.map(d => d.Code_Devise));
        missingDevises.push(...distinctDevises.filter(d => !foundDevisesCodes.has(d)));
    }

    // Verifier les pays
    if (distinctPays.length > 0) {
        const foundPays = await prisma.tPays.findMany({
            where: { Code_Pays: { in: distinctPays } },
            select: { Code_Pays: true }
        });
        const foundPaysCodes = new Set(foundPays.map(p => p.Code_Pays));
        const missingPaysFound = distinctPays.filter(p => !foundPaysCodes.has(p));
        missingPays.push(...missingPaysFound);
    }

    // Verifier les HS Codes
    if (distinctHscodes.length > 0) {
        console.log('[validateAndDetectMissing] Verification HS Codes:', distinctHscodes);
        
        // Récupérer l'entité du dossier si dossierId est fourni
        let targetEntiteId = 0; // Par défaut entité 0

         if (dossierId) {
            const dossier = await prisma.tDossiers.findUnique({
                where: { ID_Dossier: dossierId },
                include: {
                    TBranches: {
                        select: { Entite: true }
                    }
                }
            });
            
            if (dossier?.TBranches?.Entite) {
                targetEntiteId = dossier.TBranches.Entite;
               
            } else {
                console.log(`[validateAndDetectMissing] Dossier ${dossierId} non trouvé ou sans entité, utilisation entité 0`);
            }
        }

        // Chercher par code HS dans l'entité appropriée ET aussi vérifier l'ID 0 explicitement
        const foundHscodes = await prisma.tHSCodes.findMany({
            where: { 
                OR: [
                    { 
                      HS_Code: { in: distinctHscodes },
                      Entite: targetEntiteId 
                    },
                    { ID_HS_Code: 0 } // Inclure explicitement l'ID 0
                ]
            },
            select: { ID_HS_Code: true, HS_Code: true, Entite: true }
        });
        
        console.log('[validateAndDetectMissing] HS Codes trouves:', foundHscodes);
        
        // Créer un Set avec les codes trouvés dans la bonne entité
        const foundHscodesCodes = new Set(
          foundHscodes
            .filter(h => h.Entite === targetEntiteId || h.ID_HS_Code === 0)
            .map(h => String(h.HS_Code))
        );
        const missingHscodesFound = distinctHscodes.filter(h => !foundHscodesCodes.has(h));
        
        console.log('[validateAndDetectMissing] HS Codes trouves:', Array.from(foundHscodesCodes));
        console.log('[validateAndDetectMissing] HS Codes manquants:', missingHscodesFound);
        
        missingHscodes.push(...missingHscodesFound);
    }

    // Verifier les regimes (seulement si fournis)
    const rowsWithRegime = rows.filter((r) => r.regimeRatio !== null && r.regimeRatio !== undefined);
    if (rowsWithRegime.length > 0) {
        // IMPORTANT:
        // - on normalise a 3 decimales pour correspondre a DECIMAL(24,3) en base,
        // - cela evite les faux "non associes" pour des valeurs Excel comme 0.4851 vs base 0.485.
        const distinctRegimes = [
            ...new Set(
                rowsWithRegime.map((r) => {
                    const raw = typeof r.regimeRatio === "string" ? parseFloat(r.regimeRatio) : r.regimeRatio;
                    return normalizeRegimeRatio(raw).toFixed(3);
                })
            ),
        ];

        console.log("[validateAndDetectMissing] Client ID:", clientId);
        console.log("[validateAndDetectMissing] Regimes distincts a verifier:", distinctRegimes);

        // Recuperer les associations client-regime pour ce client.
        // On ne filtre pas sur Regime_Douanier ici pour eviter de marquer a tort
        // un regime deja associe sous un autre code douanier.
        const clientRegimeAssociations = await prisma.tRegimesClients.findMany({
            where: { Client: clientId },
            include: {
                TRegimesDeclarations: {
                    select: {
                        ID_Regime_Declaration: true,
                        Libelle_Regime_Declaration: true,
                        Taux_Regime: true,
                        Regime_Douanier: true,
                    },
                },
            },
        });

        console.log("[validateAndDetectMissing] Associations client trouves:", clientRegimeAssociations);

        const availableRegimeTaux = new Set(
            clientRegimeAssociations
                .filter((assoc) => assoc.TRegimesDeclarations)
                .map((assoc) =>
                    normalizeRegimeRatio(parseFloat(assoc.TRegimesDeclarations!.Taux_Regime.toString())).toFixed(3)
                )
        );

        console.log("[validateAndDetectMissing] Regimes trouves et associes:", Array.from(availableRegimeTaux));

        for (const row of rowsWithRegime) {
            const rawRatio = typeof row.regimeRatio === "string" ? parseFloat(row.regimeRatio) : row.regimeRatio;
            const normalizedRatio = normalizeRegimeRatio(rawRatio);
            const decimalKey = normalizedRatio.toFixed(3);

            console.log(
                `[validateAndDetectMissing] Verification regime brut=${rawRatio}, normalise=${normalizedRatio}, key=${decimalKey}`
            );

            if (!availableRegimeTaux.has(decimalKey)) {
                console.log(
                    `[validateAndDetectMissing] Regime ${normalizedRatio} non trouve dans les associations client`
                );

                const libelle = buildRegimeLibelle(normalizedRatio);

                console.log(`[validateAndDetectMissing] Libelle genere: "${libelle}"`);

                // Recherche regime:
                // - par libelle exact,
                // - par libelle prefixe (historique),
                // - par taux normalise (3 decimales).
                const regimeExists = await prisma.tRegimesDeclarations.findFirst({
                    where: {
                        OR: [
                            { Libelle_Regime_Declaration: libelle },
                            { Libelle_Regime_Declaration: `${row.regimeCode} ${libelle}` },
                            { Taux_Regime: normalizedRatio },
                        ],
                    },
                });

                console.log("[validateAndDetectMissing] Regime trouve en BD:", regimeExists);

                if (regimeExists) {
                    const alreadyAdded = unassociatedRegimes.find(
                        (r) => normalizeRegimeRatio(r.ratio) === normalizedRatio
                    );
                    if (!alreadyAdded) {
                        unassociatedRegimes.push({
                            code: row.regimeCode,
                            ratio: rawRatio,
                            libelle: regimeExists.Libelle_Regime_Declaration,
                        });
                        console.log(
                            `[validateAndDetectMissing] Regime non associe ajoute: brut=${rawRatio}, normalise=${normalizedRatio}`
                        );
                    }
                } else {
                    const alreadyAdded = missingRegimes.find(
                        (m) => normalizeRegimeRatio(m.ratio) === normalizedRatio
                    );
                    if (!alreadyAdded) {
                        missingRegimes.push({
                            code: row.regimeCode,
                            ratio: rawRatio,
                        });
                        console.log(
                            `[validateAndDetectMissing] Regime manquant ajoute: brut=${rawRatio}, normalise=${normalizedRatio}`
                        );
                    }
                }
            } else {
                console.log(
                    `[validateAndDetectMissing] Regime ${normalizedRatio} OK (trouve dans les associations client)`
                );
            }
        }
    }

    const result = {
        devises: missingDevises,
        pays: missingPays,
        hscodes: missingHscodes,
        regimes: missingRegimes,
        unassociatedRegimes, // Regimes existants mais non associes au client
    };

    console.log('[validateAndDetectMissing] Resultat final:', result);

    return result;
}

/**
 * Verifie les rowKeys existants dans un dossier
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
        return { success: false, error: error instanceof Error ? error.message : "Erreur lors de la vÃ©rification" };
    }
}

/**
 * Verifie si un colisage existe deja  dans la base de donnees
 * Utilise les colonnes de l'index unique: (No_Facture, Nom_Fournisseur, Item_No, No_Commande)
 */
export async function checkColisageExists(dossierId: number, item: any) {
  try {
    // Verifier sur les colonnes de l'index unique + Dossier
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
      console.log(`Colisage existant trouve: Facture=${item.No_Facture}, Fournisseur=${item.Nom_Fournisseur}, Article=${item.No_Article}, Commande=${item.No_Commande}`);
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
    // ETAPE 1 : AUTHENTIFICATION
    // ========================================================================
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("Missing User Session");
    console.log("[previewColisagesImport] Session utilisateur validee");

    // ========================================================================
    // ETAPE 2 : LECTURE DU FICHIER EXCEL
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
    console.log(`[previewColisagesImport] ${rows.length} lignes trouvees dans le fichier Excel`);

    // ========================================================================
    // ETAPE 3 : INITIALISATION DES VARIABLES
    // ========================================================================
    const previewData: ImportColisageRowNormalized[] = [];
    const errors: string[] = [];
    const missingHsCodes = new Set<string>();  // HS Codes non trouves dans la BD

    // Fonction utilitaire : recupere une valeur texte ou retourne la valeur par defaut
    const getValue = (value: any, defaultValue: any = null): string | null => {
      if (value === null || value === undefined || value === "") return defaultValue;
      return String(value).trim();
    };

    // Fonction utilitaire : recupere une valeur numerique ou retourne 0
    const getNumericValue = (value: any, defaultValue: number = 0): number => {
      if (value === null || value === undefined || value === "") return defaultValue;
      const num = Number(String(value).trim());
      return isNaN(num) ? defaultValue : num;
    };

    // ========================================================================
    // ETAPE 4 : TRAITEMENT DE CHAQUE LIGNE DU FICHIER EXCEL
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
        // 4.2 : RECHERCHE DU HS CODE DANS LA BASE DE DONNEES
        // --------------------------------------------------------------------
        // ROLE IMPORTANTE :
        // - HS_Code vide ou "0" dans Excel a hsCodeId = 0 (valeur speciale acceptee)
        // - HS_Code valide dans Excel -> chercher l'ID correspondant dans THSCodes
        let hsCodeId: number = 0;
        
        // Si le HS_Code Excel est vide, null, ou "0" -> on garde hsCodeId = 0
        if (!hsCodeStr || hsCodeStr === "0" || hsCodeStr === "") {
          console.log(`[Ligne ${i + 2}] HS_Code VIDE ou ZERO a hsCodeId = 0 (acceptÃ©)`);
        } else {
          // Le HS_Code Excel a une valeur a chercher dans la BD
          const hsCodeRecord = await prisma.tHSCodes.findFirst({
            where: { HS_Code: hsCodeStr },
            select: { ID_HS_Code: true }
          });
          
          if (hsCodeRecord) {
            // HS Code trouve dans la BD a utiliser son ID
            hsCodeId = hsCodeRecord.ID_HS_Code;
            console.log(`[Ligne ${i + 2}] HS_Code "${hsCodeStr}" TROUVE A ID = ${hsCodeId}`);
          } else {
            // HS Code NON trouve dans la BD a garder hsCodeId = 0 et noter le manquant
            missingHsCodes.add(hsCodeStr);
            console.log(`[Ligne ${i + 2}] HS_Code "${hsCodeStr}" NON TROUVE dans BD avec hsCodeId = 0`);
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

        // PLUS DE VALIDATION BLOQUANTE - On accepte tout !
        // Les valeurs vides seront générées avec des valeurs par défaut
        // Si Devise vide → on met "EUR" par défaut
        if (!rowData.Devise) {
          rowData.Devise = "EUR";
          console.log(`[Ligne ${i + 2}] Devise vide → dÃ©faut "EUR"`);
        }
        // Si Quantite invalide → on met 1 par defaut
        if (!rowData.Qte_Colis || rowData.Qte_Colis <= 0) {
          rowData.Qte_Colis = 1;
          console.log(`[Ligne ${i + 2}] Quantite invalide → dÃ©faut 1`);
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
        console.error(`[Ligne ${i + 2}] Erreur inattendue:`, error.message);
        errors.push(`Ligne ${i + 2}: ${error.message}`);
      }
    }

    // ========================================================================
    // ETAPE 5 : LOG RECAPITULATIF ET RETOUR DES RESULTATS
    // ========================================================================
    const statsNew = previewData.filter((p) => p.status === "new").length;
    const statsExisting = previewData.filter((p) => p.status === "existing").length;
    
    console.log(`\n ============== RECAPITULATIF PREVISUALISATION ==============`);
    console.log(` Total lignes Excel: ${rows.length}`);
    console.log(` Lignes valides: ${previewData.length}`);
    console.log(`   - Nouveaux colisages: ${statsNew}`);
    console.log(`   - Colisages existants: ${statsExisting}`);
    console.log(` Lignes en erreur: ${errors.length}`);
    if (missingHsCodes.size > 0) {
      console.log(`HS Codes non trouvés dans BD: ${Array.from(missingHsCodes).join(", ")}`);
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
    console.error("[previewColisagesImport] Erreur globale:", error);
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
 * Role : Importe les colisages sélectionnes dans la base de données via
 * la procédure stockée pSP_AjouterColisageDossier.
 * 
 * FLUX :
 * 1. Vérifie l'authentification utilisateur
 * 2. Vérifie que le dossier existe
 * 3. Pour chaque ligne :
 *    a. Convertit HS_Code ID -> Code texte (ex: 123 ou "8204110000")
 *    b. Convertit Devise (texte ou ID) -> Code texte (ex: "EUR")
 *    c. Convertit Pays (texte ou ID) -> Code texte (ex: "FR")
 *    d. Appelle la procédure stockée SQL
 * 4. Gère les erreurs (doublons, données manquantes)
 * 
 * PARAMETRES :
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
  // ETAPE 1 : VERIFICATION DE L'AUTHENTIFICATION
  // ========================================================================
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Missing User Session");
  }

  // ========================================================================
  // ETAPE 2 : VERIFICATION QUE LE DOSSIER EXISTE
  // ========================================================================
  const dossierExists = await prisma.tDossiers.findUnique({
    where: { ID_Dossier: dossierId },
    select: { ID_Dossier: true, Client: true }
  });

  if (!dossierExists) {
    return {
      success: false,
      error: `Le dossier ID ${dossierId} n'existe pas`,
      data: { created: 0, updated: 0, total: rows.length, errors: [{ row: 0, error: `Dossier ${dossierId} introuvable` }] },
    };
  }

  // Précharger les ratios de régimes déjà associés au client du dossier.
  // Pourquoi: la procédure SQL lève une erreur 2787 (format %) quand le régime
  // n'est pas associé; on préfère filtrer côté app avec un message clair.
  const clientRegimeAssociations = await prisma.tRegimesClients.findMany({
    where: { Client: dossierExists.Client },
    include: {
      TRegimesDeclarations: {
        select: {
          Taux_Regime: true
        }
      }
    }
  });

  const availableRegimeRatiosForClient = new Set(
    clientRegimeAssociations
      .filter((assoc) => assoc.TRegimesDeclarations)
      .map((assoc) =>
        normalizeRegimeRatio(parseFloat(assoc.TRegimesDeclarations!.Taux_Regime.toString())).toFixed(3)
      )
  );

  // ========================================================================
  // ETAPE 3 : INITIALISATION DES COMPTEURS
  // ========================================================================
  const createdColisages: any[] = [];
  const updatedColisages: any[] = [];
  const skippedColisages: any[] = [];  // Doublons sautés
  const errors: Array<{ row: number; uploadKey?: string; error: string }> = [];    

  console.log(`\n ============================================================`);
  console.log(`[importSelectedColisages] DEBUT IMPORT`);
  console.log(`Dossier ID: ${dossierId}`);
  console.log(`Nombre de lignes: ${rows.length}`);
  console.log(`Mode mise A jour: ${updateExisting ? 'OUI' : 'NON'}`);
  console.log(` ============================================================\n`);
  
  // DEBUG : Afficher la structure de la première ligne pour comprendre les noms de propriétés
  if (rows.length > 0) {
    console.log(`[DEBUG] Structure de la première ligne recue:`);
    console.log(JSON.stringify(rows[0], null, 2));
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          // Normaliser la ligne:
          // - le frontend envoie du camelCase (uploadKey, devise, paysOrigine, ...),
          // - d'autres flux historiques envoient des noms SQL (Upload_Key, Devise, Pays_Origine, ...).
          // Cette normalisation évite les "undefined" dans la procédure stockée.
          const uploadKey = String(
            row.uploadKey ??
            row.UploadKey ??
            row.Upload_Key ??
            row.Row_Key ??
            row["Row Key"] ??
            `ROW_${i + 1}`
          ).trim() || `ROW_${i + 1}`;

          const hsCode = String(
            row.hscode ??
            row.HS_Code ??
            0
          );

          const description = String(
            row.description ??
            row.Description_Colis ??
            row.Descr ??
            ""
          );

          const noCommande = String(
            row.numeroCommande ??
            row.No_Commande ??
            row.Command_No ??
            ""
          );

          const nomFournisseur = String(
            row.nomFournisseur ??
            row.Nom_Fournisseur ??
            row.Supplier_Name ??
            ""
          );

          const noFacture = String(
            row.numeroFacture ??
            row.No_Facture ??
            row.Invoice_No ??
            ""
          );

          const itemNo = String(
            row.itemNo ??
            row.No_Article ??
            row.Item_No ??
            "1"
          );

          const deviseCode = String(
            row.devise ??
            row.Devise ??
            row.Currency ??
            ""
          ).trim();

          const qty = Number(
            row.quantite ??
            row.Qte_Colis ??
            row.Qty ??
            1
          ) || 1;

          const unitPrize = Number(
            row.prixUnitaireColis ??
            row.Prix_Unitaire_Colis ??
            row.Unit_Prize ??
            0
          ) || 0;

          const grossWeight = Number(
            row.poidsBrut ??
            row.Poids_Brut ??
            row.Gross_Weight ??
            0
          ) || 0;

          const netWeight = Number(
            row.poidsNet ??
            row.Poids_Net ??
            row.Net_Weight ??
            0
          ) || 0;

          const volume = Number(
            row.volume ??
            row.Volume ??
            0
          ) || 0;

          const countryOrigin = String(
            row.paysOrigine ??
            row.Pays_Origine ??
            row.Country_Origin ??
            ""
          ).trim();

          const regroupementClient = String(
            row.regroupementClient ??
            row.Regroupement_Client ??
            row.Customer_Grouping ??
            ""
          );

          const regimeCode = String(
            row.regimeCode ??
            row.Regime_Code ??
            ""
          );
          
          try {
            console.log(`\n========== LIGNE ${i + 1}/${rows.length} ==========`);
             
            console.log(` Données brutes reçues:`, {
              HS_Code: hsCode,
              Devise: deviseCode,
              Pays_Origine: countryOrigin,
              Regime_Ratio: row.regimeRatio ?? row.Regime_Ratio,
              Regime_Code: regimeCode,
              Description: description.substring(0, 30),
              UploadKey: uploadKey,
              status: row.status,  // "new" ou "existing"
              existingId: row.existingId,  // ID si existant
            });

            // Préparer ratio régime en acceptant les deux formats de clés.
            const rawRegimeRatio = row.regimeRatio ?? row.Regime_Ratio;
            const parsedRegimeRatio = rawRegimeRatio !== undefined && rawRegimeRatio !== null && !isNaN(rawRegimeRatio)
              ? (typeof rawRegimeRatio === 'string' ? parseFloat(rawRegimeRatio) : rawRegimeRatio)
              : 0;
            // IMPORTANT:
            // la base stocke Taux Regime en DECIMAL(24,3), on normalise donc ici
            // pour éviter les faux "NOT EXIST FOR THIS CUSTOMER" sur 0.4851 vs 0.485.
            const regimeRatio = normalizeRegimeRatio(parsedRegimeRatio);

            // Pré-vérification applicative pour éviter l'erreur SQL 2787 issue
            // du message FORMAT('%') dans la procédure quand le régime n'est pas associé.
            const regimeRatioKey = normalizeRegimeRatio(regimeRatio).toFixed(3);
            if (!availableRegimeRatiosForClient.has(regimeRatioKey)) {
              const userFriendlyError = `Régime "${regimeCode || "N/A"}" (${regimeRatio}) non associé au client du dossier`;
              errors.push({ row: i + 1, uploadKey: uploadKey, error: userFriendlyError });
              console.log(`[Ligne ${i + 1}] Erreur ajoutée (pré-vérification): ${userFriendlyError}`);
              continue;
            }

            // ========================================================================
            // CONSTRUCTION DE LA REQUETE SQL
            // ========================================================================
            // La procédure stockée pSP_AjouterColisageDossier fait :
            // - INSERT si le colisage n'existe pas (basé sur UploadKey)
            // - UPDATE si le colisage existe déjà
            const query = `
              EXEC [dbo].[pSP_AjouterColisageDossier]
                @Id_Dossier = ${dossierId},
                @Upload_Key = N'${uploadKey.replace(/'/g, "''")}',  -- Clé unique pour détecter les doublons
                @HS_Code = N'${hsCode.replace(/'/g, "''")}',
                @Descr = N'${description.replace(/'/g, "''")}',
                @Command_No = N'${noCommande.replace(/'/g, "''")}',
                @Supplier_Name = N'${nomFournisseur.replace(/'/g, "''")}',
                @Invoice_No = N'${noFacture.replace(/'/g, "''")}',
                @Item_No = N'${itemNo.replace(/'/g, "''")}',
                @Currency = N'${deviseCode.replace(/'/g, "''")}',
                @Qty = ${qty},
                @Unit_Prize = ${unitPrize},
                @Gross_Weight = ${grossWeight},
                @Net_Weight = ${netWeight},
                @Volume = ${volume},
                @Country_Origin = N'${countryOrigin.replace(/'/g, "''")}',
                @Regime_Code = N'${regimeCode.replace(/'/g, "''")}',
                @Regime_Ratio = ${regimeRatio},
                @Customer_Grouping = N'${regroupementClient.replace(/'/g, "''")}',
                @Session = ${parseInt(session.user.id)}
            `;

            // ========================================================================
            // EXECUTION DE LA PROCEDURE STOCKEE
            // ========================================================================
            console.log(`Exécution procédure stockée avec:`);
            console.log(`   - @HS_Code = "${hsCode}"`);
            console.log(`   - @Currency = "${deviseCode}"`);
            console.log(`   - @Country_Origin = "${countryOrigin}"`);
            console.log(`   - @Regime_Code = "${regimeCode}", @Regime_Ratio = ${regimeRatio}`);
            
            const colisage = await tx.$executeRawUnsafe(query);
            convertDecimalsToNumbers(colisage);
            
            // Déterminer si c'était une création ou une mise à jour
            if (row.status === "existing" && row.existingId) {
              console.log(`LIGNE ${i + 1} MISE A JOUR (ID: ${row.existingId})`);
              updatedColisages.push({ uploadKey: uploadKey, description: description, processed: true, updated: true });
            } else {
              console.log(`LIGNE ${i + 1} CREE AVEC SUCCES`);
              createdColisages.push({ uploadKey: uploadKey, description: description, processed: true });
            }

          } catch (error: any) {
            // ========================================================================
            // GESTION DES ERREURS
            // ========================================================================
            const errorMessage = error.message || "Erreur inconnue";
            
            console.log(`[Ligne ${i + 1}] ERREUR:`, errorMessage);
            
            // Analyser le type d'erreur SQL Server
            let userFriendlyError = errorMessage;
            
            if (errorMessage.includes("HS CODE") && errorMessage.includes("NOT EXIST")) {
              userFriendlyError = `HS Code "${hsCode}" non trouvée pour l'entité du dossier`;
              console.log(`  Le HS Code existe peut-etre mais pas pour cette entite`);
            } else if (errorMessage.includes("CURRENCY") && errorMessage.includes("NOT EXIST")) {
              userFriendlyError = `Devise "${deviseCode || "vide"}" non trouvée dans la base`;
            } else if (errorMessage.includes("COUNTRY CODE") && errorMessage.includes("NOT EXIST")) {
              userFriendlyError = `Pays "${countryOrigin || "vide"}" non trouvée dans la base`;
            } else if (errorMessage.includes("REGIME") && errorMessage.includes("NOT EXIST")) {
              userFriendlyError = `Régime "${regimeCode}" (${regimeRatio}) non trouvé pour ce client`;
            } else if (
              errorMessage.includes("Spécification de format non valide") &&
              errorMessage.includes("NOT EXIST FOR THIS CUSTOMER")
            ) {
              // Fallback défensif: même si la pré-vérification passe à côté d'un cas,
              // on convertit l'erreur SQL 2787 en message métier compréhensible.
              userFriendlyError = `Régime "${regimeCode || "N/A"}" (${regimeRatio}) non associé au client du dossier`;
            } else if (errorMessage.includes("FILE ID") && errorMessage.includes("NOT EXIST")) {
              userFriendlyError = `Dossier ${dossierId} non trouvé`;
            }
            else if(errorMessage.includes("duplicate key") || errorMessage.includes("UN_TColisageDossiers")){
              // Erreur de clé dupliquée sur l'index unique principal
              userFriendlyError = `Colisage déjà existant avec la même combinaison : N° Facture "${noFacture}", Fournisseur "${nomFournisseur}", Item N° "${itemNo}", N° Commande "${noCommande}"`;
            }
            else if (errorMessage.includes("UQ_TColisageDossiers$UploadKey")) {
              userFriendlyError = `Upload Key "${uploadKey}" déjà utilisé dans ce dossier`;
            }

            // Ajouter l'erreur à la liste
            errors.push({ row: i + 1, uploadKey: uploadKey, error: userFriendlyError });
            console.log(` Erreur ajoutée: ${userFriendlyError}`);
          }
        }
      },
      { maxWait: 60000, timeout: 120000 },
    );

    // ========================================================================
    // RECAPITULATIF FINAL
    // ========================================================================
    console.log(`\n ============================================================`);
    console.log(`[importSelectedColisages] IMPORT TERMINE`);
    console.log(`Crées: ${createdColisages.length}`);
    console.log(`Mis à jour: ${updatedColisages.length}`);
    console.log(`Erreurs: ${errors.length}`);
    if (errors.length > 0) {
      console.log(`Détail des erreurs:`);
      errors.forEach(e => console.log(`   - Ligne ${e.row}: ${e.error}`));
    }
    console.log(` ============================================================\n`);
    
    // Invalider le cache pour rafraichir les données
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
    console.error("[importSelectedColisages] Erreur transaction:", transactionError);
    return {
      success: false,
      error: `Importation annulée : ${transactionError.message}`,
      data: { created: 0, updated: 0, total: rows.length, errors: errors.length > 0 ? errors : [{ row: 0, error: transactionError.message }] },
    };
  }
}

/**
 * Crée les HS Codes manquants pour l'entité 0 (configuration par défaut)
 */
export async function createMissingHSCodes(hscodes: string[]) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            throw new Error("Missing User Session");
        }

        // Utiliser l'entité 0 par défaut (configuration système)
        const targetEntiteId = 0;
        const sessionId = Number(session.user.id);
        if (!Number.isInteger(sessionId)) {
            throw new Error("Session utilisateur invalide");
        }

        // Normaliser et dédupliquer les HS Codes reçus (évite les doubles inserts
        // si le frontend envoie plusieurs fois la même valeur avec espaces).
        const normalizedHSCodes = Array.from(
            new Set(
                (hscodes ?? [])
                    .map((code) => String(code ?? "").trim())
                    .filter((code) => code.length > 0)
            )
        );

        const created: Array<{
            ID_HS_Code: number;
            HS_Code: string;
            Libelle_HS_Code: string;
            Entite: number;
            Session: number;
            Date_Creation: Date;
        }> = [];
        const skipped: Array<{
            hscode: string;
            entite: number;
            reason: string;
        }> = [];
        
        for (const hscode of normalizedHSCodes) {
            // Vérifier si le HS Code existe déjà pour l'entité 0
            const existing = await prisma.tHSCodes.findFirst({
                where: { 
                    HS_Code: hscode,
                    Entite: targetEntiteId
                }
            });

            if (existing) {
                console.log(`HS Code "${hscode}" existe déjà pour l'entité ${targetEntiteId}`);
                skipped.push({ 
                    hscode, 
                    entite: targetEntiteId,
                    reason: `Existe déjà pour l'entité ${targetEntiteId}`
                });
                continue;
            }

            // Vérifier si le HS Code existe pour d'autres entités
            const existingInOtherEntities = await prisma.tHSCodes.findMany({
                where: { HS_Code: hscode },
                select: { ID_HS_Code: true, HS_Code: true, Entite: true, Libelle_HS_Code: true }
            });

            let libelle = `HS Code ${hscode}`;
            if (existingInOtherEntities.length > 0) {
                // Utiliser le libellé d'un HS Code existant
                libelle = existingInOtherEntities[0].Libelle_HS_Code || libelle;
                console.log(`HS Code "${hscode}" existe dans d'autres entités, création pour entité ${targetEntiteId}`);
            }

            // Insertion SQL paramétrée:
            // - remplace prisma.tHSCodes.create() (non exposé par ton client généré),
            // - reste compatible SQL Server avec OUTPUT ... INTO.
            const now = new Date();
            const insertedRows = await prisma.$queryRaw<Array<{
                ID_HS_Code: number;
                HS_Code: string;
                Libelle_HS_Code: string;
                Entite: number;
                Session: number;
                Date_Creation: Date;
            }>>`
                DECLARE @Inserted TABLE (
                    ID_HS_Code INT,
                    HS_Code NVARCHAR(50),
                    Libelle_HS_Code NVARCHAR(200),
                    Entite INT,
                    Session INT,
                    Date_Creation DATETIME
                );

                INSERT INTO dbo.THSCodes ([HS Code], [Libelle HS Code], [Entite], [Session], [Date Creation])
                OUTPUT
                    INSERTED.[ID HS Code],
                    INSERTED.[HS Code],
                    INSERTED.[Libelle HS Code],
                    INSERTED.[Entite],
                    INSERTED.[Session],
                    INSERTED.[Date Creation]
                INTO @Inserted (ID_HS_Code, HS_Code, Libelle_HS_Code, Entite, Session, Date_Creation)
                VALUES (${hscode}, ${libelle}, ${targetEntiteId}, ${sessionId}, ${now});

                SELECT
                    ID_HS_Code,
                    HS_Code,
                    Libelle_HS_Code,
                    Entite,
                    Session,
                    Date_Creation
                FROM @Inserted;
            `;

            const inserted = insertedRows[0];
            if (!inserted) {
                throw new Error(`Echec de création du HS Code "${hscode}"`);
            }

            created.push(inserted);
            console.log(`HS Code "${hscode}" créé pour l'entité ${targetEntiteId}`);
        }

        return { 
            success: true, 
            data: created,
            skipped: skipped.length > 0 ? skipped : undefined
        };
    } catch (error) {
        console.error("createMissingHSCodes error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Erreur" };
    }
}

/**
 * Obtenir les statistiques des colisages d'un dossier
 */
/**
 * Actions simples pour récupérer les données de référence
 */

// Actions compatibles avec le formulaire du module colisage (format: id, code, libelle)
export async function getAllHscodesForSelect() {
    try {
      const hscodes = await prisma.vHSCodes.findMany({
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
       const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            throw new Error("Missing User Session");
        }

      const regimesDeclarations = await prisma.vRegimesDeclarations.findMany({
        select: {
          ID_Regime_Declaration: true,
          Libelle_Regime_Declaration: true
        },
        distinct: ["ID_Regime_Declaration"],
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
          where: { HS_Code: serializedColisage.HS_Code },
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
