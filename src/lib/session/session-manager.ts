/**
 * Session Manager - Gestion des sessions SQL Server
 * 
 * Ce module gère la liaison entre les sessions Next.js et les sessions SQL Server.
 * Chaque opération sur la base de données doit avoir un sessionId pour l'audit.
 */

import { PrismaClient } from '@/generated/prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

/**
 * Créer une nouvelle session SQL Server pour un utilisateur
 * 
 * @param utilisateurId - ID de l'utilisateur
 * @returns ID de la session créée
 */

export async function createSession(utilisateurId: number): Promise<number> {
    const session = await prisma.tSessions.create({
        data: {
            Utilisateur: utilisateurId,
            Debut_Session: new Date(),
            Fin_Session: new Date(),
        },
    });

    return session.ID_Session;
}


/**
 * Fermer une session SQL Server
 * 
 * @param sessionId - ID de la session à fermer
 */
export async function closeSession(sessionId: number): Promise<void> {
    await prisma.tSessions.update({
        where: { ID_Session: sessionId },
        data: {
            Fin_Session: new Date(),
        },
    });
}

/**
 * Obtenir la session courante depuis les cookies Next.js
 * 
 * @returns ID de la session ou null
 */
export async function getCurrentSessionId(): Promise<number | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('sql_session_id');

    if (!sessionCookie) {
        return null;
    }

    return parseInt(sessionCookie.value, 10);
}

/**
 * Définir la session courante dans les cookies Next.js
 * 
 * @param sessionId - ID de la session
 */
export async function setCurrentSessionId(sessionId: number): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set('sql_session_id', sessionId.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 jours
    });
}

/**
 * Supprimer la session courante des cookies
 */
export async function clearCurrentSessionId(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete('sql_session_id');
}

/**
 * Obtenir ou créer une session pour l'utilisateur courant
 * 
 * @param utilisateurId - ID de l'utilisateur
 * @returns ID de la session
 */
export async function getOrCreateSession(utilisateurId: number): Promise<number> {
    let sessionId = await getCurrentSessionId();

    if (!sessionId) {
        // Créer une nouvelle session
        sessionId = await createSession(utilisateurId);
        await setCurrentSessionId(sessionId);
    } else {
        // Vérifier que la session existe et appartient à l'utilisateur
        const session = await prisma.tSessions.findFirst({
            where: {
                ID_Session: sessionId,
                Utilisateur: utilisateurId,
                Fin_Session: {
                    equals: prisma.tSessions.fields.Debut_Session
                }, // Session active
            },
        });

        if (!session) {
            // Session invalide, créer une nouvelle
            sessionId = await createSession(utilisateurId);
            await setCurrentSessionId(sessionId);
        }
    }

    return sessionId;
}

/**
 * Wrapper pour exécuter une fonction avec un sessionId
 * Utile pour les Server Actions
 * 
 * @param utilisateurId - ID de l'utilisateur
 * @param fn - Fonction à exécuter avec le sessionId
 * @returns Résultat de la fonction
 */
export async function withSession<T>(
    utilisateurId: number,
    fn: (sessionId: number) => Promise<T>
): Promise<T> {
    const sessionId = await getOrCreateSession(utilisateurId);
    return fn(sessionId);
}

/**
 * Obtenir le sessionId pour l'utilisateur courant
 * À utiliser dans les Server Actions
 * 
 * @param utilisateurId - ID de l'utilisateur
 * @returns ID de la session
 */
export async function getSessionId(utilisateurId: number): Promise<number> {
    return getOrCreateSession(utilisateurId);
}

export default {
    createSession,
    closeSession,
    getCurrentSessionId,
    setCurrentSessionId,
    clearCurrentSessionId,
    getOrCreateSession,
    withSession,
    getSessionId,
};
