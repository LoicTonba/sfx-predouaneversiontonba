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
export async function createHSCode(data: any) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Missing User Session");
    }

    const hscode = await prisma.tHSCodes.create({
      data: {
        HS_Code: data.code,
        Libelle_HS_Code: data.libelle,
        Session: parseInt(session.user.id),
        Date_Creation: new Date(),
      },
    });

    revalidatePath("/hscode");
    return { success: true, data: hscode };
  } catch (error) {
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
      return { success: false, error: 'HS Code non trouvé' };
    }

    // Mapper vers les anciens noms de colonnes pour la compatibilité frontend
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
export async function getAllHSCodes(
  page = 1,
  take = 10000,
  search = ""
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Missing User Session");
    }

    const whereCondition: any = {
      ID_HS_Code: { not: 0 }
    };

    if (search) {
      whereCondition.OR = [
        { HS_Code: { contains: search } },
        { Libelle_HS_Code: { contains: search } }
      ];
    }

    const hscodes = await prisma.vHSCodes.findMany({
      where: whereCondition,
      orderBy: { HS_Code: 'asc' },
      distinct: ['ID_HS_Code']
    });

    // Mapper vers les anciens noms de colonnes pour la compatibilité frontend
    const mappedData = hscodes.map(h => ({
        ID_HS_Code: h.ID_HS_Code,
        HS_Code: h.HS_Code,
        Libelle_HS_Code: h.Libelle_HS_Code,
        Date_Creation: h.Date_Creation,
        Nom_Creation: h.Nom_Creation,
    }));

    return { success: true, data: mappedData, total: mappedData.length };
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

   
    const hscode = await prisma.tHSCodes.update({
      where: { ID_HS_Code: parseInt(id) },
      data: {
        ...(data.code && { HS_Code: data.code }),
        ...(data.libelle && { Libelle_HS_Code: data.libelle }),
      },
    });
    

    revalidatePath(`/hscode/${id}`);
    revalidatePath("/hscode");

    return { success: true, data: hscode };
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
   const hscode = await prisma.tHSCodes.delete({
      where: { ID_HS_Code: parseInt(id) },
    });

    revalidatePath("/hscode");
    return { success: true, data: hscode };
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
  HS_Code: string;
  Description: string;
}

function normalizeHSCode(value: unknown): string {
  if (value === null || value === undefined) return "";

  // Convertit TOUJOURS en string sans notation scientifique
  return String(value)
    .trim()
    .replace(/\.0$/, ""); // Excel ajoute parfois ".0"
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
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Missing User Session");
    }

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
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    if (!worksheet) {
      return { success: false, error: "Aucune feuille trouvée dans le fichier" };
    }

    // IMPORTANT : raw:false pour éviter les Int
    const rows = XLSX.utils.sheet_to_json(worksheet, {
      raw: false,
      defval: "",
    }) as any[];

    if (rows.length === 0) {
      return { success: false, error: "Le fichier Excel est vide" };
    }

    /* ============================
       Analyse & validation
    ============================ */
    const previewData: any[] = [];
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const rawHS =
          rows[i].HS_Code ||
          rows[i]["HS Code"] ||
          rows[i].Code;

        const rowData: ImportHSCodeRow = {
          HS_Code: normalizeHSCode(rawHS),
          Description:
            String(
              rows[i].Description ||
              rows[i].Libelle ||
              rows[i].Label ||
              ""
            ).trim(),
        };

        // Validation
        if (!rowData.HS_Code) {
          errors.push(`Ligne ${i + 2}: HS Code manquant`);
          continue;
        }

        if (!rowData.Description) {
          errors.push(`Ligne ${i + 2}: Description manquante`);
          continue;
        }

        // Vérifier si le HS Code existe déjà
        const existing = await prisma.tHSCodes.findFirst({
          where: {
            HS_Code: rowData.HS_Code
          }
        });

        previewData.push({
          ...rowData,
          status: existing ? 'existing' : 'new',
          existingId: existing?.ID_HS_Code,
          existingData: existing ? {
            hsCode: existing.HS_Code,
            libelleHSCode: existing.Libelle_HS_Code,
          } : null
        });

      } catch (error: any) {
        errors.push(`Ligne ${i + 2}: ${error.message}`);
      }
    }


    /* ============================
       Résultat final
    ============================ */
    return {
      success: true,
      data: {
        preview: previewData,
        total: rows.length,
        valid: previewData.length,
        errors: errors.length > 0 ? errors : undefined,
        stats: {
          new: previewData.filter(p => p.status === 'new').length,
          existing: previewData.filter(p => p.status === 'existing').length,
        }
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
     const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Missing User Session");
    }

    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const item of previewData) {
      try {
        const hsCode = normalizeHSCode(item.HS_Code);
        const description = String(item.Description).trim();
        if (!hsCode || !description) continue;

        /* ============================================================
           🆕 CREATE 
        ============================================================ */
        if (
          item.status === "new" &&
          (mode === "create" || mode === "both")
        ) {
           // Créer nouveau HS Code
          await prisma.tHSCodes.create({
            data: {
              HS_Code: hsCode,
              Libelle_HS_Code: description,
              Session: Number(session.user.id),
              Date_Creation: new Date(),
            },
          });
          created++;
        }

        /* ============================================================
           🔁 UPDATE 
        ============================================================ */
        if (
          item.status === "existing" && item.existingId &&
          (mode === "update" || mode === "both")
        ) {
            // Mettre à jour HS Code existant
          await prisma.tHSCodes.update({
            where: { ID_HS_Code: item.existingId },
            data: {
              HS_Code: hsCode,
              Libelle_HS_Code: description,
            },
          });
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


