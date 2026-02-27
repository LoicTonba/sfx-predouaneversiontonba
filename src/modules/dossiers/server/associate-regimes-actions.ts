"use server";

import auth from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

/**
 * Normalise une valeur de ratio regime vers le format stocke en base.
 *
 * Notes:
 * - L'import envoie normalement un decimal (ex: 0.4851 = 48.51% DC).
 * - Certaines anciennes sources peuvent envoyer un pourcentage (ex: 48.51).
 * - SQL Server stocke [Taux Regime] en DECIMAL(24,3), donc on aligne a 3 decimales.
 */
function normalizeRegimeRatio(input: number): number {
    if (!Number.isFinite(input)) return 0;
    if (input === -2 || input === -1 || input === 0 || input === 1) return input;

    const decimal = input > 1 ? input / 100 : input;
    return Number(decimal.toFixed(3));
}

/**
 * Construit un libelle lisible a partir d'un ratio normalise.
 */
function buildRegimeLibelle(normalizedRatio: number): string {
    if (normalizedRatio === -2) return "TTC";
    if (normalizedRatio === -1) return "100% TR";
    if (normalizedRatio === 0) return "EXO";
    if (normalizedRatio === 1) return "100% DC";

    const dcPercent = normalizedRatio * 100;
    const trPercent = 100 - dcPercent;
    return `${trPercent.toFixed(2)}% TR et ${dcPercent.toFixed(2)}% DC`;
}

/**
 * Cree une association regime-client via SQL brut parametre.
 *
 * Pourquoi SQL brut:
 * - certaines operations create() ne sont pas exposees par le client Prisma genere;
 * - OUTPUT ... INTO permet de recuperer proprement la ligne inseree.
 */
async function insertRegimeClientAssociation(
    clientId: number,
    regimeId: number,
    sessionId: number
) {
    const now = new Date();

    const insertedRows = await prisma.$queryRaw<
        Array<{
            ID_Regime_Client: number;
            Client: number;
            Regime_Declaration: number;
            Session: number;
            Date_Creation: Date;
        }>
    >`
        DECLARE @Inserted TABLE (
            ID_Regime_Client INT,
            Client INT,
            Regime_Declaration INT,
            Session INT,
            Date_Creation DATETIME2(7)
        );

        INSERT INTO dbo.TRegimesClients ([Client], [Regime Declaration], [Session], [Date Creation])
        OUTPUT
            INSERTED.[ID Regime Client],
            INSERTED.[Client],
            INSERTED.[Regime Declaration],
            INSERTED.[Session],
            INSERTED.[Date Creation]
        INTO @Inserted (ID_Regime_Client, Client, Regime_Declaration, Session, Date_Creation)
        VALUES (${clientId}, ${regimeId}, ${sessionId}, ${now});

        SELECT
            I.ID_Regime_Client,
            I.Client,
            I.Regime_Declaration,
            I.Session,
            I.Date_Creation
        FROM @Inserted AS I;
    `;

    const createdAssociation = insertedRows[0];
    if (!createdAssociation) {
        throw new Error("Echec de creation de l'association regime-client");
    }

    return createdAssociation;
}

/**
 * Associe des regimes existants a un client.
 */
export async function associateRegimesToClient(
    regimes: Array<{ code: string; ratio: number }>,
    clientId: number
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            throw new Error("Missing User Session");
        }

        const sessionId = Number(session.user.id);
        if (!Number.isInteger(sessionId)) {
            throw new Error("Session utilisateur invalide");
        }

        const associated: Array<{ libelle: string; ratio: number; alreadyExists: boolean }> = [];
        const errors: string[] = [];

        for (const regime of regimes) {
            try {
                const tauxRegime = normalizeRegimeRatio(regime.ratio);
                const libelle = buildRegimeLibelle(tauxRegime);

                const existingRegime = await prisma.tRegimesDeclarations.findFirst({
                    where: {
                        OR: [
                            { Libelle_Regime_Declaration: libelle },
                            { Taux_Regime: tauxRegime },
                            { Libelle_Regime_Declaration: `${regime.code} ${libelle}` },
                        ],
                    },
                });

                if (!existingRegime) {
                    errors.push(`Regime "${libelle}" non trouve`);
                    continue;
                }

                const existingAssoc = await prisma.tRegimesClients.findFirst({
                    where: {
                        Client: clientId,
                        Regime_Declaration: existingRegime.ID_Regime_Declaration,
                    },
                });

                if (existingAssoc) {
                    associated.push({
                        libelle,
                        ratio: regime.ratio,
                        alreadyExists: true,
                    });
                    continue;
                }

                await insertRegimeClientAssociation(
                    clientId,
                    existingRegime.ID_Regime_Declaration,
                    sessionId
                );

                associated.push({
                    libelle,
                    ratio: regime.ratio,
                    alreadyExists: false,
                });
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                errors.push(`Erreur pour ${regime.code} ${regime.ratio}: ${message}`);
            }
        }

        const newAssociations = associated.filter((a) => !a.alreadyExists).length;
        const existingAssociations = associated.filter((a) => a.alreadyExists).length;

        if (associated.length === 0 && errors.length > 0) {
            return {
                success: false,
                error: errors.join(" | "),
            };
        }

        return {
            success: true,
            data: {
                associated: newAssociations,
                alreadyAssociated: existingAssociations,
                total: associated.length,
                errors: errors.length > 0 ? errors : undefined,
            },
        };
    } catch (error) {
        console.error("associateRegimesToClient error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur",
        };
    }
}

/**
 * Recupere le nom d'un client par son ID.
 */
export async function getClientName(clientId: number) {
    try {
        const client = await prisma.tClients.findUnique({
            where: { ID_Client: clientId },
            select: { Nom_Client: true },
        });

        return {
            success: true,
            data: client?.Nom_Client || `Client ${clientId}`,
        };
    } catch {
        return {
            success: false,
            data: `Client ${clientId}`,
        };
    }
}
