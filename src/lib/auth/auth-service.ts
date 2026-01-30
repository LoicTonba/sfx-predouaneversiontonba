/**
 * Service d'authentification simplifié utilisant TUtilisateurs et TSessions
 * Les utilisateurs sont créés directement dans SQL Server, pas via l'interface
 */

import prisma from '../prisma';
import { createSession, closeSession } from '../session/session-manager';
import { getPermissionsUtilisateur } from '../database/functions';

export interface AuthUser {
    id: number;
    codeUtilisateur: string;
    nomUtilisateur: string;
    sessionId: number;
    permissions: number[];
}

/**
 * Authentifier un utilisateur par son code
 * Les utilisateurs doivent déjà exister dans TUtilisateurs
 */
export async function signIn(codeUtilisateur: string): Promise<AuthUser> {
    // Trouver l'utilisateur dans la base
    const user = await prisma.tUtilisateurs.findFirst({
        where: { Code_Utilisateur: codeUtilisateur },
    });

    if (!user) {
        throw new Error('Code utilisateur invalide');
    }

    // Créer une nouvelle session SQL Server
    const sessionId = await createSession(user.ID_Utilisateur);

    // Obtenir les permissions de l'utilisateur
    const permissions = await getPermissionsUtilisateur(user.ID_Utilisateur);

    return {
        id: user.ID_Utilisateur,
        codeUtilisateur: user.Code_Utilisateur,
        nomUtilisateur: user.Nom_Utilisateur,
        sessionId,
        permissions,
    };
}

/**
 * Déconnecter un utilisateur
 */
export async function signOut(sessionId: number): Promise<void> {
    await closeSession(sessionId);
}

/**
 * Obtenir un utilisateur par ID
 */
export async function getUserById(userId: number): Promise<AuthUser | null> {
    const user = await prisma.tUtilisateurs.findFirst({
        where: { ID_Utilisateur: userId },
    });

    if (!user) {
        return null;
    }

    // Obtenir la session active
    const session = await prisma.tSessions.findFirst({
        where: {
            Utilisateur: userId,
            Fin_Session: {
                equals: new Date('1900-01-01') // ou une autre valeur par défaut qui représente "pas terminé"
            }
        },
        orderBy: {
            Debut_Session: 'desc',
        },
    });

    if (!session) {
        return null;
    }

    // Obtenir les permissions
    const permissions = await getPermissionsUtilisateur(userId);

    return {
        id: user.ID_Utilisateur,
        codeUtilisateur: user.Code_Utilisateur,
        nomUtilisateur: user.Nom_Utilisateur,
        sessionId: session.ID_Session,
        permissions,
    };
}

/**
 * Obtenir un utilisateur par code
 */
export async function getUserByCode(codeUtilisateur: string): Promise<AuthUser | null> {
    const user = await prisma.tUtilisateurs.findFirst({
        where: { Code_Utilisateur : codeUtilisateur },
    });

    if (!user) {
        return null;
    }

    return getUserById(user.ID_Utilisateur);
}

/**
 * Vérifier si un utilisateur existe
 */
export async function userExists(codeUtilisateur: string): Promise<boolean> {
    const user = await prisma.tUtilisateurs.findFirst({
        where: { Code_Utilisateur : codeUtilisateur },
    });

    return !!user;
}

export default {
    signIn,
    signOut,
    getUserById,
    getUserByCode,
    userExists,
};
