"use server";

import  auth  from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

/**
 * Nettoie les associations régime-client parasites pour un client spécifique
 */
export async function cleanupRegimesForClient(clientId: number) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return { success: false, error: "Non authentifié" };
        }

        // Supprimer toutes les associations pour ce client
        const result = await prisma.$executeRaw`
            DELETE FROM [dbo].[TRegimesClients]
            WHERE [Client] = ${clientId}
        `;

        console.log(`Nettoyage: ${result} associations supprimées pour le client ${clientId}`);

        return { success: true, message: `${result} associations supprimées` };
    } catch (error) {
        console.error("cleanupRegimesForClient error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur lors du nettoyage"
        };
    }
}

/**
 * Nettoie TOUTES les associations régime-client (ADMIN ONLY)
 */
export async function cleanupAllRegimes() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            return { success: false, error: "Non authentifié" };
        }

        // Compter avant suppression
        const countBefore = await prisma.$queryRaw<{ count: number }[]>`
            SELECT COUNT(*) as count FROM [dbo].[TRegimesClients]
        `;

        // Supprimer TOUT
        const result = await prisma.$executeRaw`
            DELETE FROM [dbo].[TRegimesClients]
        `;

        console.log(`Nettoyage total: ${result} associations supprimées (avant: ${countBefore[0]?.count})`);

        return { 
            success: true, 
            message: `${result} associations supprimées`,
            countBefore: countBefore[0]?.count 
        };
    } catch (error) {
        console.error("cleanupAllRegimes error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur lors du nettoyage"
        };
    }
}
