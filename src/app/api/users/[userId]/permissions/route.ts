/**
 * API Route pour obtenir les permissions d'un utilisateur
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPermissionsUtilisateur } from '@/lib/database/functions';
import { getSession } from '@/modules/auth/server/actions';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        // Vérifier l'authentification avec notre système personnalisé
        const session = await getSession();

        if (!session.user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const { userId: userIdParam } = await params;
        const userId = parseInt(userIdParam, 10);

        // Vérifier que l'utilisateur demande ses propres permissions
        if (session.user.id !== userId) {
            // TODO: Vérifier si l'utilisateur a la permission de voir les permissions des autres
            return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
        }

        // Obtenir les permissions via la fonction SQL Server
        const permissions = await getPermissionsUtilisateur(userId);

        return NextResponse.json({ permissions });
    } catch (error) {
        console.error('Erreur lors de la récupération des permissions:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}