"use server";

import { auth } from "@/lib/auth";
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
 * Récupérer tous les régimes de déclaration pour les selects
 */
export async function getAllRegimesDeclarationsForSelect() {
    try {
        const regimes = await prisma.tRegimesDeclarations.findMany({
            select: {
                ID_Regime_Declaration: true,
                Libelle_Regime_Declaration: true,
                Taux_DC: true,
            },
            orderBy: {
                Libelle_Regime_Declaration: 'asc'
            }
        });

        const options = regimes.map(regime => ({
            value: regime.ID_Regime_Declaration.toString(),
            label: regime.Libelle_Regime_Declaration,
            tauxDC: convertDecimalsToNumbers(regime.Taux_DC)
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
            tauxDC: rc.Ratio_DC,
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

        const sessionId = parseInt(session.user.id);

        // 1️⃣ Vérifier si l'association existe déjà
        const existingAssociation = await prisma.$queryRaw<
        { ID_Regime_Client: number }[]
        >`
        SELECT TOP 1 [ID Regime Client] AS ID_Regime_Client
        FROM [dbo].[TRegimesClients]
        WHERE [Client] = ${clientId}
            AND [Regime Declaration] = ${regimeId}
        `;

        if (existingAssociation.length > 0) {
            return { success: false, error: "Cette association existe déjà" };
        }

        // 2️⃣ Insertion SQL brute
        await prisma.$executeRaw`
        INSERT INTO [dbo].[TRegimesClients]
            ([ID_Client], [ID_Regime_Declaration], [ID_Session], [Date_Creation])
        VALUES
            (${clientId}, ${regimeId}, ${sessionId}, SYSDATETIME())
        `;

        // 3️⃣ Relecture via VIEW (propre)
        const created = await prisma.$queryRaw<
        {
            id: number;
            clientId: number;
            clientNom: string;
            regimeId: number;
            regimeLibelle: string;
            tauxDC: number;
            dateCreation: Date;
            nomCreation: string;
        }[]
        >`
        SELECT TOP 1
            ID_Regime_Client        AS id,
            ID_Client               AS clientId,
            Nom_Client              AS clientNom,
            ID_Regime_Declaration   AS regimeId,
            Libelle_Regime_Declaration AS regimeLibelle,
            Ratio_DC                AS tauxDC,
            Date_Creation           AS dateCreation,
            Nom_Creation            AS nomCreation
        FROM [dbo].[VRegimesClients]
        WHERE ID_Client = ${clientId}
            AND ID_Regime_Declaration = ${regimeId}
        ORDER BY ID_Regime_Client DESC
        `;

        revalidatePath("/client");
        return { 
            success: true, 
            data: convertDecimalsToNumbers(created[0]) };
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

        const sessionId = parseInt(session.user.id);

        // 1️⃣ Vérifier si l'association existe déjà (SQL brut)
        const existing = await prisma.$queryRaw<
        { ID_Regime_Client: number }[]
        >`
        SELECT TOP 1 ID_Regime_Client AS ID_Regime_Client
        FROM [dbo].[TRegimesClients]
        WHERE ID_Client = ${data.clientId}
            AND ID_Regime_Declaration = ${data.regimeId}
        `;

        if (existing.length > 0) {
            return { success: false, error: "Cette association existe déjà" };
        }

        // 2️⃣ Insertion SQL brute
        await prisma.$executeRaw`
        INSERT INTO [dbo].[TRegimesClients]
            ([ID_Client], [ID_Regime_Declaration], [ID_Session], [Date_Creation])
        VALUES
            (${data.clientId}, ${data.regimeId}, ${sessionId}, SYSDATETIME())
        `;

        // 3️⃣ Relecture via VIEW (propre, stable, typée)
        const created = await prisma.$queryRaw<
        {
            id: number;
            clientId: number;
            clientNom: string;
            regimeId: number;
            regimeLibelle: string;
            tauxDC: number;
            dateCreation: Date;
            nomCreation: string;
        }[]
        >`
        SELECT TOP 1
            ID_Regime_Client          AS id,
            ID_Client                 AS clientId,
            Nom_Client                AS clientNom,
            ID_Regime_Declaration     AS regimeId,
            Libelle_Regime_Declaration AS regimeLibelle,
            Ratio_DC                  AS tauxDC,
            Date_Creation             AS dateCreation,
            Nom_Creation              AS nomCreation
        FROM [dbo].[VRegimesClients]
        WHERE ID_Client = ${data.clientId}
            AND ID_Regime_Declaration = ${data.regimeId}
        ORDER BY ID_Regime_Client DESC
        `;

        revalidatePath("/client");

        return { 
            success: true, 
            data: convertDecimalsToNumbers(created[0]) };
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
            tauxDC: regime.Ratio_DC
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