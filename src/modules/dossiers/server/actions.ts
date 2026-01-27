"use server";

// ============================================================================
// MODULE ACTIONS.TS - DOSSIERS DOUANIERS
// ============================================================================
// Rôle global : Fichier principal contenant toutes les actions serveur pour la
// gestion des dossiers de douane. Gère les opérations CRUD, la pagination,
// les filtres et la récupération des données de référence.
//
// Architecture :
// - Utilise VDossiers (vue) pour les lectures avec jointures
// - Utilise TDossiers (table) pour les écritures
// - Inclut l'authentification utilisateur pour sécuriser les actions
// - Invalide le cache Next.js après modifications
// ============================================================================

// Import des bibliothèques nécessaires
import  auth  from "@/lib/auth";          // Système d'authentification pour sécuriser les actions
import prisma from "@/lib/prisma";          // Client Prisma pour les interactions avec la base de données
import { revalidatePath } from "next/cache"; // Fonction Next.js pour invalider le cache après modifications
import { headers } from "next/headers";     // Fonction Next.js pour récupérer les en-têtes HTTP (sessions)

/**
 * ============================================================================
 * FONCTION : getAllDossiers
 * ============================================================================
 * Rôle global : Récupère TOUS les dossiers avec leurs informations complètes
 * via la vue VDossiers. Supporte la pagination, la recherche et les filtres.
 * 
 * Paramètres :
 * @param page - Page actuelle pour la pagination (défaut: 1)
 * @param take - Nombre de résultats par page (défaut: 10000)
 * @param search - Terme de recherche pour filtrer les dossiers
 * @param statutId - Filtre par ID de statut de dossier
 * @param etapeId - Filtre par ID d'étape actuelle
 * 
 * Retour : Objet { success: boolean, data: array, total: number, error?: string }
 * ============================================================================
 */
export async function getAllDossiers(
    page = 1,           // Page actuelle pour la pagination (défaut: 1)
    take = 10000,       // Nombre de résultats par page (défaut: 10000)
    search = "",        // Terme de recherche pour filtrer les dossiers
    statutId: number | null = null,  // Filtre par ID de statut de dossier
    etapeId: number | null = null    // Filtre par ID d'étape actuelle
) {
    try {
        // --------------------------------------------------------------------
        // 1️⃣ VÉRIFICATION DE L'AUTHENTIFICATION UTILISATEUR
        // --------------------------------------------------------------------
        // Récupère la session utilisateur depuis les en-têtes HTTP pour sécurité
        const session = await auth.api.getSession({
            headers: await headers(),  // Récupère les en-têtes HTTP pour la session
        });

        // Si pas de session, l'utilisateur n'est pas authentifié → erreur
        if (!session) {
            throw new Error("Missing User Session");
        }

        // --------------------------------------------------------------------
        // 2️⃣ CONSTRUCTION DES CONDITIONS DE FILTRE POUR LA REQUÊTE
        // --------------------------------------------------------------------
        // Construit dynamiquement les conditions WHERE pour la requête Prisma
        const where: any = {};

        // Si un terme de recherche est fourni, crée une condition OR pour chercher
        // dans plusieurs champs (numéro dossier, numéro OT, nom client, type dossier)
        if (search) {
            where.OR = [
                { No_Dossier: { contains: search } },      // Recherche dans le numéro de dossier
                { No_OT: { contains: search } },           // Recherche dans le numéro d'OT
                { Nom_Client: { contains: search } },       // Recherche dans le nom du client
                { Libelle_Type_Dossier: { contains: search } }, // Recherche dans le type de dossier
            ];
        }

        // Ajoute le filtre sur le statut si fourni (filtrage exact)
        if (statutId !== null) {
            where.ID_Statut_Dossier = statutId;
        }

        // Ajoute le filtre sur l'étape si fournie (filtrage exact)
        if (etapeId !== null) {
            where.ID_Etape_Actuelle = etapeId;
        }

        // --------------------------------------------------------------------
        // 3️⃣ REQUÊTE PRISMA POUR RÉCUPÉRER LES DOSSIERS
        // --------------------------------------------------------------------
        // Interroge la vue VDossiers qui contient déjà toutes les jointures nécessaires
        const dossiers = await prisma.vDossiers.findMany({
            where,                                   // Applique les filtres construits ci-dessus
            orderBy: { ID_Dossier: "desc" },        // Trie par ID décroissant (plus récent d'abord)
            take,                                    // Limite le nombre de résultats pour pagination
            skip: (page - 1) * take,                // Calcule l'offset pour la pagination (page-1 * pageSize)
        });

        // --------------------------------------------------------------------
        // 4️⃣ SÉRIALISATION DES DONNÉES POUR JSON
        // --------------------------------------------------------------------
        // Convertit les objets Decimal en nombres pour la sérialisation JSON
        // Prisma retourne des Decimal qui ne peuvent pas être sérialisés directement
        // JSON.parse(JSON.stringify()) est la méthode la plus fiable pour cette conversion
        const serializedDossiers = JSON.parse(JSON.stringify(dossiers));

        // --------------------------------------------------------------------
        // 5️⃣ RETOUR DU RÉSULTAT
        // --------------------------------------------------------------------
        // Retourne le succès avec les données sérialisées et le total
        return { success: true, data: serializedDossiers, total: serializedDossiers.length };
    } catch (error) {
        // En cas d'erreur, log l'erreur dans la console pour débogage
        console.error("getAllDossiers error:", error);
        // Retourne l'échec avec l'erreur pour affichage utilisateur
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur inconnue"
        };

    }
}

/**
 * ============================================================================
 * FONCTION : getDossierById
 * ============================================================================
 * Rôle global : Récupère un dossier spécifique par son ID via la vue VDossiers.
 * 
 * Paramètres :
 * @param id - ID du dossier à récupérer
 * 
 * Retour : Objet { success: boolean, data: object, error?: string }
 * ============================================================================
 */
export async function getDossierById(id: string) {
    try {
        // Recherche le premier dossier correspondant à l'ID fourni
        const dossier = await prisma.vDossiers.findFirst({
            where: { ID_Dossier: parseInt(id) },  // Convertit l'ID string en nombre
        });

    
        // Si aucun dossier trouvé, retourne une erreur
        if (!dossier) {
            return { success: false, error: "Dossier non trouvé" };
        }

        // Sérialise TOUS les objets Decimal en nombres via JSON
        // Évite les erreurs de sérialisation côté client
        const serializedDossier = JSON.parse(JSON.stringify(dossier));

        // Retourne le succès avec les données du dossier sérialisées
        return { success: true, data: serializedDossier };
    } catch (error) {
        // Log l'erreur en cas d'échec
        console.error("getDossierById error:", error);
        // Retourne l'échec avec l'erreur
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur inconnue",
        };

    }
}

/**
 * ============================================================================
 * FONCTION : getDossiersByClientId
 * ============================================================================
 * Rôle global : Récupère tous les dossiers associés à un client spécifique.
 * Utilisé pour afficher l'historique des dossiers d'un client dans sa fiche.
 * 
 * Paramètres :
 * @param clientId - ID du client pour lequel récupérer les dossiers
 * 
 * Retour : Objet { success: boolean, data: array, error?: string }
 * ============================================================================
 */
export async function getDossiersByClientId(clientId: string) {
    try {
        // Log de débogage pour suivre l'exécution de la fonction
        console.log('🔍 [getDossiersByClientId] Recherche dossiers pour client ID:', clientId);
        
        // --------------------------------------------------------------------
        // 1️⃣ VÉRIFICATION DE L'AUTHENTIFICATION
        // --------------------------------------------------------------------
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        // Si pas de session, l'utilisateur n'est pas authentifié
        if (!session) {
            throw new Error("Missing User Session");
        }

        // --------------------------------------------------------------------
        // 2️⃣ CONVERSION ET PRÉPARATION
        // --------------------------------------------------------------------
        // Convertit l'ID du client de string en nombre pour la requête
        const clientIdInt = parseInt(clientId);
        console.log('📝 [getDossiersByClientId] Client ID converti:', clientIdInt);

        // Recherche tous les dossiers du client via la vue VDossiers
        const dossiers = await prisma.vDossiers.findMany({
            where: { ID_Client: clientIdInt as number },  // Filtre par ID client
            orderBy: { Date_Creation: "desc" }, // Trie par date de création décroissante
            select: {
                ID_Dossier: true,                    // ID du dossier
                No_Dossier: true,                    // Numéro du dossier
                No_OT: true,                         // Numéro d'OT
                ID_Client: true,                     // ID du client
                Nom_Client: true,                    // Nom du client
                Libelle_Type_Dossier: true,           // Type de dossier
                Libelle_Statut_Dossier: true,         // Statut du dossier
                ID_Statut_Dossier: true,              // ID du statut
                ID_Etape_Actuelle: true,              // ID de l'étape actuelle
                Libelle_Etape_Actuelle: true,         // Libellé de l'étape actuelle
                Date_Creation: true,                  // Date de création
                Date_Ouverture_Dossier: true,         // Date d'ouverture du dossier
            },
        });

        // Logs de débogage pour vérifier les résultats
        console.log('📊 [getDossiersByClientId] Dossiers trouvés:', dossiers.length);
        console.log('📋 [getDossiersByClientId] Premier dossier:', dossiers[0]);

        // Sérialise les données pour éviter les erreurs Decimal et mapper les noms
        // Convertit les objets Decimal en nombres via JSON.parse(JSON.stringify())
        const serializedDossiers = dossiers.map(d => ({
            ID_Dossier: d.ID_Dossier,
            No_Dossier: d.No_Dossier,
            No_OT: d.No_OT,
            ID_Client: d.ID_Client,
            Nom_Client: d.Nom_Client,
            Libelle_Type_Dossier: d.Libelle_Type_Dossier,
            Libelle_Statut_Dossier: d.Libelle_Statut_Dossier,
            "Statut Dossier": d.ID_Statut_Dossier,           // Garde le format original
            "Libelle Etape Actuelle": d.Libelle_Etape_Actuelle, // Garde le format original
            Date_Creation: d.Date_Creation,
            "Date Ouverture Dossier": d.Date_Ouverture_Dossier, // Garde le format original
        }));

        // Retourne le succès avec la liste des dossiers sérialisés
        return { success: true, data: serializedDossiers };
    } catch (error) {
        // Log l'erreur avec un emoji pour une meilleure visibilité
        console.error("❌ [getDossiersByClientId] error:", error);
        // Retourne l'échec avec un message d'erreur convivial
        return { success: false, error: "Erreur lors de la récupération des dossiers" };
    }
}

/**
 * Crée un nouveau dossier dans la base de données
 * Version Prisma SAFE (transactionnelle, typée, maintenable)
 */
export async function createDossier(data: {
    typeDossierId: number;
    clientId: number;
    description?: string;
    noOT?: string;
    noDossier?: string;
    poidsBrutPesee?: number;
    poidsNetPesee?: number;
    volumePesee?: number;
    nbrePaquetagePesee?: number;
    statutDossierId?: number;
    observationDossier?: string;
}) {
    try {
        // 1️⃣ Sécurité : session utilisateur
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            throw new Error("Missing User Session");
        }

        const userId = parseInt(session.user.id);

        // 2️⃣ Création du dossier via Prisma
        const created = await prisma.tDossiers.create({
            data: {
                Branche: 0, // DEFAULT BRANCH
                Type_Dossier: data.typeDossierId,
                Client: data.clientId,

                Description_Dossier: data.description ?? "",
                No_OT: data.noOT ?? "",
                No_Dossier: data.noDossier ?? "",

                Poids_Brut_Pesee: data.poidsBrutPesee ?? 0,
                Poids_Net_Pesee: data.poidsNetPesee ?? 0,
                Volume_Pesee: data.volumePesee ?? 0,

                Nbre_Paquetage_Pesee: data.nbrePaquetagePesee ?? 0,

                Responsable_Dossier: parseInt(session.user.id),
                Observation_Dossier: data.observationDossier ?? "",
                Statut_Dossier: data.statutDossierId ?? 0,
                Session: parseInt(session.user.id),

                Convertion: null, // Conversion par défaut
                Date_Creation: new Date(),
            },
        });

        // 3️⃣ Lecture EXACTE depuis la vue (très bonne pratique)
        const dossier = await prisma.vDossiers.findFirst({
            where: { ID_Dossier: created.ID_Dossier },
        });

        if (!dossier) {
            throw new Error("Created dossier not found in VDossiers");
        }

        // 4️⃣ Sérialisation Decimal → JSON
        const serializedDossier = JSON.parse(JSON.stringify(dossier));

        revalidatePath("/dossiers");

        return {
            success: true,
            data: serializedDossier,
        };
    } catch (error) {
        console.error("createDossier error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur inconnue",
        };
    }
}



/**
 * Met à jour un dossier existant dans la base de données
 */
export async function updateDossier(id: string, data: any) {
    try {
        // Vérification de l'authentification utilisateur
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        // Si pas de session, lance une erreur
        if (!session) {
            throw new Error("Missing User Session");
        }

        // Met à jour le dossier dans la table TDossiers avec Prisma
        const dossier = await prisma.tDossiers.update({
            where: { ID_Dossier: parseInt(id) },  // Convertit l'ID string en nombre
            data: {
                // Utilise l'opérateur spread conditionnel pour n'inclure que les champs fournis
                ...(data.brancheId !== undefined && { Branche: data.brancheId }),
                ...(data.typeDossierId !== undefined && { Type_Dossier: data.typeDossierId }),
                ...(data.clientId !== undefined && { Client: data.clientId }),
                ...(data.description && { Description_Dossier: data.description }),
                ...(data.noOT && { No_OT: data.noOT }),
                ...(data.noDossier && { No_Dossier: data.noDossier }),
                // Vérifie undefined pour permettre la mise à jour à 0
                ...(data.poidsBrutPesee !== undefined && { Poids_Brut_Pesee: data.poidsBrutPesee }),
                ...(data.poidsNetPesee !== undefined && { Poids_Net_Pesee: data.poidsNetPesee }),
                ...(data.volumePesee !== undefined && { Volume_Pesee: data.volumePesee }),
                ...(data.nbrePaquetagePesee !== undefined && { Nbre_Paquetage_Pesee: data.nbrePaquetagePesee }),
                ...(data.statutDossierId !== undefined && { Statut_Dossier: data.statutDossierId }),
            },
        });

        // Invalide le cache de la page du dossier spécifique
        revalidatePath(`/dossiers/${id}`);
        // Invalide le cache de la liste des dossiers
        revalidatePath("/dossiers");
        // Retourne le succès avec les données du dossier mis à jour
        return { success: true, data: dossier };
    } catch (error) {
        // Log l'erreur en cas d'échec
        console.error("updateDossier error:", error);
        // Retourne l'échec avec l'erreur
        return { success: false, error };
    }
}

/**
 * Supprime un dossier de la base de données
 */
export async function deleteDossier(id: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            throw new Error("Missing User Session");
        }

        const dossierId = parseInt(id);
        if (isNaN(dossierId)) {
            throw new Error("Invalid dossier ID");
        }

        // Vérifier s'il y a des colisages
        const colisagesCount = await prisma.tColisageDossiers.count({
            where: { Dossier: dossierId },
        });

        if (colisagesCount > 0) {
            throw new Error("Impossible de supprimer un dossier avec des colisages");
        }
        // Supprime le dossier de la table TDossiers avec Prisma
          const deleted = await prisma.tDossiers.delete({
            where: { ID_Dossier: dossierId },
        });;

        // Invalide le cache de la liste des dossiers
        revalidatePath("/dossiers");
        // Retourne le succès avec les données du dossier supprimé
        return {
            success: true,
            data: JSON.parse(JSON.stringify(deleted)),
        };
    } catch (error) {
        // Log l'erreur en cas d'échec
        console.error("deleteDossier error:", error);
        // Retourne l'échec avec l'erreur
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur",
        };
    }
}

/**
 * Récupère tous les clients actifs pour les formulaires de sélection
 */
export async function getAllClientsForSelect() {
    try {
        // Requête Prisma pour récupérer tous les clients actifs
        const clients = await prisma.tClients.findMany({
            where: {
                ID_Client: { gt: 0 } // Exclure les valeurs système (ID > 0)
            },
            select: {
                ID_Client: true,    // Sélectionne uniquement l'ID pour optimiser
                Nom_Client: true,  // Sélectionne uniquement le nom pour affichage
            },
            orderBy: { Nom_Client: "asc" }, // Trie par ordre alphabétique pour meilleure UX
        });

        // Mapper pour avoir un format cohérent et Retourne le succès avec la liste des clients
          return {
            success: true,
            data: clients.map(c => ({
                id: c.ID_Client,
                libelle: c.Nom_Client, // encore plus générique pour les Select
            })),
        };
        
    } catch (error) {
        // En cas d'erreur, retourne l'échec
        console.error("getAllClientsForSelect error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur",
        };
    }
}

/**
 * ============================================================================
 * FONCTION : getAllTypesDossiers
 * ============================================================================
 * Rôle global : Récupère tous les types de dossiers disponibles.
 * Utilisé pour remplir les sélecteurs dans les formulaires de création/modification.
 * 
 * Retour : Objet { success: boolean, data: array, error?: string }
 * ============================================================================
 */
export async function getAllTypesDossiers() {
    try {
        // Requête Prisma pour récupérer tous les types de dossiers valides
        const types = await prisma.tTypesDossiers.findMany({
            where: {
                ID_Type_Dossier: { gt: 0 } // Exclure les valeurs système (ID > 0)
            },
            select: {
                ID_Type_Dossier: true,          // Sélectionne uniquement l'ID
                Libelle_Type_Dossier: true,     // et le libellé pour optimiser
            },
            orderBy: { Libelle_Type_Dossier: "asc" }, // Trie par ordre alphabétique
        });

        // Mapper pour avoir un format cohérent et Retourne le succès avec la liste des types de dossiers
         return {
            success: true,
            data: types.map(t => ({
                id: t.ID_Type_Dossier,
                libelle: t.Libelle_Type_Dossier,
            })),
        };
    } catch (error) {
        // En cas d'erreur, retourne l'échec
       console.error("getAllTypesDossiers error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur",
        };
    }
}

/**
 * Récupère tous les sens de trafic
 */
export async function getAllSensTrafic() {
    try {
        const sens = await prisma.tSensTrafic.findMany({
            where: {
                ID_Sens_Trafic: { not: "" } // Exclure les valeurs vides
            },
            select: {
                ID_Sens_Trafic: true,
                Libelle_Sens_Trafic: true,
            },
            orderBy: { Libelle_Sens_Trafic: "asc" },
        });

        // Mapper pour avoir un format cohérent
         return {
            success: true,
            data: sens.map(s => ({
                id: s.ID_Sens_Trafic, // STRING, PAS number
                libelle: s.Libelle_Sens_Trafic,
            })),
        };
    } catch (error) {
        console.error("getAllSensTrafic error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur",
        };
    }
}

/**
 * Récupère tous les modes de transport
 */
export async function getAllModesTransport() {
    try {
        const modes = await prisma.tModesTransport.findMany({
            where: {
                ID_Mode_Transport: { not: "" } // Exclure les valeurs système
            },
            select: {
                ID_Mode_Transport: true,
                Libelle_Mode_Transport: true,
            },
            orderBy: { Libelle_Mode_Transport: "asc" },
        });

        // Mapper pour avoir un format cohérent
        return {
            success: true,
            data: modes.map(m => ({
                id: m.ID_Mode_Transport, // STRING
                libelle: m.Libelle_Mode_Transport,
            })),
        };
    } catch (error) {
       console.error("getAllModesTransport error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur",
        };
    }
}

/**
 * Récupère toutes les branches
 */
export async function getAllBranches() {
    try {
        const branches = await prisma.tBranches.findMany({
            select: {
                ID_Branche: true,
                Nom_Branche: true,
            },
            orderBy: { Nom_Branche: "asc" },
        });

        // Mapper pour avoir un format cohérent
        return {
            success: true,
            data: branches.map(b => ({
                id: b.ID_Branche, // Int number
                libelle: b.Nom_Branche,
            })),
        };
    } catch (error) {
        console.error("getAllBranches error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur",
        };
    }
}

/**
 * Récupère toutes les entités
 */
export async function getAllEntites() {
    try {
        const entites = await prisma.tEntites.findMany({
            select: {
                ID_Entite: true,
                Nom_Entite: true,
            },
            orderBy: { Nom_Entite: "asc" },
        });

        // Mapper pour avoir un format cohérent
         return {
            success: true,
            data: entites.map(e => ({
                id: e.ID_Entite, // Int number
                libelle: e.Nom_Entite,
            })),
        };
    } catch (error) {
         console.error("getAllEntites error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur",
        };
    }
}

/**
 * Récupère tous les statuts de dossiers
 */
export async function getAllStatutsDossiers() {
    try {
        const statuts = await prisma.tStatutsDossier.findMany({
            select: {
                ID_Statut_Dossier: true,
                Libelle_Statut_Dossier: true,
            },
            orderBy: { Libelle_Statut_Dossier: "asc" },
        });

        // Mapper pour avoir un format cohérent
        return {
            success: true,
            data: statuts.map(s => ({
                id: s.ID_Statut_Dossier, // Int number
                libelle: s.Libelle_Statut_Dossier,
            })),
        };
    } catch (error) {
        console.error("getAllStatutsDossiers error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur",
        };
    }
}

/**
 * Récupère toutes les étapes disponibles
 */
export async function getAllEtapes() {
    try {
        // Utiliser les étapes actuelles des dossiers pour garantir la correspondance
        const etapes = await prisma.vDossiers.findMany({
            select: {
                ID_Etape_Actuelle: true,
                Libelle_Etape_Actuelle: true,
            },
            distinct: ['ID_Etape_Actuelle'],
            orderBy: { Libelle_Etape_Actuelle: "asc" },
        });

        // Mapper pour avoir le même format
        return {
            success: true,
            data: etapes.map(e => ({
                id: e.ID_Etape_Actuelle, // Int number
                libelle: e.Libelle_Etape_Actuelle,
            })),
        };
    } catch (error) {
        console.error("getAllEtapes error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur",
        };
    }
}



