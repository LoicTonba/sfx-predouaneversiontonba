"use server";

import  auth  from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

/**
 * Convertit les Decimal de Prisma en nombres via JSON
 */
function convertDecimalsToNumbers(data: any): any {
    const jsonString = JSON.stringify(data, (_, value) => {
        if (value && typeof value === 'object' && value.constructor.name === 'Decimal') {
            return parseFloat(value.toString());
        }
        return value;
    });
    return JSON.parse(jsonString);
}

/**
 * Cree une association regime-client via SQL brut parametre.
 *
 * Pourquoi ce helper:
 * - certaines operations create() ne sont pas exposees par le client Prisma genere;
 * - on centralise la logique d'insert pour les 2 actions de creation;
 * - OUTPUT ... INTO permet de recuperer la ligne inseree proprement.
 */
async function insertRegimeClientAssociation(
    clientId: number,
    regimeId: number,
    sessionId: number
) {
    const now = new Date();

    const insertedRows = await prisma.$queryRaw<
        Array<{
            ID_Regime_Client: number;
            Client: number;
            Regime_Declaration: number;
            Session: number;
            Date_Creation: Date;
        }>
    >`
        DECLARE @Inserted TABLE (
            ID_Regime_Client INT,
            Client INT,
            Regime_Declaration INT,
            Session INT,
            Date_Creation DATETIME2(7)
        );

        INSERT INTO dbo.TRegimesClients ([Client], [Regime Declaration], [Session], [Date Creation])
        OUTPUT
            INSERTED.[ID Regime Client],
            INSERTED.[Client],
            INSERTED.[Regime Declaration],
            INSERTED.[Session],
            INSERTED.[Date Creation]
        INTO @Inserted (ID_Regime_Client, Client, Regime_Declaration, Session, Date_Creation)
        VALUES (${clientId}, ${regimeId}, ${sessionId}, ${now});

        SELECT
            I.ID_Regime_Client,
            I.Client,
            I.Regime_Declaration,
            I.Session,
            I.Date_Creation
        FROM @Inserted AS I;
    `;

    const createdAssociation = insertedRows[0];
    if (!createdAssociation) {
        throw new Error("Echec de creation de l'association regime-client");
    }

    return createdAssociation;
}

/**
 * Récupérer tous les régimes de déclaration pour les selects
 */
export async function getAllRegimesDeclarationsForSelect() {
    try {
        // On lit la vue pour obtenir le ratio DC normalise (Ratio_DC).
        // Le modele TRegimesDeclarations n'a pas de champ Taux_DC (il a Taux_Regime),
        // c'est ce decalage qui provoquait l'erreur Prisma.
        const regimes = await prisma.tRegimesDeclarations.findMany({
            select: {
                ID_Regime_Declaration: true,
                Libelle_Regime_Declaration: true,
                Taux_Regime: true,
            },
            orderBy: {
                Libelle_Regime_Declaration: 'asc'
            }
        });

        const options = regimes.map(regime => ({
            value: regime.ID_Regime_Declaration.toString(),
            label: regime.Libelle_Regime_Declaration,
            tauxRegime: convertDecimalsToNumbers(regime.Taux_Regime)
        }));

        return { success: true, data: options };
    } catch (error) {
        console.error("getAllRegimesDeclarationsForSelect error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur lors de la récupération"
        };
    }
}

/**
 * Récupérer toutes les associations régimes-clients
 */
export async function getRegimesClients() {
    try {
        const regimesClients = await prisma.vRegimesClients.findMany({
            orderBy: [
                { Nom_Client: 'asc' },
                { Libelle_Regime_Declaration: 'asc' }
            ]
        });

        // Adapter les noms de colonnes pour correspondre à l'interface attendue
        const adaptedData = regimesClients.map(rc => ({
            id: rc.ID_Regime_Client,
            clientId: rc.ID_Client,
            clientNom: rc.Nom_Client,
            regimeId: rc.ID_Regime_Declaration,
            regimeLibelle: rc.Libelle_Regime_Declaration,
            tauxRegime: rc.Ratio_DC,
            dateCreation: rc.Date_Creation,
            nomCreation: rc.Nom_Creation
        }));

        const serializedData = convertDecimalsToNumbers(adaptedData);

        return { success: true, data: serializedData };
    } catch (error) {
        console.error("getRegimesClients error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur lors de la récupération"
        };
    }
}

/**
 * Associer un régime à un client
 */
export async function associateRegimeToClient(clientId: number, regimeId: number) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return { success: false, error: "Non authentifié" };
        }

        const sessionId = Number(session.user.id);
        if (!Number.isInteger(sessionId)) {
            return { success: false, error: "Session utilisateur invalide" };
        }

        // Vérifier si l'association existe déjà
        const existingAssociation = await prisma.tRegimesClients.findFirst({
            where: {
                Client: clientId,
                Regime_Declaration: regimeId
            }
        });

        if (existingAssociation) {
            return { success: false, error: "Cette association existe déjà" };
        }

        // Créer l'association
        const regimeClient = await insertRegimeClientAssociation(clientId, regimeId, sessionId);

        revalidatePath("/client");
        return { 
            success: true, 
            data: convertDecimalsToNumbers(regimeClient) };
    } catch (error) {
        console.error("associateRegimeToClient error:", error);
        return {
            success: false,
            error: 
                error instanceof Error
                    ? error.message
                    : "Erreur lors de l'association",
        };
    }
}

/**
 * Créer une nouvelle association régime-client
 */
export async function createRegimeClient(data: { clientId: number; regimeId: number }) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return { success: false, error: "Non authentifié" };
        }

        const sessionId = Number(session.user.id);
        if (!Number.isInteger(sessionId)) {
            return { success: false, error: "Session utilisateur invalide" };
        }

        // Vérifier si l'association existe déjà
        const existingAssociation = await prisma.tRegimesClients.findFirst({
            where: {
                Client: data.clientId,
                Regime_Declaration: data.regimeId
            }
        });

        if (existingAssociation) {
            return { success: false, error: "Cette association existe déjà" };
        }

        // Créer l'association
        const regimeClient = await insertRegimeClientAssociation(
            data.clientId,
            data.regimeId,
            sessionId
        );

        revalidatePath("/client");

        return { 
            success: true, 
            data: convertDecimalsToNumbers(regimeClient) };
    } catch (error) {
        console.error("createRegimeClient error:", error);
        return {
            success: false,
            error:
                error instanceof Error
                ? error.message
                : "Erreur lors de la création",
        };
    }
}

/**
 * Supprimer une association régime-client
 */
export async function deleteRegimeClient(id: number) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return { success: false, error: "Non authentifié" };
        }

        await prisma.tRegimesClients.delete({
            where: { ID_Regime_Client: id }
        });

        revalidatePath("/client");
        return { success: true };
    } catch (error) {
        console.error("deleteRegimeClient error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur lors de la suppression"
        };
    }
}

/**
 * Récupérer les régimes associés à un client spécifique
 */
export async function getRegimesByClient(clientId: number) {
    try {
        const regimes = await prisma.vRegimesClients.findMany({
            where: {
                ID_Client: clientId
            },
            orderBy: {
                Libelle_Regime_Declaration: 'asc'
            }
        });

        // Adapter les noms de colonnes pour correspondre à l'interface attendue
        const adaptedData = regimes.map(regime => ({
            id: regime.ID_Regime_Client,
            regimeId: regime.ID_Regime_Declaration,
            regimeLibelle: regime.Libelle_Regime_Declaration,
            tauxRegime: regime.Ratio_DC
        }));

        const serializedData = convertDecimalsToNumbers(adaptedData);

        return { success: true, data: serializedData };
    } catch (error) {
        console.error("getRegimesByClient error:", error);
        return {
            success: false,
            error: 
                error instanceof Error 
                    ? error.message 
                    : "Erreur lors de la récupération"
        };
    }
}
