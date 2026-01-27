"use server";

import auth from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export interface SearchResult {
    id: string;
    title: string;
    subtitle?: string;
    type: 'client' | 'dossier' | 'hscode';
    url: string;
}

/**
 * Recherche globale dans clients, dossiers et HS codes
 */
export async function globalSearch(query: string): Promise<{ success: boolean; data?: SearchResult[]; error?: string }> {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            throw new Error("Missing User Session");
        }

        if (!query || query.trim().length < 2) {
            return { success: true, data: [] };
        }

        const searchTerm = query.trim().toLowerCase();
        const results: SearchResult[] = [];

        // Recherche dans les clients
        const clients = await prisma.vClients.findMany({
            where: {
                OR: [
                    { Nom_Client: { contains: searchTerm } },
                ],
            },
            take: 5,
            orderBy: { Nom_Client: 'asc' },
            select: {
                ID_Client: true,
                Nom_Client: true,
            },
        });

        clients.forEach(client => {
            results.push({
                id: `client-${client.ID_Client}`,
                title: client.Nom_Client,
                subtitle: "Client",
                type: 'client',
                url: `/client/${client.ID_Client}`,
            });
        });

        const dossiers = await prisma.vDossiers.findMany({
            where: {
                OR: [
                    { No_Dossier: { contains: searchTerm } },
                    { No_OT: { contains: searchTerm } },
                    { Nom_Client: { contains: searchTerm } },
                ],
            },
            take: 5,
            orderBy: { Date_Creation: 'desc' },
            select: {
                ID_Dossier: true,
                No_Dossier: true,
                No_OT: true,
                Nom_Client: true,
                Libelle_Type_Dossier: true,
            },
        });


        dossiers.forEach(dossier => {
            results.push({
                id: `dossier-${dossier.ID_Dossier}`,
                title: dossier.No_Dossier || `Dossier ${dossier.ID_Dossier}`,
                subtitle: `${dossier.Nom_Client} • ${dossier.Libelle_Type_Dossier}`,
                type: 'dossier',
                url: `/dossiers/${dossier.ID_Dossier}`,
            });
        });

        // Recherche dans les HS codes
        console.log('📦 [globalSearch] Recherche HS codes...');
        const hscodes = await prisma.vHSCodes.findMany({
            where: {
                OR: [
                    { HS_Code: { contains: searchTerm } },
                    { Libelle_HS_Code: { contains: searchTerm } },
                ],
            },
            take: 5,
            orderBy: { HS_Code: 'asc' },
            select: {
                ID_HS_Code: true,
                HS_Code: true,
                Libelle_HS_Code: true,
            },
        });


        hscodes.forEach(hscode => {
            results.push({
                id: `hscode-${hscode.ID_HS_Code}`,
                title: hscode.HS_Code,
                subtitle: hscode.Libelle_HS_Code,
                type: 'hscode',
                url: `/hscode/${hscode.ID_HS_Code}`,
            });
        });

        // Limiter à 15 résultats maximum
        const limitedResults = results.slice(0, 15);

        return { success: true, data: limitedResults };
    } catch (error) {
        console.error("globalSearch error:", error);
        return { success: false, error: "Erreur lors de la recherche" };
    }
}