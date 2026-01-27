"use server";

// ============================================================================
// MODULE CREATE-MISSING-VALUES-ACTIONS.TS - CRÉATION VALEURS MANQUANTES
// ============================================================================
// Rôle global : Ce fichier contient les actions serveur pour créer dynamiquement
// les valeurs manquantes détectées lors de l'import Excel (devises, pays, HS codes,
// régimes douaniers). Il permet de compléter la base de données avec les nouvelles
// références nécessaires.
//
// Architecture :
// - Crée les entités manquantes dans les tables de référence
// - Associe automatiquement les nouvelles valeurs au client
// - Inclut l'authentification utilisateur pour sécuriser les actions
// - Gère les transactions pour garantir l'intégrité des données
// ============================================================================

// Import des bibliothèques nécessaires
import auth  from "@/lib/auth";     // Système d'authentification pour sécuriser les actions
import prisma from "@/lib/prisma";     // Client Prisma pour les interactions avec la base de données
import { headers } from "next/headers"; // Fonction Next.js pour récupérer les en-têtes HTTP

/**
 * ============================================================================
 * FONCTION : createMissingDevises
 * ============================================================================
 * Rôle global : Crée les devises manquantes détectées lors de l'import Excel.
 * Génère automatiquement les libellés et crée les associations avec le client.
 * 
 * Paramètres :
 * @param devises - Tableau des codes devises à créer (ex: ['EUR', 'USD'])
 * @param clientId - ID du client auquel associer les nouvelles devises
 * 
 * Retour : Objet { success: boolean, data: { created, total }, error?: string }
 * ============================================================================
 */
export async function createMissingDevises(devises: string[]) {
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

        const created: any[] = [];
        const skipped: string[] = [];
        
        for (const devise of devises) {
            // Vérifier si la devise existe déjà
            const existing = await prisma.tDevises.findFirst({
                where: { Code_Devise: devise }
            });

            if (existing) {
                skipped.push(devise);
                continue;
            }

            // --------------------------------------------------------------------
            // 2️⃣ CRÉATION DES DEVISES MANQUANTES
            // --------------------------------------------------------------------
            const result = await prisma.tDevises.create({
                data: {
                    Code_Devise: devise,
                    Libelle_Devise: devise,
                    Decimales: 0,
                    Session: parseInt(session.user.id),
                    Date_Creation: new Date(),
                },
            });
            created.push(result);
        }

        // --------------------------------------------------------------------
        // 3️⃣ RETOUR DES RÉSULTATS
        // --------------------------------------------------------------------
        return { 
            success: true, 
            data: created,
            skipped: skipped.length > 0 ? skipped : undefined
        };
    } catch (error) {
        console.error("createMissingDevises error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Erreur" };
    }
}

/**
 * ============================================================================
 * FONCTION : createMissingPays
 * ============================================================================
 * Rôle global : Crée les pays manquants détectés lors de l'import Excel.
 * Génère automatiquement les libellés et crée les associations avec le client.
 * 
 * Paramètres :
 * @param pays - Tableau des codes pays à créer (ex: ['FR', 'DE'])
 * @param clientId - ID du client auquel associer les nouveaux pays
 * 
 * Retour : Objet { success: boolean, data: { created, total }, error?: string }
 * ============================================================================
 */
export async function createMissingPays(pays: string[]) {
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

        const created: any[] = [];
        const skipped: string[] = [];
        
        for (const p of pays) {
            // Vérifier si le pays existe déjà
            const existing = await prisma.tPays.findFirst({
                where: { Code_Pays: p }
            });

            if (existing) {
                skipped.push(p);
                continue;
            }

            // --------------------------------------------------------------------
            // 2️⃣ CRÉATION DES PAYS MANQUANTS
            // --------------------------------------------------------------------
            const result = await prisma.tPays.create({
                data: {
                    Code_Pays: p,
                    Libelle_Pays: p,
                    Devise_Locale: 0, // Devise par défaut 
                    Session: parseInt(session.user.id),
                    Date_Creation: new Date(),
                },
            });
            created.push(result);
        }

        // --------------------------------------------------------------------
        // 3️⃣ RETOUR DES RÉSULTATS
        // --------------------------------------------------------------------
        return { 
            success: true, 
            data: created,
            skipped: skipped.length > 0 ? skipped : undefined
        };
    } catch (error) {
        console.error("createMissingPays error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Erreur" };
    }
}

/**
 * ============================================================================
 * FONCTION : createMissingHSCodes
 * ============================================================================
 * Rôle global : Crée les HS codes manquants détectés lors de l'import Excel.
 * Génère automatiquement les libellés avec une clé d'upload unique.
 * 
 * Paramètres :
 * @param hscodes - Tableau des HS codes à créer (ex: ['1234567890'])
 * @param clientId - ID du client auquel associer les nouveaux HS codes
 * 
 * Retour : Objet { success: boolean, data: { created, total }, error?: string }
 * ============================================================================
 */
export async function createMissingHSCodes(hscodes: string[]) {
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

        const created: any[] = [];
        const skipped: string[] = [];
        
        for (const hscode of hscodes) {
            // Vérifier si le HS Code existe déjà
            const existing = await prisma.tHSCodes.findFirst({
                where: { HS_Code: hscode }
            });

            if (existing) {
                skipped.push(hscode);
                continue;
            }

            // --------------------------------------------------------------------
            // 2️⃣ CRÉATION DES HS CODES MANQUANTS
            // --------------------------------------------------------------------
            const result = await prisma.tHSCodes.create({
                data: {
                    HS_Code: hscode,
                    Libelle_HS_Code: `HS Code ${hscode}`,
                    UploadKey: `AUTO_${hscode}`,
                    Session: parseInt(session.user.id),
                    Date_Creation: new Date(),
                },
            });
            created.push(result);
        }

        // --------------------------------------------------------------------
        // 3️⃣ RETOUR DES RÉSULTATS
        // --------------------------------------------------------------------
        return { 
            success: true, 
            data: created,
            skipped: skipped.length > 0 ? skipped : undefined
        };
    } catch (error) {
        console.error("createMissingHSCodes error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Erreur" };
    }
}

/**
 * ============================================================================
 * FONCTION : createMissingRegimes
 * ============================================================================
 * Rôle global : Crée les régimes douaniers manquants détectés lors de l'import Excel.
 * Génère les libellés selon les ratios et associe automatiquement au client.
 * 
 * Paramètres :
 * @param regimes - Tableau des régimes à créer { code: string, ratio: number }
 * @param clientId - ID du client auquel associer les nouveaux régimes
 * 
 * Retour : Objet { success: boolean, data: { created, total }, error?: string }
 * ============================================================================
 */
export async function createMissingRegimes(
    regimes: Array<{ code: string; ratio: number }>,
    clientId?: number
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

        const created: any[] = [];
        const skipped: string[] = [];
        
        for (const regime of regimes) {
            // Conversion du ratio en taux DC (0-1 au lieu de 0-100)
            const tauxDC = regime.ratio / 100;

            // ----------------------------------------------------------------
            // 2.1️⃣ GÉNÉRATION DU LIBELLÉ DU RÉGIME
            // ----------------------------------------------------------------
            // Génère le libellé selon le ratio (sans préfixe pour correspondre à la BD)
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
            // 2.2️⃣ VÉRIFICATION SI LE RÉGIME EXISTE DÉJÀ
            // ----------------------------------------------------------------
            // Vérifie si le régime existe déjà pour éviter les doublons
            const existingRegime = await prisma.tRegimesDeclarations.findFirst({
                where: { Libelle_Regime_Declaration: libelle }
            });

            const targetClientId = clientId || parseInt(session.user.id);

            if (existingRegime) {
                // ----------------------------------------------------------------
                // 2.3️⃣ CRÉATION DE L'ASSOCIATION CLIENT-RÉGIME (RÉGIME EXISTANT)
                // ----------------------------------------------------------------
                // Le régime existe, vérifier s'il est déjà associé au client
                const existingAssoc = await prisma.tRegimesClients.findFirst({
                    where: {
                        Client: targetClientId,
                        Regime_Declaration: existingRegime.ID_Regime_Declaration
                    }
                });

                if (!existingAssoc) {
                    // Créer l'association client-régime si elle n'existe pas
                    await prisma.tRegimesClients.create({
                        data: {
                            Client: targetClientId,                                    // ID du client
                            Regime_Declaration: existingRegime.ID_Regime_Declaration, // ID du régime
                            Session: parseInt(session.user.id),                     // ID de la session utilisateur
                            Date_Creation: new Date(),                              // Date de création
                        },
                    });
                    created.push(existingRegime);
                }
                continue;  // Passe au régime suivant
            }

            // ----------------------------------------------------------------
            // 2.4️⃣ CRÉATION DU NOUVEAU RÉGIME
            // ----------------------------------------------------------------
            // Trouver le régime douanier par défaut (ex: IM4)
            const regimeDouanier = await prisma.tRegimesDouaniers.findFirst({
                where: { Code_Regime_Douanier: regime.code }
            });

            if (!regimeDouanier) {
                console.warn(`Régime douanier ${regime.code} non trouvé`);
                continue;  // Passe au régime suivant
            }

            // Crée le nouveau régime de déclaration
            const result = await prisma.tRegimesDeclarations.create({
                data: {
                    Libelle_Regime_Declaration: libelle,                    // Libellé généré
                    Taux_DC: tauxDC,                                        // Taux DC (0-1)
                    Regime_Douanier: regimeDouanier.ID_Regime_Douanier,    // ID du régime douanier
                    Session: parseInt(session.user.id),                     // ID de la session utilisateur
                    Date_Creation: new Date(),                              // Date de création
                },
            });
            
            // ----------------------------------------------------------------
            // 2.5️⃣ CRÉATION DE L'ASSOCIATION CLIENT-RÉGIME (NOUVEAU RÉGIME)
            // ----------------------------------------------------------------
            // Associe automatiquement le nouveau régime au client
            await prisma.tRegimesClients.create({
                data: {
                    Client: targetClientId,                                    // ID du client
                    Regime_Declaration: result.ID_Regime_Declaration,        // ID du nouveau régime
                    Session: parseInt(session.user.id),                     // ID de la session utilisateur
                    Date_Creation: new Date(),                              // Date de création
                },
            });
            
            created.push(result);  // Ajoute le régime créé à la liste
        }

        // --------------------------------------------------------------------
        // 3️⃣ RETOUR DES RÉSULTATS
        // --------------------------------------------------------------------
        return { 
            success: true, 
            data: created,
            skipped: skipped.length > 0 ? skipped : undefined
        };
    } catch (error) {
        console.error("createMissingRegimes error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Erreur" };
    }
}