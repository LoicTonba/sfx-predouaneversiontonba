"use server";

import auth from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

/* ============================================================================
   CREATE
============================================================================ */

/**
 * Crée un nouveau HS Code
 */
export async function createHSCode(data: { code: string; libelle: string }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Missing User Session");
    }

     // 1️⃣ Vérification unicité (SQL Server SAFE)
    const exists = await prisma.$queryRaw<
      { found: number }[]
    >`
      SELECT TOP 1 1 AS found
      FROM [dbo].[THSCodes]
      WHERE [HS Code] = ${data.code}
        AND [Entite] = 0
    `;

    if (exists.length > 0) {
      return { success: false, error: "Ce HS Code existe déjà" };
    }

    // 2️⃣ Création (RAW SQL maîtrisé)
    const inserted = await prisma.$queryRaw<
      { ID_HS_Code: number }[]
    >`
      INSERT INTO [dbo].[THSCodes]
        ([HS Code], [Libelle HS Code], [UploadKey], [Entite], [Session], [Date Creation])
      OUTPUT INSERTED.[ID HS Code] AS ID_HS_Code
      VALUES
        (${data.code}, ${data.libelle}, 'MANUAL', 0, ${Number(session.user.id)}, SYSDATETIME())
    `;

    const id = inserted[0]?.ID_HS_Code;

    if (!id) {
      throw new Error("Insertion failed: ID not returned");
    }

    revalidatePath("/hscode");

    // 🔥 IMPORTANT : retourner l’ID
    return {
      success: true,
      data: {
        ID_HS_Code: id,
      },
    };

  } catch (error) {
    console.error("💥 createHSCode error:", error);
    return { success: false, error };
  }
}


/* ============================================================================
   READ
============================================================================ */

/**
 * Récupère un HS Code par ID via VHSCodes
 */
export async function getHSCodeById(id: string) {
  try {
    const hscode = await prisma.vHSCodes.findFirst({
      where: {
        ID_HS_Code: parseInt(id),
      },
    });

    if (!hscode) {
      return { success: false };
    }

    // 🔁 Mapping vers les noms attendus par le frontend
    const mappedData = {
      ID_HS_Code: hscode.ID_HS_Code,
      HS_Code: hscode.HS_Code,
      Libelle_HS_Code: hscode.Libelle_HS_Code,
      Date_Creation: hscode.Date_Creation,
      Nom_Creation: hscode.Nom_Creation,
    };

    return {
      success: true,
      data: mappedData,
    };
  } catch (error) {
    console.error("getHSCodeById error:", error);
    return { success: false };
  }
}

/**
 * Récupère tous les HS Codes (SAFE – sans doublons)
 */
export async function getAllHSCodes(search = "") {
  try {
    let query = `
      SELECT
        ID_HS_Code,
        HS_Code,
        Libelle_HS_Code,
        MIN(Date_Creation) AS Date_Creation,
        MAX(Nom_Creation) AS Nom_Creation
      FROM VHSCodes
      WHERE ID_HS_Code <> 0
    `;

    if (search) {
      query += `
        AND (
          HS_Code LIKE '%' + @search + '%'
          OR Libelle_HS_Code LIKE '%' + @search + '%'
        )
      `;
    }

    query += `
      GROUP BY
        ID_HS_Code,
        HS_Code,
        Libelle_HS_Code
      ORDER BY HS_Code ASC
    `;

    const data = await prisma.$queryRawUnsafe<any[]>(
      query,
      { search }
    );

    return {
      success: true,
      data,
      total: data.length,
    };
  } catch (error) {
    console.error("getAllHSCodes error:", error);
    return { success: false, error };
  }
}



/* ============================================================================
   UPDATE
============================================================================ */

/**
 * Met à jour un HS Code
 */
export async function updateHSCode(
  id: string,
  data: { code?: string; libelle?: string }
) {
  try {
    if (!data.code && !data.libelle) {
      return { success: false, error: "Aucun champ à mettre à jour" };
    }

    if (data.code) {
      await prisma.$executeRaw`
        UPDATE [dbo].[THSCodes]
        SET [HS Code] = ${data.code}
        WHERE [ID HS Code] = ${parseInt(id)}
      `;
    }

    if (data.libelle) {
      await prisma.$executeRaw`
        UPDATE [dbo].[THSCodes]
        SET [Libelle HS Code] = ${data.libelle}
        WHERE [ID HS Code] = ${parseInt(id)}
      `;
    }

    revalidatePath(`/hscode/${id}`);
    revalidatePath("/hscode");

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

/* ============================================================================
   DELETE
============================================================================ */

/**
 * Supprime un HS Code
 */
export async function deleteHSCode(id: string) {
  try {
    await prisma.$executeRaw`
      DELETE FROM [dbo].[THSCodes]
      WHERE [ID HS Code] = ${parseInt(id)}
    `;

    revalidatePath("/hscode");
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}


/* ============================================================================
   IMPORT EXCEL – PREVIEW
============================================================================ */

/**
 * Type pour l'import Excel des HS Codes
 */
export interface ImportHSCodeRow {
  Row_Key: string;
  HS_Code: string;
  Description: string;
}

/**
 * Prévisualise l'import Excel des HS Codes
 * - Lecture Excel
 * - Validation stricte
 * - Détection des HS Codes existants
 * - Statistiques new / existing
 */
export async function previewHSCodesImport(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "Aucun fichier fourni" };
    }

    /* ============================
       Lecture du fichier Excel
    ============================ */
    const buffer = await file.arrayBuffer();
    const XLSX = await import("xlsx");
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    if (!sheet) {
      return { success: false, error: "Feuille Excel introuvable" };
    }

    const rows = XLSX.utils.sheet_to_json(sheet) as any[];

    if (rows.length === 0) {
      return { success: false, error: "Le fichier Excel est vide" };
    }

    /* ============================
       Analyse & validation
    ============================ */
    const preview: any[] = [];
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      const Row_Key = row.Row_Key || row["Row Key"] || "IMPORT";
      const HS_Code = row.HS_Code || row["HS Code"] || row.Code || "";
      const Description = row.Description || row.Libelle || row.Label || "";

      // 🔴 Validation stricte (comme Edwin)
      if (!HS_Code) {
        errors.push(`Ligne ${i + 2} : HS Code manquant`);
        continue;
      }

      if (!Description) {
        errors.push(`Ligne ${i + 2} : Libellé manquant`);
        continue;
      }

      /* ============================
         Détection HS Code existant
         (SQL Server SAFE)
      ============================ */
      const existing = await prisma.$queryRaw<
        { ID_HS_Code: number }[]
      >`
        SELECT TOP 1 [ID HS Code] AS ID_HS_Code
        FROM [dbo].[THSCodes]
        WHERE [HS Code] = ${HS_Code}
          AND [Entite] = 0
      `;

      preview.push({
        Row_Key,
        HS_Code,
        Description,
        status: existing.length > 0 ? "existing" : "new",
        existingId: existing[0]?.ID_HS_Code ?? null,
      });
    }

    /* ============================
       Résultat final
    ============================ */
    return {
      success: true,
      data: {
        preview,
        total: rows.length,
        valid: preview.length,
        errors: errors.length > 0 ? errors : undefined,
        stats: {
          new: preview.filter(p => p.status === "new").length,
          existing: preview.filter(p => p.status === "existing").length,
        },
      },
    };

  } catch (error) {
    console.error("previewHSCodesImport error:", error);
    return {
      success: false,
      error: error instanceof Error
        ? error.message
        : "Erreur lors de la prévisualisation",
    };
  }
}



/* ============================================================================
   IMPORT EXCEL – EXECUTION (VERSION FINALE ALIGNÉE EDWIN)
============================================================================ */

export async function importHSCodesFromExcel(
  previewData: (ImportHSCodeRow & {
    status: "new" | "existing";
    existingId?: number;
  })[],
  mode: "create" | "update" | "both"
) {
  try {
    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const item of previewData) {
      try {
        if (!item.HS_Code || !item.Description) continue;

        /* ============================================================
           🆕 CREATE 
        ============================================================ */
        if (
          item.status === "new" &&
          (mode === "create" || mode === "both")
        ) {
          await prisma.$executeRaw`
            INSERT INTO [dbo].[THSCodes]
            (
              [HS Code],
              [Libelle HS Code],
              [UploadKey],
              [Entite],
              [Session],
              [Date Creation]
            )
            VALUES
            (
              ${item.HS_Code},
              ${item.Description},
              ${item.Row_Key || "IMPORT"},
              0,
              0,
              SYSDATETIME()
            )
          `;
          created++;
        }

        /* ============================================================
           🔁 UPDATE 
        ============================================================ */
        else if (
          item.status === "existing" &&
          (mode === "update" || mode === "both")
        ) {
          await prisma.$executeRaw`
            UPDATE [dbo].[THSCodes]
            SET
              [Libelle HS Code] = ${item.Description},
              [UploadKey] = ${item.Row_Key || "IMPORT"}
            WHERE [ID HS Code] = ${item.existingId}
          `;
          updated++;
        }

      } catch (err: any) {
        errors.push(`HS ${item.HS_Code}: ${err.message}`);
      }
    }

    revalidatePath("/hscode");

    /* ============================================================
       ✅ CONTRAT DE RETOUR STABLE
    ============================================================ */
    return {
      success: true,
      data: {
        created,
        updated,
        total: previewData.length,
        errors: errors.length ? errors : undefined,
      },
    };

  } catch (error) {
    console.error("importHSCodesFromExcel error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur lors de l'import",
    };
  }
}


