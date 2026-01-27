/**
 * Auth adapter
 * Expose une API compatible avec Better Auth
 * backed by our custom SQL-based auth system
 */


import { getSession } from '@/modules/auth/server/actions';

const auth = {
    api: {
        async getSession(_options?: any) {
            const session = await getSession();

            if (!session.user) {
                return null;
            }

            // Retourner un format compatible avec Better Auth
            return {
                user: {
                    id: session.user.id.toString(),
                    email: session.user.codeUtilisateur,
                    name: session.user.nomUtilisateur,
                },
                session: {
                    userId: session.user.id.toString(),
                },
            };
        },
    },
};

export default auth;