"use server";

// ============================================================================
// MODULE ACTIONS.TS - DOSSIERS DOUANIERS
// ============================================================================
// RÃ´le global : Fichier principal contenant toutes les actions serveur pour la
// gestion des dossiers de douane. GÃ¨re les opÃ©rations CRUD, la pagination,
// les filtres et la rÃ©cupÃ©ration des donnÃ©es de rÃ©fÃ©rence.
//
// Architecture :
// - Utilise VDossiers (vue) pour les lectures avec jointures
// - Utilise TDossiers (table) pour les Ã©critures
// - Inclut l'authentification utilisateur pour sÃ©curiser les actions
// - Invalide le cache Next.js aprÃ¨s modifications
// ============================================================================

// Import des bibliothÃ¨ques nÃ©cessaires
import  auth  from "@/lib/auth";          // SystÃ¨me d'authentification pour sÃ©curiser les actions
import prisma from "@/lib/prisma";          // Client Prisma pour les interactions avec la base de donnÃ©es
import { revalidatePath } from "next/cache"; // Fonction Next.js pour invalider le cache aprÃ¨s modifications
import { headers } from "next/headers";     // Fonction Next.js pour rÃ©cupÃ©rer les en-tÃªtes HTTP (sessions)

/**
 * Convert Prisma Decimal objects into standard JavaScript numbers.
 * This keeps the payload safe for frontend rendering.
 */
function convertDecimalsToNumbers<T>(data: T): T {
    const jsonString = JSON.stringify(data, (_, value) => {
        if (value && typeof value === "object" && value.constructor?.name === "Decimal") {
            return Number(value.toString());
        }
        return value;
    });

    return JSON.parse(jsonString) as T;
}


/**
 * ============================================================================
 * FONCTION : getAllDossiers
 * ============================================================================
 * Role global : Recuperer TOUS les dossiers avec leurs informations completes
 * via la vue VDossiers. Supporte la pagination, la recherche et les filtres.
 * 
 * Parametres :
 * @param page - Page actuelle pour la pagination (defaut: 1)
 * @param take - Nombre de rÃ©sultats par page (defaut: 10000)
 * @param search - Terme de recherche pour filtrer les dossiers
 * @param statutId - Filtre par ID de statut de dossier
 * @param etapeId - Filtre par ID d'etape actuelle
 * 
 * Retour : Objet { success: boolean, data: array, total: number, error?: string }
 * ============================================================================
 */
export async function getAllDossiers(
    page = 1,
    take = 10000,
    search = "",
    statutId: number | null = null,
    etapeId: number | null = null
) {
    try {
        // 1) Verify authenticated user session
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            throw new Error("Missing User Session");
        }

        // 2) Build dynamic filters
        const where: any = {};

        if (search) {
            where.OR = [
                { No_Dossier: { contains: search } },
                { No_OT: { contains: search } },
                { Nom_Client: { contains: search } },
                { Libelle_Type_Dossier: { contains: search } },
            ];
        }

        if (statutId !== null) {
            where.ID_Statut_Dossier = statutId;
        }

        if (etapeId !== null) {
            where.ID_Etape_Actuelle = etapeId;
        }

        // 3) Read from VDossiers view
        const dossiers = await prisma.vDossiers.findMany({
            where,
            orderBy: { ID_Dossier: "desc" },
            take,
            skip: (page - 1) * take,
        });

        // 4) Defensive deduplication by ID_Dossier
        // The SQL view can return duplicated rows for one dossier.
        const uniqueDossiers = Array.from(
            new Map(dossiers.map((d) => [d.ID_Dossier, d])).values()
        );

        // 5) Convert Decimal values and normalize nullable numeric fields
        const serializedDossiers = uniqueDossiers.map((dossier) => {
            const serialized = convertDecimalsToNumbers(dossier);

            return {
                ...serialized,
                Nbre_Paquetage_Pesee: serialized.Nbre_Paquetage_Pesee ?? 0,
                Poids_Brut_Pesee: serialized.Poids_Brut_Pesee ?? 0,
                Poids_Net_Pesee: serialized.Poids_Net_Pesee ?? 0,
                Volume_Pesee: serialized.Volume_Pesee ?? 0,
            };
        });

        // 6) Return stable payload for frontend
        return { success: true, data: serializedDossiers, total: serializedDossiers.length };
    } catch (error) {
        // En cas d'erreur, log l'erreur dans la console pour debogage
        console.error("getAllDossiers error:", error);
        // Retourne l'echec avec l'erreur pour affichage utilisateur
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
 * Role global : Recupere un dossier specifique par son ID via la vue VDossiers.
 * 
 * Parametres :
 * @param id - ID du dossier a recuperer
 * 
 * Retour : Objet { success: boolean, data: object, error?: string }
 * ============================================================================
 */
export async function getDossierById(id: string) {
    try {
        // Recherche le premier dossier correspondant a l'ID fourni
        const dossier = await prisma.vDossiers.findFirst({
            where: { ID_Dossier: parseInt(id) },  // Convertit l'ID string en nombre
        });

        console.log("dossier", dossier);    

    
        // Si aucun dossier trouve, retourne une erreur
        if (!dossier) {
            return { success: false, error: "Dossier non trouve" };
        }

        // Serialise TOUS les objets Decimal en nombres via JSON
        // evite les erreurs de serialisation cote client
        const serializedDossier = convertDecimalsToNumbers(dossier);

        serializedDossier.Nbre_Paquetage_Pesee = serializedDossier.Nbre_Paquetage_Pesee ?? 0;
        serializedDossier.Poids_Brut_Pesee = serializedDossier.Poids_Brut_Pesee ?? 0;
        serializedDossier.Poids_Net_Pesee = serializedDossier.Poids_Net_Pesee ?? 0;
        serializedDossier.Volume_Pesee = serializedDossier.Volume_Pesee ?? 0;

        // Retourne le succes avec les donnees du dossier serialisees
        return { success: true, data: serializedDossier };
    } catch (error) {
        // Log l'erreur en cas d'echec
        console.error("getDossierById error:", error);
        // Retourne l'echec avec l'erreur
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
 * Role global : Recupere tous les dossiers associes a un client specifique.
 * Utilise pour afficher l'historique des dossiers d'un client dans sa fiche.
 * 
 * Parametres :
 * @param clientId - ID du client pour lequel recuperer les dossiers
 * 
 * Retour : Objet { success: boolean, data: array, error?: string }
 * ============================================================================
 */
export async function getDossiersByClientId(clientId: string) {
    try {
        // Log de debogage pour suivre l'execution de la fonction
        console.log('[getDossiersByClientId] Recherche dossiers pour client ID:', clientId);
        
        // --------------------------------------------------------------------
        // 1. VERIFICATION DE L'AUTHENTIFICATION
        // --------------------------------------------------------------------
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        // Si pas de session, l'utilisateur n'est pas authentifie
        if (!session) {
            throw new Error("Missing User Session");
        }

        // --------------------------------------------------------------------
        // 2. CONVERSION ET PREPARATION
        // --------------------------------------------------------------------
        // Convertit l'ID du client de string en nombre pour la requete
        const clientIdInt = parseInt(clientId);
        console.log('[getDossiersByClientId] Client ID converti:', clientIdInt);

        // Recherche tous les dossiers du client via la vue VDossiers
        const dossiers = await prisma.vDossiers.findMany({
            where: { ID_Client: clientIdInt as number },  // Filtre par ID client
            orderBy: { Date_Creation: "desc" }, // Trie par date de creation decroissante
            select: {
                ID_Dossier: true,                    // ID du dossier
                No_Dossier: true,                    // Numero du dossier
                No_OT: true,                         // Numero d'OT
                ID_Client: true,                     // ID du client
                Nom_Client: true,                    // Nom du client
                Libelle_Type_Dossier: true,           // Type de dossier
                Libelle_Statut_Dossier: true,         // Statut du dossier
                ID_Statut_Dossier: true,              // ID du statut
                ID_Etape_Actuelle: true,              // ID de l'etape actuelle
                Libelle_Etape_Actuelle: true,         // Libelle de l'etape actuelle
                Date_Creation: true,                  // Date de creation
                Date_Ouverture_Dossier: true,         // Date d'ouverture du dossier
            },
        });

        // Logs de debogage pour verifier les resultats
        console.log('[getDossiersByClientId] Dossiers trouves:', dossiers.length);
        console.log('[getDossiersByClientId] Premier dossier:', dossiers[0]);

        // Serialise les donnees pour eviter les erreurs Decimal et mapper les noms
        // Convertit les objets Decimal en nombres via JSON.parse(JSON.stringify())
        const serializedDossiers = dossiers.map(d => ({
            ID_Dossier: d.ID_Dossier,
            No_Dossier: d.No_Dossier,
            No_OT: d.No_OT,
            ID_Client: d.ID_Client,
            Nom_Client: d.Nom_Client,
            Libelle_Type_Dossier: d.Libelle_Type_Dossier,
            Libelle_Statut_Dossier: d.Libelle_Statut_Dossier,
            "Statut Dossier": d.ID_Statut_Dossier,           // Garde le format original pour compatibilité avec ClientDossiers
            "Libelle Etape Actuelle": d.Libelle_Etape_Actuelle, // Garde le format original
            Date_Creation: d.Date_Creation,
            "Date Ouverture Dossier": d.Date_Ouverture_Dossier, // Garde le format original
        }));

        // Retourne le succes avec la liste des dossiers serialisees
        return { success: true, data: serializedDossiers };
    } catch (error) {
        // Log l'erreur avec un emoji pour une meilleure visibilite
        console.error("⚠️ [getDossiersByClientId] error:", error);
        // Retourne l'echec avec un message d'erreur convivial
        return { success: false, error: "Erreur lors de la recuperation des dossiers" };
    }
}

/**
 * Cree un nouveau dossier dans la base de donnees
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
        // 1) Securite: verifier la session utilisateur
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            throw new Error("Missing User Session");
        }

        const userId = Number(session.user.id);
        if (!Number.isInteger(userId)) {
            throw new Error("Session utilisateur invalide");
        }

        // 2) Validation minimale des champs obligatoires
        if (!Number.isInteger(data.typeDossierId) || data.typeDossierId <= 0) {
            throw new Error("Type de dossier invalide");
        }
        if (!Number.isInteger(data.clientId) || data.clientId <= 0) {
            throw new Error("Client invalide");
        }

        // 3) Normalisation des champs avant insertion
        const description = (data.description ?? "").trim();
        const noOT = (data.noOT ?? "").trim();
        const noDossier = (data.noDossier ?? "").trim();
        const observation = (data.observationDossier ?? "").trim();
        const statutDossier = data.statutDossierId ?? 0;

        const nbrePaquetage = data.nbrePaquetagePesee ?? 0;
        const poidsBrut = data.poidsBrutPesee ?? 0;
        const poidsNet = data.poidsNetPesee ?? 0;
        const volume = data.volumePesee ?? 0;
        const dateCreation = new Date();

        // 4) Creation du dossier via SQL parametre.
        // Pourquoi: dans ton client Prisma genere, tDossiers.create() n'est pas expose.
        // TDossiers ayant un trigger INSERT actif, on utilise OUTPUT ... INTO.
        const insertedRows = await prisma.$queryRaw<Array<{ ID_Dossier: number }>>`
            DECLARE @Inserted TABLE (ID_Dossier INT);

            INSERT INTO dbo.TDossiers (
                [Branche],
                [Type Dossier],
                [Client],
                [Description Dossier],
                [No OT],
                [No Dossier],
                [Nbre Paquetage Pesee],
                [Poids Brut Pesee],
                [Poids Net Pesee],
                [Volume Pesee],
                [Responsable Dossier],
                [Convertion],
                [Observation Dossier],
                [Statut Dossier],
                [Session],
                [Date Creation]
            )
            OUTPUT INSERTED.[ID Dossier] INTO @Inserted (ID_Dossier)
            VALUES (
                ${0},
                ${data.typeDossierId},
                ${data.clientId},
                ${description},
                ${noOT},
                ${noDossier},
                ${nbrePaquetage},
                ${poidsBrut},
                ${poidsNet},
                ${volume},
                ${userId},
                ${null},
                ${observation},
                ${statutDossier},
                ${userId},
                ${dateCreation}
            );

            SELECT ID_Dossier FROM @Inserted;
        `;

        const createdId = insertedRows[0]?.ID_Dossier;
        if (!createdId) {
            throw new Error("Echec de creation du dossier");
        }

        // 5) Lecture du dossier cree depuis la vue (donnees enrichies)
        const dossier = await prisma.vDossiers.findFirst({
            where: { ID_Dossier: createdId },
        });

        if (!dossier) {
            throw new Error("Created dossier not found in VDossiers");
        }

        // 6) Serialisation Decimal -> JSON
        const serializedDossier = convertDecimalsToNumbers(dossier);

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
 * Met a jour un dossier existant dans la base de donnees
 */
export async function updateDossier(id: string, data: any) {
    try {
        // Verification de l'authentification utilisateur
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        // Si pas de session, lance une erreur
        if (!session) {
            throw new Error("Missing User Session");
        }

        // Met a jour le dossier dans la table TDossiers avec Prisma
        const dossier = await prisma.tDossiers.update({
            where: { ID_Dossier: parseInt(id) },  // Convertit l'ID string en nombre
            data: {
                // Utilise l'operateur spread conditionnel pour n'inclure que les champs fournis
                ...(data.brancheId !== undefined && { Branche: data.brancheId }),
                ...(data.typeDossierId !== undefined && { Type_Dossier: data.typeDossierId }),
                ...(data.clientId !== undefined && { Client: data.clientId }),
                ...(data.description && { Description_Dossier: data.description }),
                ...(data.noOT && { No_OT: data.noOT }),
                ...(data.noDossier && { No_Dossier: data.noDossier }),
                ...(data.statutDossierId !== undefined && { Statut_Dossier: data.statutDossierId }),
            },
        });

        // Convertir les Decimal en nombres pour les composants client
        const serializedDossier = convertDecimalsToNumbers(dossier);
        // Invalide le cache de la page du dossier specifique
        revalidatePath(`/dossiers/${id}`);
        // Invalide le cache de la liste des dossiers
        revalidatePath("/dossiers");
        // Retourne le success avec les donnees du dossier mis a  jour
        return { success: true, data: serializedDossier };
    } catch (error) {
        // Log l'erreur en cas d'echec
        console.error("updateDossier error:", error);
        // Retourne l'echec avec l'erreur
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Erreur inconnue", 
        };
    }
}

/**
 * Met a jour uniquement les champs de pesée d'un dossier
 */
export async function updateDossierPesee(id: string, data: any) {
    try {
        // Verification de l'authentification utilisateur
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        // Si pas de session, lance une erreur
        if (!session) {
            throw new Error("Missing User Session");
        }

        // Met a jour le dossier dans la table TDossiers avec Prisma
        const dossier = await prisma.tDossiers.update({
            where: { ID_Dossier: parseInt(id) },  // Convertit l'ID string en nombre
            data: {
                // Utilise l'operateur spread conditionnel pour n'inclure que les champs fournis
                // Verifie undefined pour permettre la mise a jour a 0
                ...(data.poidsBrutPesee !== undefined && { Poids_Brut_Pesee: data.poidsBrutPesee }) || 0,
                ...(data.poidsNetPesee !== undefined && { Poids_Net_Pesee: data.poidsNetPesee }) || 0,
                ...(data.volumePesee !== undefined && { Volume_Pesee: data.volumePesee }) || 0,
                ...(data.nbrePaquetagePesee !== undefined && { Nbre_Paquetage_Pesee: data.nbrePaquetagePesee }) || 0,
            },
        });

        // Convertir les Decimal en nombres pour les composants client
        const serializedDossier = convertDecimalsToNumbers(dossier);
        // Invalide le cache de la page du dossier specifique
        revalidatePath(`/dossiers/${id}`);
        // Invalide le cache de la liste des dossiers
        revalidatePath("/dossiers");
        // Retourne le success avec les donnees du dossier mis a  jour
        return { success: true, data: serializedDossier };
    } catch (error) {
        // Log l'erreur en cas d'echec
        console.error("updateDossierPesee error:", error);
        // Retourne l'echec avec l'erreur
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Erreur inconnue", 
        };
    }
}

/**
 * Supprime un dossier de la base de donnees
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

        // Verifier s'il y a des colisages
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
        // Retourne le success avec les donnees du dossier supprime
        return {
            success: true,
            data: JSON.parse(JSON.stringify(deleted)),
        };
    } catch (error) {
        // Log l'erreur en cas d'echec
        console.error("deleteDossier error:", error);
        // Retourne l'echec avec l'erreur
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur",
        };
    }
}

/**
 * Recupere tous les clients actifs pour les formulaires de selection
 */
export async function getAllClientsForSelect() {
    try {
        // Requete Prisma pour recuperer tous les clients actifs
        const clients = await prisma.tClients.findMany({
            where: {
                ID_Client: { gt: 0 } // Exclure les valeurs systeme (ID > 0)
            },
            select: {
                ID_Client: true,    // Selectionne uniquement l'ID pour optimiser
                Nom_Client: true,  // Selectionne uniquement le nom pour affichage
            },
            orderBy: { Nom_Client: "asc" }, // Trie par ordre alphabetique pour meilleure UX
        });

        // Mapper pour avoir un format coherent et Retourne le succes avec la liste des clients
          return {
            success: true,
            data: clients.map(c => ({
                id: c.ID_Client,
                libelle: c.Nom_Client, // encore plus generique pour les Select
            })),
        };
        
    } catch (error) {
        // En cas d'erreur, retourne l'echec
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
 * Role global : Recupere tous les types de dossiers disponibles.
 * Utilise pour remplir les selecteurs dans les formulaires de creation/modification.
 * 
 * Retour : Objet { success: boolean, data: array, error?: string }
 * ============================================================================
 */
export async function getAllTypesDossiers() {
    try {
        // Requete Prisma pour recuperer tous les types de dossiers valides
        const types = await prisma.tTypesDossiers.findMany({
            where: {
                ID_Type_Dossier: { gt: 0 } // Exclure les valeurs systeme (ID > 0)
            },
            select: {
                ID_Type_Dossier: true,          // Selectionne uniquement l'ID
                Libelle_Type_Dossier: true,     // et le libelle pour optimiser
            },
            orderBy: { Libelle_Type_Dossier: "asc" }, // Trie par ordre alphabetique
        });

        // Mapper pour avoir un format coherent et Retourne le succes avec la liste des types de dossiers
         return {
            success: true,
            data: types.map(t => ({
                id: t.ID_Type_Dossier,
                libelle: t.Libelle_Type_Dossier,
            })),
        };
    } catch (error) {
        // En cas d'erreur, retourne l'echec
       console.error("getAllTypesDossiers error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur",
        };
    }
}

/**
 * Recupere tous les sens de trafic
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

        // Mapper pour avoir un format coherent
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
 * Recupere tous les modes de transport
 */
export async function getAllModesTransport() {
    try {
        const modes = await prisma.tModesTransport.findMany({
            where: {
                ID_Mode_Transport: { not: "" } // Exclure les valeurs systeme
            },
            select: {
                ID_Mode_Transport: true,
                Libelle_Mode_Transport: true,
            },
            orderBy: { Libelle_Mode_Transport: "asc" },
        });

        // Mapper pour avoir un format coherent
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
 * Recupere toutes les branches
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

        // Mapper pour avoir un format cohÃ©rent
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
 * Recupere toutes les entites
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

        // Mapper pour avoir un format cohÃ©rent
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
 * Recupere tous les statuts de dossiers
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

        // Mapper pour avoir un format coherent
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
 * Recupere toutes les etapes disponibles
 */
export async function getAllEtapes() {
    try {
        // Utiliser les etapes actuelles des dossiers pour garantir la correspondance
        const etapes = await prisma.vDossiers.findMany({
            select: {
                ID_Etape_Actuelle: true,
                Libelle_Etape_Actuelle: true,
            },
            distinct: ['ID_Etape_Actuelle'],
            orderBy: { Libelle_Etape_Actuelle: "asc" },
        });

        // Mapper pour avoir le meme format
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

/**
 * Annule un dossier en cours
 * Appelle la procédure stockée pSP_AnnulerDossier
 * 
 * Cette procédure:
 * - Valide que le dossier est en cours (statut = 0)
 * - Met le statut du dossier à -2 (annulé)
 * 
 * @param dossierId - ID du dossier à annuler
 * @throws Error si le dossier n'est pas en cours ou erreur SQL
 */

export async function annulerDossier(dossierId: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            throw new Error("Missing User Session");
        }

        const id = parseInt(dossierId);
        await prisma.$executeRaw`EXEC pSP_AnnulerDossier @Id_Dossier = ${id}`;

        revalidatePath(`/dossiers/${dossierId}`);
        revalidatePath("/dossiers");
        return { success: true };
    } catch (error: any) {
        console.error("annulerDossier error:", error);
        const message = error.message || 'Erreur inconnue';

        if (message.includes('FILE IS NOT IN PROGRESS')) {
            return { 
                success: false, 
                error: 'Le dossier n\'est pas en cours. Seuls les dossiers en cours peuvent être annulés.' 
            };
        }

        return { 
            success: false, 
            error: `Erreur lors de l'annulation du dossier: ${message}` 
        };
    }
}