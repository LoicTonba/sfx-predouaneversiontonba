"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getSession } from "@/modules/auth/server/actions";

/**
 * Recuperer toutes les conversions via VConvertions
 */
export async function getAllConversions() {
    try {
        const conversions = await prisma.$queryRaw<any[]>`
            SELECT * FROM VConvertions
            ORDER BY Date_Convertion DESC
        `;

        return { success: true, data: conversions };
    } catch (error) {
        console.error("Erreur lors de la recuperation des conversions:", error);
        return { success: false, error: "Impossible de recuperer les conversions" };
    }
}

/**
 * Recuperer une conversion par ID via VConvertions
 */
export async function getConversionById(id: string) {
    try {
        const conversionId = Number(id);
        if (Number.isNaN(conversionId)) {
            return { success: false, error: "ID invalide" };
        }

        const rows = await prisma.$queryRaw<any[]>`
            SELECT * FROM VConvertions
            WHERE ID_Convertion = ${conversionId}
        `;
        if (!rows.length) {
            return { success: false, error: "Conversion non trouvee" };
        }

        const row = rows[0];
        const conversion = {
            id: row.ID_Convertion,
            dateConvertion: row.Date_Convertion,
            dateCreation: row.Date_Creation,
            entite: row.Entite,
        };

        return { success: true, data: conversion };
    } catch (error) {
        console.error("Erreur lors de la recuperation de la conversion:", error);
        return { success: false, error: "Impossible de recuperer la conversion" };
    }
}

/**
 * Creer une nouvelle conversion
 * Seule la date est requise, l'entite 0 et la session courante sont utilises.
 */
export async function createConversion(data: any) {
    try {
        const session = await getSession();
        if (!session.user) {
            return { success: false, error: "Non authentifie" };
        }

        // Compatibilite de payload:
        // - ancien format: Date_Convertion
        // - nouveau format: dateConvertion
        const rawDateConvertion = data?.dateConvertion ?? data?.Date_Convertion;
        if (!rawDateConvertion) {
            return { success: false, error: "Date de conversion obligatoire" };
        }

        // Validation stricte de date:
        // l'erreur initiale venait d'une date invalide qui partait en SQL.
        const dateConvertion =
            rawDateConvertion instanceof Date
                ? new Date(rawDateConvertion)
                : new Date(String(rawDateConvertion));

        if (Number.isNaN(dateConvertion.getTime())) {
            return { success: false, error: "Date de conversion invalide" };
        }

        // Conversion journaliere: on normalise a minuit.
        dateConvertion.setHours(0, 0, 0, 0);

        const sessionId = Number(session.user.id);
        if (!Number.isInteger(sessionId)) {
            return { success: false, error: "Session utilisateur invalide" };
        }

        const dateCreation = new Date();

        // Creation + recuperation fiable de l'ID insere.
        // OUTPUT ... INTO evite un SELECT TOP 1 fragile.
        const newConversion = await prisma.$queryRaw<Array<{ ID: number }>>`
            DECLARE @Inserted TABLE (ID INT);

            INSERT INTO TConvertions ([Date Convertion], [Entite], [Session], [Date Creation])
            OUTPUT INSERTED.[ID Convertion] INTO @Inserted (ID)
            VALUES (${dateConvertion}, ${0}, ${sessionId}, ${dateCreation});

            SELECT ID FROM @Inserted;
        `;

        const conversionId = newConversion[0]?.ID;
        if (!conversionId) {
            throw new Error("Echec de creation de la conversion");
        }

        // Ajouter automatiquement le taux 1.0 pour la devise locale (ID 0).
        await prisma.$executeRaw`
            INSERT INTO TTauxChange ([Convertion], [Devise], [Taux Change], [Session], [Date Creation])
            VALUES (${conversionId}, ${0}, ${1.0}, ${sessionId}, ${dateCreation})
        `;

        revalidatePath("/conversion");
        return { success: true, data: { id: conversionId } };
    } catch (error) {
        console.error("Erreur creation conversion:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur lors de la creation",
        };
    }
}

/**
 * Supprimer une conversion
 */
export async function deleteConversion(id: string) {
    try {
        const conversionId = Number(id);
        if (!Number.isInteger(conversionId)) {
            return { success: false, error: "ID invalide" };
        }

        await prisma.$executeRaw`
            DELETE FROM TConvertions
            WHERE [ID Convertion] = ${conversionId}
        `;

        revalidatePath("/conversion");
        return { success: true };
    } catch (error) {
        console.error("Erreur suppression conversion:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur lors de la suppression",
        };
    }
}
