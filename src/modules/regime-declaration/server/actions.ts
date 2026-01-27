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
 * Crée un nouveau régime de déclaration
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

    // Récupérer l'ID du régime créé
    const inserted = await prisma.$queryRaw<
      { ID_Regime_Declaration: number }[]
    >`
      INSERT INTO dbo.TRegimesDeclarations
      (
        [Regime Douanier],
        [Libelle Regime Declaration],
        [Taux DC],
        [Entite],
        [Session],
        [Date Creation]
      )
      OUTPUT INSERTED.[ID Regime Declaration] AS ID_Regime_Declaration
      VALUES
      (
        ${Number(validatedData.regimeDouanierId)},
        ${validatedData.libelle},
        ${validatedData.tauxDC},
        0,
        ${Number(session.user.id)},
        SYSDATETIME()
      )
    `;

    revalidatePath("/regime-declaration");

    return { 
      success: true,
      data: {
        id: inserted[0]?.ID_Regime_Declaration
      }
    };
  } catch (error) {
    console.error("createRegimeDeclaration", error);
    return { success: false, error };
  }
}


/**
 * Récupère un régime de déclaration par ID
 */
export async function getRegimeDeclarationById(id: string) {
  try {
    const parsedId = Number(id);

    // Exclure les IDs système
    if ([0, 1].includes(parsedId)) {
      return {
        success: false,
        error: "Régime de déclaration système non accessible",
      };
    }

    const regimeDeclaration = await prisma.vRegimesDeclarations.findFirst({
      where: { ID_Regime_Declaration: parsedId },
    });

    if (!regimeDeclaration) {
      return { success: false, error: "Régime de déclaration non trouvé" };
    }

    return {
      success: true,
      data: {
        id: regimeDeclaration.ID_Regime_Declaration,
        libelleRegimeDeclaration:
          regimeDeclaration.Libelle_Regime_Declaration,
        tauxDC: Number(regimeDeclaration.Ratio_DC),
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
 * Récupère tous les régimes de déclaration avec filtres et pagination
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
        tauxDC: Number(rd.Ratio_DC),
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
 * Met à jour un régime de déclaration
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

        ${validatedData.tauxDC !== undefined
          ? Prisma.sql`[Taux DC] = ${validatedData.tauxDC},`
          : Prisma.sql``}

        ${validatedData.regimeDouanierId
          ? Prisma.sql`[Regime Douanier] = ${Number(validatedData.regimeDouanierId)}`
          : Prisma.sql``}

      WHERE [ID Regime Declaration] = ${Number(id)}
    `;

    // Récupérer les données mises à jour
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
        tauxDC: Number(updated?.Ratio_DC),
      }
    };
  } catch (error) {
    console.error("updateRegimeDeclaration error:", error);
    return { success: false, error };
  }
}


/**
 * Supprime un régime de déclaration
 */
export async function deleteRegimeDeclaration(id: string) {
  try {
    const parsedId = Number(id);

    // 🔒 Protection des régimes système
    if ([0, 1].includes(parsedId)) {
      return {
        success: false,
        error: "Régime de déclaration système non supprimable",
      };
    }

    // 🔍 Vérifier l'existence avant suppression
    const existing = await prisma.vRegimesDeclarations.findFirst({
      where: { ID_Regime_Declaration: parsedId },
    });

    if (!existing) {
      return {
        success: false,
        error: "Régime de déclaration introuvable",
      };
    }

    // 🗑️ Suppression SQL (adaptée à ta base)
    await prisma.$executeRaw`
      DELETE FROM dbo.TRegimesDeclarations
      WHERE [ID Regime Declaration] = ${parsedId}
    `;

    // 🔄 Invalidation du cache
    revalidatePath("/regime-declaration");

    // ✅ Retour cohérent avec EDWIN
    return {
      success: true,
      data: {
        id: existing.ID_Regime_Declaration,
        libelleRegimeDeclaration: existing.Libelle_Regime_Declaration,
        tauxDC: Number(existing.Ratio_DC),
      },
    };
  } catch (error) {
    console.error("deleteRegimeDeclaration error:", error);
    return { success: false, error };
  }
}

/**
 * Récupère tous les régimes de déclaration pour le sélecteur
 */
export async function getAllRegimeDeclarationsForSelect() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) throw new Error("Missing User Session");

    const regimesDeclarations = await prisma.vRegimesDeclarations.findMany({
      where: {
        ID_Regime_Declaration: { notIn: [0, 1] }, // Exclure les IDs système
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
        tauxDC: Number(rd.Ratio_DC),
        tRegimesDouaniers: {
          libelleRegimeDouanier: rd.Libelle_Regime_Douanier,
        },
      })),
    };
  } catch (error) {
    return { success: false, error };
  }
}

