"use server";

import  auth  from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

/**
 * Récupère les statistiques réelles du dashboard
 */
export async function getDashboardStats() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            throw new Error("Missing User Session");
        }

        console.log('🔍 [getDashboardStats] Début du calcul des statistiques...');

        // Statistiques des dossiers - utiliser Prisma natif
        console.log('📁 [getDashboardStats] Calcul des dossiers...');
        const totalDossiers = await prisma.vDossiers.count();
        console.log('📁 [getDashboardStats] Total dossiers:', totalDossiers);
        
        const dossiersEnCours = await prisma.vDossiers.count({
            where: {
                ID_Statut_Dossier: { not: -1 }
            }
        });
        console.log('📁 [getDashboardStats] Dossiers en cours:', dossiersEnCours);
        
        const dossiersTermines = await prisma.vDossiers.count({
            where: {
                ID_Statut_Dossier: -1
            }
        });
        console.log('📁 [getDashboardStats] Dossiers terminés:', dossiersTermines);

        // Statistiques des colisages
        console.log('📦 [getDashboardStats] Calcul des colisages...');
        const totalColisages = await prisma.tColisageDossiers.count();
        console.log('📦 [getDashboardStats] Total colisages:', totalColisages);

        // Statistiques des clients
        console.log('👥 [getDashboardStats] Calcul des clients...');
        const totalClients = await prisma.vClients.count();
        console.log('👥 [getDashboardStats] Total clients:', totalClients);
        
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        console.log('📅 [getDashboardStats] Début du mois:', startOfMonth);
        
        const clientsCeMois = await prisma.vClients.count({
            where: {
                Date_Creation: {
                    gte: startOfMonth
                }
            }
        });
        console.log('👥 [getDashboardStats] Clients ce mois:', clientsCeMois);

        // Statistiques des conversions
        console.log('💱 [getDashboardStats] Calcul des conversions...');
        const totalConversions = await prisma.vConvertions.count();
        console.log('💱 [getDashboardStats] Total conversions:', totalConversions);
        
        const conversionsCeMois = await prisma.vConvertions.count({
            where: {
                Date_Creation: {
                    gte: startOfMonth
                }
            }
        });
        console.log('💱 [getDashboardStats] Conversions ce mois:', conversionsCeMois);

        const statsData = {
            dossiers: {
                total: totalDossiers,
                enCours: dossiersEnCours,
                termines: dossiersTermines
            },
            colisages: {
                total: totalColisages
            },
            clients: {
                total: totalClients,
                actifsCeMois: clientsCeMois
            },
            conversions: {
                total: totalConversions,
                ceMois: conversionsCeMois
            }
        };

        console.log('📊 [getDashboardStats] Statistiques calculées:', statsData);

        return {
            success: true,
            data: statsData
        };
    } catch (error) {
        console.error("getDashboardStats error:", error);
        return {
            success: false,
            error: "Erreur lors de la récupération des statistiques"
        };
    }
}

/**
 * Récupère l'activité récente réelle
 */
export async function getRecentActivity() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            throw new Error("Missing User Session");
        }

        // Activité récente des dossiers
        const recentDossiers = await prisma.vDossiers.findMany({
            take: 2,
            orderBy: { Date_Creation: 'desc' },
            select: {
                ID_Dossier: true,
                No_Dossier: true,
                Nom_Client: true,
                Date_Creation: true,
                Libelle_Statut_Dossier: true,
            }
        });

        // Activité récente des conversions
        const recentConversions = await prisma.vConvertions.findMany({
            take: 2,
            orderBy: { Date_Creation: 'desc' },
            select: {
                ID_Convertion: true,
                Date_Convertion: true,
                Date_Creation: true,
            }
        });

        // Combiner et formater l'activité
        const activities = [
            ...recentDossiers.map(d => ({
                id: `dossier-${d.ID_Dossier}`,
                type: 'dossier' as const,
                title: `Dossier ${d.No_Dossier || d.ID_Dossier} - ${d.Nom_Client}`,
                status: d.Libelle_Statut_Dossier?.toLowerCase().includes('complet') ? 'completed' as const : 'processing' as const,
                time: getRelativeTime(d.Date_Creation)
            })),
            ...recentConversions.map(c => ({
                id: `conversion-${c.ID_Convertion}`,
                type: 'conversion' as const,
                title: `Conversion ${c.Date_Convertion ? new Date(c.Date_Convertion ).toLocaleDateString('fr-FR') : c.Date_Convertion }`,
                status: 'completed' as const,
                time: getRelativeTime(c.Date_Creation)
            }))
        ].sort((a, b) => {
            // Trier par temps (plus récent en premier)
            const timeA = parseRelativeTime(a.time);
            const timeB = parseRelativeTime(b.time);
            return timeA - timeB;
        }).slice(0, 4);

        return {
            success: true,
            data: activities
        };
    } catch (error) {
        console.error("getRecentActivity error:", error);
        return {
            success: false,
            error: "Erreur lors de la récupération de l'activité récente"
        };
    }
}

/**
 * Calcule le temps relatif depuis une date
 */
function getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return "À l'instant";
    if (diffMinutes < 60) return `${diffMinutes} min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}j`;
    return new Date(date).toLocaleDateString('fr-FR');
}

/**
 * Parse le temps relatif pour le tri
 */
function parseRelativeTime(timeStr: string): number {
    if (timeStr === "À l'instant") return 0;
    if (timeStr.includes('min')) return parseInt(timeStr);
    if (timeStr.includes('h')) return parseInt(timeStr) * 60;
    if (timeStr.includes('j')) return parseInt(timeStr) * 60 * 24;
    return 999999; // Pour les dates absolues
}