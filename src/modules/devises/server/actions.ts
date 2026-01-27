"use server";

import  auth  from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

/**
 * Crée une nouvelle devise
 */
export async function createDevise(data: any) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            throw new Error("Missing User Session");
        }

        const devise = await prisma.tDevises.create({
            data: {
                Code_Devise: data.code,
                Libelle_Devise: data.libelle,
                Decimales: data.decimal || 2,
                Devise_Inactive: false,
                Session: parseInt(session.user.id),
                Date_Creation: new Date(),
            },
        });

        revalidatePath("/devises");
        return { success: true, data: devise };
    } catch (error) {
        return { success: false, error };
    }
}

/**
 * Récupère une devise par ID via VDevises
 */
export async function getDeviseById(id: string) {
    try {
        const devises = await prisma.$queryRaw<any[]>`
            SELECT * FROM VDevises
            WHERE ID_Devise = ${parseInt(id)}
        `;

        if (!devises || devises.length === 0) {
            return { success: false, error: 'Devise non trouvée' };
        }

        return { success: true, data: devises[0] };
    } catch (error) {
        return { success: false, error };
    }
}

/**
 * Récupère toutes les devises via VDevises
 */
export async function getAllDevises(
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

        const whereCondition: any = {};

        if (search) {
            whereCondition.OR = [
                { Code_Devise: { contains: search } },
                { Libelle_Devise: { contains: search } }
            ];
        }

        const devises = await prisma.vDevises.findMany({
            where: whereCondition,
            orderBy: { Libelle_Devise: 'asc' },
            distinct: ['ID_Devise']
        });

        return { success: true, data: devises, total: devises.length };
    } catch (error) {
        console.error("getAllDevises error:", error);
        return { success: false, error };
    }
}

/**
 * Met à jour une devise
 */
export async function updateDevise(id: string, data: any) {
    try {
        const devise = await prisma.tDevises.update({
            where: { ID_Devise: parseInt(id) },
            data: {
                ...(data.Code_Devise && { Code_Devise: data.Code_Devise }),
                ...(data.Libelle_Devise && { Libelle_Devise: data.Libelle_Devise }),
                ...(data.Decimales !== undefined && { Decimales: data.Decimales }),
            },
        });

        revalidatePath(`/devises/${id}`);
        revalidatePath("/devises");
        return { success: true, data: devise };
    } catch (error) {
        return { success: false, error };
    }
}

/**
 * Supprime une devise
 */
export async function deleteDevise(id: string) {
    try {
        const devise = await prisma.tDevises.delete({
            where: { ID_Devise: parseInt(id) },
        });

        revalidatePath("/devises");
        return { success: true, data: devise };
    } catch (error) {
        return { success: false, error };
    }
}

/**
 * Récupère toutes les devises pour le sélecteur
 */
export async function getAllDevisesForSelect() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            throw new Error("Missing User Session");
        }

        const devises = await prisma.$queryRaw<any[]>`
            SELECT ID_Devise as id, Code_Devise as code, Libelle_Devise as libelle
            FROM VDevises
            ORDER BY Libelle_Devise ASC
        `;

        return { success: true, data: devises };
    } catch (error) {
        return { success: false, error };
    }
}