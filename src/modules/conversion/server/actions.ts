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
        console.log("id", id);
        const conversionId = Number(id);
        if (Number.isNaN(conversionId)) {
            return { success: false, error: "ID invalide" };
        }

        const rows = await prisma.$queryRaw<any[]>`
            SELECT * FROM VConvertions
            WHERE ID_Convertion = ${conversionId}
        `;
        if (!rows.length) {
            return { success: false, error: "Conversion non trouvée" };
        }

        const row = rows[0];

         // ✅ NORMALISATION
        const conversion = {
            id: row.ID_Convertion,
            dateConvertion: row.Date_Convertion,
            dateCreation: row.Date_Creation,
            entite: row.Entite,
        };

        console.log("conversion", conversion);

        return { success: true, data: conversion };
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
        if (!session?.user) {
            return { success: false, error: "Non authentifié" };
        }
        if (!data.Date_Convertion) {
            return { success: false, error: "Date de conversion requise" };
        }
        // Créer la date de conversion sans les heures/minutes/secondes en heure locale
        const dateConvertion = new Date(data.Date_Convertion);
        dateConvertion.setHours(0, 0, 0, 0); // Mettre à 00:00:00.000 en heure locale
        
        // Vérifier si une conversion existe déjà pour cette date et entité
        const existingConversion = await prisma.tConvertions.findFirst({
            where: {
                Date_Convertion: dateConvertion,
                Entite: 0,
            },
        });

        if (existingConversion) {
            // Retourner la conversion existante au lieu de créer un doublon
            return { 
                success: true, 
                data: existingConversion,
                message: "Une conversion existe déjà pour cette date"
            };
        }

        // Créer la conversion
        const conversion = await prisma.tConvertions.create({
            data: {
                Date_Convertion: dateConvertion,
                Entite: 0,
                Session: Number(session.user.id),
            },
        });
       
        // taux devise locale
        await prisma.tTauxChange.create({
            data: {
                Convertion: conversion.ID_Convertion,
                Devise: 0,
                Taux_Change: 1,
                Session: Number(session.user.id),
            },
        });

       revalidatePath("/conversion");
      return { success: true, data: conversion };
    } catch (error) {
        console.error("Erreur création conversion:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur lors de la création conversion"
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