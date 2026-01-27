"use server";

import auth from "@/lib/auth";     // Système d'authentification pour sécuriser les actions
import prisma from "@/lib/prisma";     // Client Prisma pour les interactions avec la base de données
import { headers } from "next/headers"; // Fonction Next.js pour récupérer les en-têtes HTTP

/**
 * ============================================================================
 * FONCTION : associateRegimesToClient
 * ============================================================================
 * Rôle global : Associe des régimes douaniers existants à un client spécifique.
 * Vérifie l'existence des régimes, évite les doublons et crée les associations.
 * 
 * Paramètres :
 * @param regimes - Tableau des régimes à associer { code: string, ratio: number }
 * @param clientId - ID du client auquel associer les régimes
 * 
 * Retour : Objet { success: boolean, data: { associated, alreadyAssociated, total, errors }, error?: string }
 * ============================================================================
 */
export async function associateRegimesToClient(
    regimes: Array<{ code: string; ratio: number }>,
    clientId: number
) {
    try {
        // --------------------------------------------------------------------
        // 1️⃣ VÉRIFICATION DE L'AUTHENTIFICATION
        // --------------------------------------------------------------------
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            throw new Error("Missing User Session");
        }

        // --------------------------------------------------------------------
        // 2️⃣ INITIALISATION DES COMPTEURS
        // --------------------------------------------------------------------
        const associated = [];      // Régimes nouvellement associés
        const errors = [];          // Erreurs rencontrées

        // --------------------------------------------------------------------
        // 3️⃣ TRAITEMENT DE CHAQUE RÉGIME
        // --------------------------------------------------------------------
        for (const regime of regimes) {
            try {
                // Conversion du ratio en taux DC (0-1 au lieu de 0-100)
                const tauxDC = regime.ratio / 100;

                // ----------------------------------------------------------------
                // 3.1️⃣ GÉNÉRATION DU LIBELLÉ DU RÉGIME
                // ----------------------------------------------------------------
                // Génère le libellé du régime selon le ratio (sans préfixe pour correspondre à la BD)
                let libelle: string;
                if (regime.ratio === 0) {
                    libelle = 'EXO';  // Exonération complète
                } else if (regime.ratio === 100) {
                    libelle = '100% DC';  // 100% Droits de Douane
                } else {
                    // Calcul des pourcentages TR et DC avec 2 décimales
                    const dcPercent = Math.round(regime.ratio * 100) / 100;
                    const trPercent = Math.round((100 - regime.ratio) * 100) / 100;
                    // Format : "XX% TR et YY% DC"
                    libelle = `${trPercent.toFixed(2)}% TR et ${dcPercent.toFixed(2)}% DC`;
                }

                // ----------------------------------------------------------------
                // 3.2️⃣ RECHERCHE DU RÉGIME EXISTANT
                // ----------------------------------------------------------------
                // Cherche le régime existant en essayant plusieurs formats possibles
                const existingRegime = await prisma.tRegimesDeclarations.findFirst({
                    where: {
                        OR: [
                            { Libelle_Regime_Declaration: libelle },                    // Libellé exact
                            { Taux_DC: tauxDC },                                          // Recherche directe par taux DC
                            { Libelle_Regime_Declaration: `${regime.code} ${libelle}` }, // Avec préfixe
                        ]
                    }
                });

                // Si le régime n'existe pas, ajoute une erreur
                if (!existingRegime) {
                    errors.push(`Régime "${libelle}" non trouvé`);
                    continue;  // Passe au régime suivant
                }

                // ----------------------------------------------------------------
                // 3.3️⃣ VÉRIFICATION DE L'ASSOCIATION EXISTANTE
                // ----------------------------------------------------------------
                // Vérifie si l'association entre le client et le régime existe déjà
                const existingAssoc = await prisma.tRegimesClients.findFirst({
                    where: {
                        Client: clientId,
                        Regime_Declaration: existingRegime.ID_Regime_Declaration
                    }
                });

                // Log de débogage pour suivre l'état de l'association
                console.log(`[Association] Régime: ${libelle}, Client: ${clientId}, Régime ID: ${existingRegime.ID_Regime_Declaration}, Existe: ${!!existingAssoc}`);

                if (existingAssoc) {
                    // L'association existe déjà, on l'ajoute au compteur des existants
                    console.log(`[Association] Déjà associé - ID: ${existingAssoc.ID_Regime_Client}`);
                    associated.push({
                        libelle,
                        ratio: regime.ratio,
                        alreadyExists: true  // Marque comme déjà existant
                    });
                    continue;  // Passe au régime suivant
                }

                // ----------------------------------------------------------------
                // 3.4️⃣ CRÉATION DE LA NOUVELLE ASSOCIATION
                // ----------------------------------------------------------------
                console.log(`[Association] Création de l'association...`);
                const newAssoc = await prisma.tRegimesClients.create({
                    data: {
                        Client: clientId,                                    // ID du client
                        Regime_Declaration: existingRegime.ID_Regime_Declaration, // ID du régime
                        Session: parseInt(session.user.id),                // ID de la session utilisateur
                        Date_Creation: new Date(),                         // Date de création
                    },
                });
                console.log(`[Association] Créée avec succès - ID: ${newAssoc.ID_Regime_Client}`);

                // Ajoute le régime nouvellement associé
                associated.push({
                    libelle,
                    ratio: regime.ratio,
                    alreadyExists: false  // Marque comme nouvellement créé
                });
            } catch (error: any) {
                // En cas d'erreur pour un régime, ajoute l'erreur au tableau
                errors.push(`Erreur pour ${regime.code} ${regime.ratio}%: ${error.message}`);
            }
        }

        // --------------------------------------------------------------------
        // 4️⃣ CALCUL DES STATISTIQUES
        // --------------------------------------------------------------------
        const newAssociations = associated.filter(a => !a.alreadyExists).length;  // Nouvelles associations
        const existingAssociations = associated.filter(a => a.alreadyExists).length; // Associations existantes

        // Logs de résumé pour le débogage
        console.log(`[Association] Résumé: ${newAssociations} nouvelles, ${existingAssociations} existantes, ${errors.length} erreurs`);
        if (errors.length > 0) {
            console.log(`[Association] Erreurs:`, errors);
        }

        // --------------------------------------------------------------------
        // 5️⃣ RETOUR DES RÉSULTATS
        // --------------------------------------------------------------------
        return {
            success: true,
            data: {
                associated: newAssociations,      // Nombre de nouvelles associations
                alreadyAssociated: existingAssociations, // Nombre d'associations existantes
                total: associated.length,        // Nombre total traité
                errors: errors.length > 0 ? errors : undefined  // Erreurs si présentes
            }
        };
    } catch (error) {
        console.error("associateRegimesToClient error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur"
        };
    }
}

/**
 * ============================================================================
 * FONCTION : getClientName
 * ============================================================================
 * Rôle global : Récupère le nom d'un client à partir de son ID.
 * Utilisé pour l'affichage dans l'interface utilisateur.
 * 
 * Paramètre :
 * @param clientId - ID du client dont on veut le nom
 * 
 * Retour : Objet { success: boolean, data: string }
 * ============================================================================
 */
export async function getClientName(clientId: number) {
    try {
        // --------------------------------------------------------------------
        // 1️⃣ RECHERCHE DU CLIENT
        // --------------------------------------------------------------------
        const client = await prisma.tClients.findUnique({
            where: { ID_Client: clientId },     // Filtre par ID du client
            select: { Nom_Client: true }        // Sélectionne uniquement le nom
        });

        // --------------------------------------------------------------------
        // 2️⃣ RETOUR DU RÉSULTAT
        // --------------------------------------------------------------------
        // Retourne le nom du client ou un fallback si non trouvé
        return {
            success: true,
            data: client?.Nom_Client || `Client ${clientId}`  // Fallback : "Client [ID]"
        };
    } catch (error) {
        // En cas d'erreur, retourne un fallback avec l'ID
        return {
            success: false,
            data: `Client ${clientId}`  // Même en cas d'erreur, on retourne un fallback
        };
    }
}