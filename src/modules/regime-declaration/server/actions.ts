"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import  auth  from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  TRegimeDeclarationCreateSchema,
  TRegimeDeclarationUpdateSchema,
} from "@/lib/validation";
import {
  TRegimeDeclarationCreate,
  TRegimeDeclarationUpdate,
} from "@/lib/validation";

/**
 * Cree un nouveau regime de declaration
 */
export async function createRegimeDeclaration(data: TRegimeDeclarationCreate) {
  try {
    const validatedData = TRegimeDeclarationCreateSchema.parse(data);

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Missing User Session");
    }

    // Normaliser les donnees avant verification / insertion.
    const regimeDouanierId = Number(validatedData.regimeDouanierId);
    const tauxRegime = Number(validatedData.tauxRegime);
    const libelle = String(validatedData.libelle ?? "").trim();
    const sessionId = Number(session.user.id);

    if (!Number.isInteger(sessionId)) {
      throw new Error("Session utilisateur invalide");
    }

    // 1) Verifier le doublon sur la contrainte UNIQUE (Taux_Regime + Regime_Douanier).
    const duplicateByTauxAndRegime = await prisma.tRegimesDeclarations.findFirst({
      where: {
        Taux_Regime: tauxRegime,
        Regime_Douanier: regimeDouanierId,
      },
      select: {
        ID_Regime_Declaration: true,
        Libelle_Regime_Declaration: true,
      },
    });

    if (duplicateByTauxAndRegime) {
      return {
        success: false,
        error: `Ce taux (${tauxRegime}) existe deja pour ce regime douanier. Regime existant: "${duplicateByTauxAndRegime.Libelle_Regime_Declaration}" (ID ${duplicateByTauxAndRegime.ID_Regime_Declaration}).`,
      };
    }

    // 2) Verifier le doublon sur le libelle (autre contrainte UNIQUE).
    const duplicateByLibelle = await prisma.tRegimesDeclarations.findFirst({
      where: { Libelle_Regime_Declaration: libelle },
      select: { ID_Regime_Declaration: true },
    });

    if (duplicateByLibelle) {
      return {
        success: false,
        error: `Le libelle "${libelle}" existe deja (ID ${duplicateByLibelle.ID_Regime_Declaration}).`,
      };
    }

    // Inserer et recuperer l'ID cree.
    const inserted = await prisma.$queryRaw<
      { ID_Regime_Declaration: number }[]
    >`
      INSERT INTO dbo.TRegimesDeclarations
      (
        [Regime Douanier],
        [Libelle Regime Declaration],
        [Taux Regime],
        [Entite],
        [Session],
        [Date Creation]
      )
      OUTPUT INSERTED.[ID Regime Declaration] AS ID_Regime_Declaration
      VALUES
      (
        ${regimeDouanierId},
        ${libelle},
        ${tauxRegime},
        0,
        ${sessionId},
        SYSDATETIME()
      )
    `;

    revalidatePath("/regime-declaration");

    return {
      success: true,
      data: {
        id: inserted[0]?.ID_Regime_Declaration,
      },
    };
  } catch (error) {
    console.error("createRegimeDeclaration", error);

    // Message metier lisible pour les contraintes SQL uniques.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2010"
    ) {
      const sqlMessage = String((error.meta as any)?.message ?? "");
      if (sqlMessage.includes("UQ_TRegimesDeclarations$Taux Regime")) {
        return {
          success: false,
          error: "Doublon refuse: ce couple taux/regime douanier existe deja.",
        };
      }
      if (sqlMessage.includes("UQ_TRegimesDeclarations$Libelle Regime Declaration")) {
        return {
          success: false,
          error: "Doublon refuse: ce libelle de regime existe deja.",
        };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur lors de la creation du regime de declaration",
    };
  }
}

/**
 * Recupere un regime de declaration par ID
 */
export async function getRegimeDeclarationById(id: string) {
  try {
    const parsedId = Number(id);

    // Exclure les IDs systeme
    if ([0, 1].includes(parsedId)) {
      return {
        success: false,
        error: "Regime de declaration systeme non accessible",
      };
    }

    const regimeDeclaration = await prisma.vRegimesDeclarations.findFirst({
      where: { ID_Regime_Declaration: parsedId },
    });

    if (!regimeDeclaration) {
      return { success: false, error: "Regime de declaration non trouvee" };
    }

    return {
      success: true,
      data: {
        id: regimeDeclaration.ID_Regime_Declaration,
        libelleRegimeDeclaration:
          regimeDeclaration.Libelle_Regime_Declaration,
        tauxRegime: Number(regimeDeclaration.Ratio_DC),
        regimeDouanier: regimeDeclaration.ID_Regime_Douanier,
        dateCreation: regimeDeclaration.Date_Creation.toISOString(),
        tRegimesDouaniers: {
          id: regimeDeclaration.ID_Regime_Douanier,
          libelleRegimeDouanier:
            regimeDeclaration.Libelle_Regime_Douanier,
        },
      },
    };
  } catch (error) {
    return { success: false, error };
  }
}


/**
 * Recupere tous les regimes de declaration avec filtres et pagination
 */
export async function getAllRegimeDeclarations(
  page = 1,
  take = 10,
  search = ""
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Missing User Session");
    }

    const skip = (page - 1) * take;

    const where: any = {
      ID_Regime_Declaration: { notIn: [0, 1] },
      ...(search
        ? {
            OR: [
              { Libelle_Regime_Declaration: { contains: search } },
              { Libelle_Regime_Douanier: { contains: search } },
            ],
          }
        : {}),
    };

    const regimeDeclarations = await prisma.vRegimesDeclarations.findMany({
      where,
      skip,
      take,
      orderBy: { Date_Creation: "desc" },
    });

    const total = await prisma.vRegimesDeclarations.count({ where });

    return {
      success: true,
      data: regimeDeclarations.map((rd) => ({
        id: rd.ID_Regime_Declaration,
        libelleRegimeDeclaration: rd.Libelle_Regime_Declaration,
        tauxRegime: Number(rd.Ratio_DC),
        regimeDouanier: rd.ID_Regime_Douanier,
        dateCreation: rd.Date_Creation.toISOString(),
        tRegimesDouaniers: {
          id: rd.ID_Regime_Douanier,
          libelleRegimeDouanier: rd.Libelle_Regime_Douanier,
        },
      })),
      total,
    };
  } catch (error) {
    console.error("getAllRegimeDeclarations error:", error);
    return { success: false, error };
  }
}


/**
 * Met A jour un regime de declaration
 */
export async function updateRegimeDeclaration(id: string, data: TRegimeDeclarationUpdate) {
  try {
    const validatedData = TRegimeDeclarationUpdateSchema.parse(data);

    await prisma.$executeRaw`
      UPDATE dbo.TRegimesDeclarations
      SET
        ${validatedData.libelle
          ? Prisma.sql`[Libelle Regime Declaration] = ${validatedData.libelle},`
          : Prisma.sql``}

        ${validatedData.tauxRegime !== undefined
          ? Prisma.sql`[Taux Regime] = ${validatedData.tauxRegime},`
          : Prisma.sql``}

        ${validatedData.regimeDouanierId
          ? Prisma.sql`[Regime Douanier] = ${Number(validatedData.regimeDouanierId)}`
          : Prisma.sql``}

      WHERE [ID Regime Declaration] = ${Number(id)}
    `;

    // Recuperer les donnees mises A jour
    const updated = await prisma.vRegimesDeclarations.findFirst({
      where: { ID_Regime_Declaration: Number(id) },
    });

    revalidatePath(`/regime-declaration/${id}`);
    revalidatePath("/regime-declaration");

    return { 
      success: true,
      data: {
        id: updated?.ID_Regime_Declaration,
        libelleRegimeDeclaration: updated?.Libelle_Regime_Declaration,
        tauxRegime: Number(updated?.Ratio_DC),
      }
    };
  } catch (error) {
    console.error("updateRegimeDeclaration error:", error);
    return { success: false, error };
  }
}


/**
 * Supprime un regime de declaration
 */
export async function deleteRegimeDeclaration(id: string) {
  try {
    const parsedId = Number(id);

    // Protection des regimes systeme
    if ([0, 1].includes(parsedId)) {
      return {
        success: false,
        error: "Regime de declaration systeme non supprimable",
      };
    }

    // Verifier l'existence avant suppression
    const existing = await prisma.vRegimesDeclarations.findFirst({
      where: { ID_Regime_Declaration: parsedId },
    });

    if (!existing) {
      return {
        success: false,
        error: "Regime de declaration introuvable",
      };
    }

    // Verifier les dependances FK avant DELETE.
    // Si des lignes existent dans ces tables, SQL Server refusera la suppression.
    const [linkedClientsCount, linkedColisagesCount] = await prisma.$transaction([
      prisma.tRegimesClients.count({
        where: { Regime_Declaration: parsedId },
      }),
      prisma.tColisageDossiers.count({
        where: { Regime_Declaration: parsedId },
      }),
    ]);

    if (linkedClientsCount > 0 || linkedColisagesCount > 0) {
      return {
        success: false,
        error: `Suppression impossible: ce regime est encore utilise (${linkedClientsCount} association(s) client, ${linkedColisagesCount} colisage(s)).`,
      };
    }

    await prisma.$executeRaw`
      DELETE FROM dbo.TRegimesDeclarations
      WHERE [ID Regime Declaration] = ${parsedId}
    `;

    revalidatePath("/regime-declaration");

    return {
      success: true,
      data: {
        id: existing.ID_Regime_Declaration,
        libelleRegimeDeclaration: existing.Libelle_Regime_Declaration,
        tauxRegime: Number(existing.Ratio_DC),
      },
    };
  } catch (error) {
    console.error("deleteRegimeDeclaration error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression du regime de declaration",
    };
  }
}

/**
 * Recupere tous les regimes de declaration pour le selecteur
 */
export async function getAllRegimeDeclarationsForSelect() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) throw new Error("Missing User Session");

    const regimesDeclarations = await prisma.vRegimesDeclarations.findMany({
      where: {
        ID_Regime_Declaration: { notIn: [0, 1] }, // Exclure les IDs systeme
      },
      orderBy: {
        Libelle_Regime_Declaration: "asc",
      },
    });

    return {
      success: true,
      data: regimesDeclarations.map(rd => ({
        id: rd.ID_Regime_Declaration,
        libelleRegimeDeclaration: rd.Libelle_Regime_Declaration,
        tauxRegime: Number(rd.Ratio_DC),
        tRegimesDouaniers: {
          libelleRegimeDouanier: rd.Libelle_Regime_Douanier,
        },
      })),
    };
  } catch (error) {
    return { success: false, error };
  }
}

