"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getSession } from "@/modules/auth/server/actions";

/**
 * Récupérer toutes les conversions via VConvertions
 */
export async function getAllConversions() {
    try {
        const conversions = await prisma.$queryRaw<any[]>`
            SELECT * FROM VConvertions
            ORDER BY Date_Convertion DESC
        `;
        
        return { success: true, data: conversions };
    } catch (error) {
        console.error("Erreur lors de la récupération des conversions:", error);
        return { success: false, error: "Impossible de récupérer les conversions" };
    }
}

/**
 * Récupérer une conversion par ID via VConvertions
 */
export async function getConversionById(id: string) {
    try {
        const conversionId = parseInt(id);
        if (isNaN(conversionId)) {
            return { success: false, error: "ID invalide" };
        }

        const conversions = await prisma.$queryRaw<any[]>`
            SELECT * FROM VConvertions
            WHERE ID_Convertion = ${conversionId}
        `;

        if (!conversions || conversions.length === 0) {
            return { success: false, error: "Conversion non trouvée" };
        }

        return { success: true, data: conversions[0] };
    } catch (error) {
        console.error("Erreur lors de la récupération de la conversion:", error);
        return { success: false, error: "Impossible de récupérer la conversion" };
    }
}

/**
 * Créer une nouvelle conversion
 * Seule la date est requise, l'entité 0 (DEFAULT ENTITY) et la session courante sont utilisés
 */
export async function createConversion(data: any) {
    try {
        const session = await getSession();
        if (!session.user) {
            return { success: false, error: "Non authentifié" };
        }

        // Créer la date de conversion sans les heures/minutes/secondes en heure locale
        const dateConvertion = new Date(data.dateConvertion);
        dateConvertion.setHours(0, 0, 0, 0); // Mettre à 00:00:00.000 en heure locale
        
        const dateCreation = new Date();

        // Créer la conversion
        const result = await prisma.$executeRaw`
            INSERT INTO TConvertions ([Date Convertion], [Entite], [Session], [Date Creation])
            VALUES (${dateConvertion}, 0, ${session.user.id}, ${dateCreation})
        `;

        // Récupérer l'ID de la conversion créée
        const newConversion = await prisma.$queryRaw<Array<{ID: number}>>`
            SELECT TOP 1 [ID Convertion] as ID
            FROM TConvertions 
            WHERE [Date Convertion] = ${dateConvertion} AND [Entite] = 0
            ORDER BY [ID Convertion] DESC
        `;

        if (newConversion.length > 0) {
            const conversionId = newConversion[0].ID;
            
            // Ajouter automatiquement le taux 1.0 pour la devise locale (ID 0)
            await prisma.$executeRaw`
                INSERT INTO TTauxChange ([Convertion], [Devise], [Taux Change], [Session], [Date Creation])
                VALUES (${conversionId}, 0, 1.0, ${session.user.id}, ${dateCreation})
            `;
        }

        revalidatePath("/conversion");
        return { success: true };
    } catch (error) {
        console.error("Erreur création conversion:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur lors de la création"
        };
    }
}

/**
 * Supprimer une conversion
 */
export async function deleteConversion(id: string) {
    try {
        const conversionId = parseInt(id);
        if (isNaN(conversionId)) {
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
            error: error instanceof Error ? error.message : "Erreur lors de la suppression"
        };
    }
}