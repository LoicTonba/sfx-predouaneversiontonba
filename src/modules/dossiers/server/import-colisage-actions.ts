"use server";
// ============================================================================
// MODULE IMPORT-COLISAGE-ACTIONS.TS - IMPORT EXCEL COLISAGES
// ============================================================================
// Rôle global : Ce fichier contient les actions serveur pour l'import de colisages
// depuis des fichiers Excel/CSV. Il gère le parsing, la validation, la détection
// des valeurs manquantes et l'import transactionnel des données.
//
// Architecture :
// - Parse les fichiers Excel avec la librairie XLSX
// - Valide les données contre la base de données
// - Détecte les devises, pays, HS codes et régimes manquants
// - Gère l'import transactionnel pour garantir l'intégrité
// - Inclut l'authentification utilisateur pour sécuriser les actions
// ============================================================================

// Import des bibliothèques nécessaires
import  auth  from "@/lib/auth";     // Système d'authentification pour sécuriser les actions
import prisma from "@/lib/prisma";     // Client Prisma pour les interactions avec la base de données
import { revalidatePath } from "next/cache"; // Fonction Next.js pour invalider le cache
import { headers } from "next/headers"; // Fonction Next.js pour récupérer les en-têtes HTTP

/**
 * ============================================================================
 * FONCTION UTILITAIRE : convertDecimalsToNumbers
 * ============================================================================
 * Rôle global : Convertit les objets Decimal Prisma en nombres JavaScript.
 * Essentiel pour la sérialisation JSON et la compatibilité avec le frontend.
 * 
 * Paramètre :
 * @param data - Objet contenant potentiellement des Decimal à convertir
 * 
 * Retour : Objet avec tous les Decimal convertis en nombres
 * ============================================================================
 */
function convertDecimalsToNumbers(data: any): any {
    // Convertit l'objet en JSON string en remplaçant les Decimal par des nombres
    const jsonString = JSON.stringify(data, (_, value) => {
        // Vérifie si la valeur est un objet Decimal Prisma
        if (value && typeof value === 'object' && value.constructor.name === 'Decimal') {
            return parseFloat(value.toString()); // Convertit le Decimal en nombre
        }
        return value; // Garde les autres valeurs inchangées
    });
    // Reparse le JSON pour obtenir l'objet avec des nombres normaux
    return JSON.parse(jsonString);
}

/**
 * ============================================================================
 * FONCTION : parseColisageExcelFile
 * ============================================================================
 * Rôle global : Parse un fichier Excel de colisages avec validation et détection
 * des valeurs manquantes. Extrait les données et vérifie leur validité.
 * 
 * Paramètres :
 * @param formData - FormData contenant le fichier Excel
 * @param dossierId - ID optionnel du dossier pour récupérer le client associé
 * 
 * Retour : Objet { success: boolean, data: { rows, total, missingValues, clientId }, error?: string }
 * ============================================================================
 */
export async function parseColisageExcelFile(formData: FormData, dossierId?: number) {
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
        // 2️⃣ RÉCUPÉRATION ET VALIDATION DU FICHIER
        // --------------------------------------------------------------------
        const file = formData.get("file") as File;  // Récupère le fichier depuis FormData
        if (!file) {
            return { success: false, error: "Aucun fichier fourni" };
        }

        // --------------------------------------------------------------------
        // 3️⃣ RÉCUPÉRATION DU CLIENT ASSOCIÉ
        // --------------------------------------------------------------------
        // Récupérer le client du dossier si dossierId est fourni, sinon utilise l'utilisateur
        let clientId = parseInt(session.user.id);
        if (dossierId) {
            const dossier = await prisma.tDossiers.findUnique({
                where: { ID_Dossier: dossierId },
                select: { Client: true }  // Sélectionne uniquement l'ID du client
            });
            if (dossier) {
                clientId = dossier.Client;  // Utilise le client du dossier
            }
        }

        // --------------------------------------------------------------------
        // 4️⃣ PARSING DU FICHIER EXCEL
        // --------------------------------------------------------------------
        const buffer = await file.arrayBuffer();  // Convertit le fichier en buffer binaire
        const XLSX = await import("xlsx");       // Import dynamique de la librairie XLSX
        const workbook = XLSX.read(buffer, { type: "array" }); // Lit le fichier Excel
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]; // Prend la première feuille

        if (!worksheet) {
            return { success: false, error: "Aucune feuille trouvée dans le fichier" };
        }

        const rows = XLSX.utils.sheet_to_json(worksheet) as any[]; // Convertit la feuille en objets JSON

        if (rows.length === 0) {
            return { success: false, error: "Le fichier est vide" };
        }

        // --------------------------------------------------------------------
        // 5️⃣ MAPPING ET NORMALISATION DES DONNÉES
        // --------------------------------------------------------------------
        // Transforme chaque ligne Excel en format standardisé pour l'application
        const parsedRows = rows.map((row, index) => ({
            _rowIndex: index + 2,  // Index de ligne (commence à 2 pour correspondre à Excel)
            rowKey: row["Upload_Key"] || row["Upload Key"] || row["UploadKey"] || "", // Clé unique de la ligne
            hscode: row["HS_Code"] || row["HS Code"] || row["Code HS"] || null, // Code HS (optionnel)
            description: String(row["Descr"] || row["Description"] || row["Description Colis"] || ""), // Description
            numeroCommande: String(row["Command_No"] || row["No Commande"] || row["Numéro Commande"] || ""), // N° commande
            nomFournisseur: String(row["Supplier_Name"] || row["Nom Fournisseur"] || row["Fournisseur"] || ""), // Fournisseur
            numeroFacture: String(row["Invoice_No"] || row["No Facture"] || row["Numéro Facture"] || ""), // N° facture
            itemNo: String(row["Item_No"] || row["Item No"] || row["Numéro Ligne"] || ""), // Numéro d'article
            devise: row["Currency"] || row["Devise"] || row["Code Devise"], // Code devise
            quantite: parseFloat(row["Qty"] || row["Quantité"] || row["Qte Colis"]) || 1, // Quantité
            prixUnitaireColis: parseFloat(row["Unit_Prize_Colis"] || row["Prix Unitaire Colis"] || row["Prix Unitaire Colisage"]) || 0, // Prix unitaire
            poidsBrut: parseFloat(row["Gross_Weight"] || row["Poids Brut"]) || 0, // Poids brut
            poidsNet: parseFloat(row["Net_Weight"] || row["Poids Net"]) || 0, // Poids net
            volume: parseFloat(row["Volume"]) || 0, // Volume
            paysOrigine: row["Country_Origin"] || row["Pays Origine"] || row["Code Pays"], // Pays d'origine
            // Régime code optionnel (peut être vide)
            regimeCode: row["Regime_Code"] || row["Régime Code"] || row["Code Régime"] || null,
            regimeRatio: parseFloat(row["Regime_Ratio"] || row["Régime Ratio"] || row["Ratio Régime"]) || 0, // Ratio en %
            regroupementClient: row["Customer_Grouping"] || row["Regroupement Client"] || "", // Regroupement
        }));

        // --------------------------------------------------------------------
        // 6️⃣ VALIDATION ET DÉTECTION DES VALEURS MANQUANTES
        // --------------------------------------------------------------------
        // Valide toutes les données contre la base de données et détecte ce qui manque
        const missingValues = await validateAndDetectMissing(parsedRows, clientId);

        // --------------------------------------------------------------------
        // 7️⃣ RETOUR DES RÉSULTATS
        // --------------------------------------------------------------------
        return {
            success: true,
            data: {
                rows: parsedRows,                    // Lignes parsées et normalisées
                total: parsedRows.length,            // Nombre total de lignes
                missingValues,                       // Devises, Pays, HS Codes manquants
                clientId,                           // ID du client pour créer les associations
            },
        };
    } catch (error) {
        console.error("parseColisageExcelFile error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Erreur lors du parsing" };
    }
}

/**
 * ============================================================================
 * FONCTION : validateAndDetectMissing
 * ============================================================================
 * Rôle global : Valide les données et détecte les valeurs manquantes dans la base de données.
 * 
 * Paramètres :
 * @param rows - Lignes parsées et normalisées
 * @param clientId - ID du client pour créer les associations
 * 
 * Retour : Objet { devises, pays, hscodes, regimes, unassociatedRegimes }
 * ============================================================================
 */
async function validateAndDetectMissing(rows: any[], clientId: number) {
    const missingDevises: string[] = [];
    const missingPays: string[] = [];
    const missingHscodes: string[] = [];
    const missingRegimes: Array<{ code: string; ratio: number }> = [];
    const unassociatedRegimes: Array<{ code: string; ratio: number; libelle: string }> = [];

    // Extraire les valeurs distinctes
    const distinctDevises = [...new Set(rows.map(r => r.devise).filter(Boolean))];
    const distinctPays = [...new Set(rows.map(r => r.paysOrigine).filter(Boolean))];
    // Convertir les HS codes en strings pour la comparaison, mapper "0" vers "-"
    const distinctHscodes = [...new Set(rows.map(r => r.hscode).filter(h => h !== null && h !== undefined).map(h => {
        const hsCode = String(h);
        return hsCode === '0' ? '-' : hsCode; // Mapper "0" vers "-" qui correspond à l'ID 0
    }))];

    // Vérifier les devises
    if (distinctDevises.length > 0) {
        const foundDevises = await prisma.vDevises.findMany({
            where: { Code_Devise: { in: distinctDevises } },
            select: { Code_Devise: true }
        });
        const foundDevisesCodes = new Set(foundDevises.map(d => d.Code_Devise));
        missingDevises.push(...distinctDevises.filter(d => !foundDevisesCodes.has(d)));
    }

    // Vérifier les pays
    if (distinctPays.length > 0) {
        const foundPays = await prisma.vPays.findMany({
            where: { Code_Pays: { in: distinctPays } },
            select: { Code_Pays: true }
        });
        const foundPaysCodes = new Set(foundPays.map(p => p.Code_Pays));
        const missingPaysFound = distinctPays.filter(p => !foundPaysCodes.has(p));
        missingPays.push(...missingPaysFound);
    }

    // Vérifier les HS Codes
    if (distinctHscodes.length > 0) {
        console.log('🔍 [validateAndDetectMissing] Vérification HS Codes:', distinctHscodes);
        
        const foundHscodes = await prisma.vHSCodes.findMany({
            where: { 
                OR: [
                    { HS_Code: { in: distinctHscodes } },
                    { ID_HS_Code: 0 } // Inclure explicitement l'ID 0
                ]
            },
            select: { HS_Code: true }
        });
        
        console.log('📊 [validateAndDetectMissing] HS Codes trouvés:', foundHscodes);
        
        const foundHscodesCodes = new Set(foundHscodes.map(h => h.HS_Code));
        const missingHscodesFound = distinctHscodes.filter(h => !foundHscodesCodes.has(h));
        
        console.log('✅ [validateAndDetectMissing] HS Codes trouvés:', Array.from(foundHscodesCodes));
        console.log('❌ [validateAndDetectMissing] HS Codes manquants:', missingHscodesFound);
        
        missingHscodes.push(...missingHscodesFound);
    }

    // Vérifier les régimes (seulement si fournis)
    const rowsWithRegime = rows.filter(r => r.regimeRatio !== null && r.regimeRatio !== undefined);
    if (rowsWithRegime.length > 0) {
        const distinctRegimes = [...new Set(rowsWithRegime.map(r => {
            const ratio = typeof r.regimeRatio === 'string' ? parseFloat(r.regimeRatio) : r.regimeRatio;
            return (ratio / 100).toFixed(4); // Utiliser toFixed pour éviter les problèmes de précision
        }))];

        console.log('🔍 [validateAndDetectMissing] Client ID:', clientId);
        console.log('🔍 [validateAndDetectMissing] Régimes distincts à vérifier:', distinctRegimes);

        console.log('🔍 [validateAndDetectMissing] Client ID:', clientId);
        console.log('🔍 [validateAndDetectMissing] Régimes distincts à vérifier:', distinctRegimes);

        // Récupérer les associations client-régime pour ce client
        const clientRegimeAssociations = await prisma.tRegimesClients.findMany({
            where: { Client: clientId },
            include: {
                TRegimesDeclarations: {
                    select: {
                        ID_Regime_Declaration: true,
                        Libelle_Regime_Declaration: true,
                        Taux_Regime: true,
                        Regime_Douanier: true
                    }
                }
            }
        });
        
        // Filtrer seulement les régimes douaniers 0
        const filteredAssociations = clientRegimeAssociations.filter(assoc => 
            assoc.TRegimesDeclarations && assoc.TRegimesDeclarations.Regime_Douanier === 0
        );
        
        console.log('🔍 [validateAndDetectMissing] Associations manuelles trouvées:', filteredAssociations);
        
        // Créer un Set des taux DC disponibles pour ce client
        const availableRegimeTaux = new Set(
            filteredAssociations
                .filter(assoc => assoc.TRegimesDeclarations)
                .map(assoc => parseFloat(assoc.TRegimesDeclarations!.Taux_Regime.toString()).toFixed(4))
        );
        
        console.log('✅ [validateAndDetectMissing] Régimes trouvés et associés:', Array.from(availableRegimeTaux));
        
        // Pour chaque régime demandé, vérifier s'il existe et s'il est associé
        for (const row of rowsWithRegime) {
            const ratio = typeof row.regimeRatio === 'string' ? parseFloat(row.regimeRatio) : row.regimeRatio;
            const decimal = (ratio / 100).toFixed(4); // Normaliser à 4 décimales
            
            console.log(`🔍 [validateAndDetectMissing] Vérification régime ${ratio}% (${decimal})`);
            
            if (!availableRegimeTaux.has(decimal)) {
                console.log(`❌ [validateAndDetectMissing] Régime ${ratio}% non trouvé dans les associations client`);
                
                // Le régime n'est pas trouvé pour ce client
                // Vérifier s'il existe dans la base mais n'est pas associé
                let libelle: string;
                if (ratio === 0) {
                    libelle = 'EXO';
                } else if (ratio === 100) {
                    libelle = '100% DC';
                } else {
                    const dcPercent = Math.round(ratio * 100) / 100;
                    const trPercent = Math.round((100 - ratio) * 100) / 100;
                    // Générer le libellé sans préfixe pour correspondre à la BD
                    libelle = `${trPercent.toFixed(2)}% TR et ${dcPercent.toFixed(2)}% DC`;
                }

                console.log(`📝 [validateAndDetectMissing] Libellé généré: "${libelle}"`);

                // Chercher le régime avec différents formats possibles
                const regimeExists = await prisma.tRegimesDeclarations.findFirst({
                    where: {
                        OR: [
                            { Libelle_Regime_Declaration: libelle },
                            // Essayer aussi avec le format avec préfixe
                            { Libelle_Regime_Declaration: `${row.regimeCode || 'IM4'} ${libelle}` },
                            // Essayer avec le taux DC directement
                            { Taux_Regime: ratio / 100 },
                        ]
                    }
                });

                console.log(`🔍 [validateAndDetectMissing] Régime trouvé en BD:`, regimeExists);

                if (regimeExists) {
                    // Le régime existe mais n'est pas associé au client
                    const alreadyAdded = unassociatedRegimes.find(r => r.ratio === ratio);
                    if (!alreadyAdded) {
                        unassociatedRegimes.push({ 
                            code: row.regimeCode || 'IM4', 
                            ratio,
                            libelle: regimeExists.Libelle_Regime_Declaration
                        });
                        console.log(`🔗 [validateAndDetectMissing] Régime non associé ajouté: ${ratio}%`);
                    }
                } else {
                    // Le régime n'existe pas du tout
                    const alreadyAdded = missingRegimes.find(m => m.ratio === ratio);
                    if (!alreadyAdded) {
                        missingRegimes.push({ 
                            code: row.regimeCode || 'IM4', 
                            ratio,
                        });
                        console.log(`❌ [validateAndDetectMissing] Régime manquant ajouté: ${ratio}%`);
                    }
                }
            } else {
                console.log(`✅ [validateAndDetectMissing] Régime ${ratio}% OK (trouvé dans les associations client)`);
            }
        }
    }

    const result = {
        devises: missingDevises,
        pays: missingPays,
        hscodes: missingHscodes,
        regimes: missingRegimes,
        unassociatedRegimes, // Régimes existants mais non associés au client
    };

    console.log('📋 [validateAndDetectMissing] Résultat final:', result);

    return result;
}

/**
 * Vérifie les rowKeys existants dans un dossier
 */
export async function checkExistingRowKeys(dossierId: number, rowKeys: string[]) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            throw new Error("Missing User Session");
        }

        const existingColisages = await prisma.tColisageDossiers.findMany({
            where: {
                Dossier: dossierId,
                UploadKey: {
                    in: rowKeys.filter(Boolean),
                },
            },
            select: {
                ID_Colisage_Dossier: true,
                UploadKey: true,
                Description_Colis: true,
            },
        });

        return {
            success: true,
            data: existingColisages,
        };
    } catch (error) {
        console.error("checkExistingRowKeys error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Erreur lors de la vérification" };
    }
}

/**
 * Importe des colisages sélectionnés dans un dossier
 */
export async function importSelectedColisages(
    dossierId: number,
    rows: any[],
    updateExisting: boolean = false
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session) {
            throw new Error("Missing User Session");
        }

        const createdColisages: any[] = [];
        const updatedColisages: any[] = [];
        const errors: Array<{ row: number; rowKey?: string; error: string }> = [];

        // Extraire les valeurs distinctes pour chaque type
        const distinctDevises = [...new Set(rows.map(r => r.devise).filter(Boolean))];
        const distinctPays = [...new Set(rows.map(r => r.paysOrigine).filter(Boolean))];
        // Convertir les HS codes en strings pour la comparaison, mapper "0" vers "-"
        const distinctHscodes = [...new Set(rows.map(r => r.hscode).filter(h => h !== null && h !== undefined).map(h => {
            const hsCode = String(h);
            return hsCode === '0' ? '-' : hsCode; // Mapper "0" vers "-" qui correspond à l'ID 0
        }))];
        
        // Préparer les régimes avec leurs taux DC
        const distinctRegimes = [...new Set(rows
            .filter(r => r.regimeRatio !== undefined && r.regimeRatio !== null)
            .map(r => {
                const ratio = typeof r.regimeRatio === 'string' ? parseFloat(r.regimeRatio) : r.regimeRatio;
                return (ratio / 100).toString(); // Convertir en décimal (0-1)
            })
        )];

        // Utiliser Prisma pour récupérer les IDs
        const devisesMap = new Map<string, number>();
        if (distinctDevises.length > 0) {
            const devisesResult = await prisma.vDevises.findMany({
                where: { Code_Devise: { in: distinctDevises } },
                select: { ID_Devise: true, Code_Devise: true }
            });
            devisesResult.forEach(d => devisesMap.set(d.Code_Devise, d.ID_Devise));
        }

        const paysMap = new Map<string, number>();
        if (distinctPays.length > 0) {
            const paysResult = await prisma.vPays.findMany({
                where: { Code_Pays: { in: distinctPays } },
                select: { ID_Pays: true, Code_Pays: true }
            });
            paysResult.forEach(p => paysMap.set(p.Code_Pays, p.ID_Pays));
        }

        const hscodesMap = new Map<string, number>();
        if (distinctHscodes.length > 0) {
            const hscodesResult = await prisma.vHSCodes.findMany({
                where: { 
                    OR: [
                        { HS_Code: { in: distinctHscodes } },
                        { ID_HS_Code: 0 } // Inclure explicitement l'ID 0
                    ]
                },
                select: { ID_HS_Code: true, HS_Code: true }
            });
            hscodesResult.forEach(h => hscodesMap.set(h.HS_Code, h.ID_HS_Code));
        }

        // Récupérer le client du dossier
        const dossier = await prisma.tDossiers.findUnique({
            where: { ID_Dossier: dossierId },
            select: { Client: true }
        });
        const dossierClientId = dossier?.Client || parseInt(session.user.id);

        const regimesMap = new Map<string, number>();
        if (distinctRegimes.length > 0) {
            // Récupérer les associations client-régime pour ce client
            const clientRegimeAssociations = await prisma.tRegimesClients.findMany({
                where: { Client: dossierClientId },
                include: {
                    TRegimesDeclarations: {
                        select: {
                            ID_Regime_Declaration: true,
                            Taux_Regime: true,
                            Regime_Douanier: true
                        }
                    }
                }
            });
            
            // Filtrer seulement les régimes douaniers 0
            const filteredAssociations = clientRegimeAssociations.filter(assoc => 
                assoc.TRegimesDeclarations && assoc.TRegimesDeclarations.Regime_Douanier === 0
            );
            
            // Pour chaque régime demandé, trouver l'ID correspondant
            for (const regimeDecimal of distinctRegimes) {
                const targetTaux = parseFloat(regimeDecimal);
                
                const matchingAssociation = filteredAssociations.find(assoc => 
                    assoc.TRegimesDeclarations && 
                    Math.abs(parseFloat(assoc.TRegimesDeclarations.Taux_Regime.toString()) - targetTaux) < 0.0001
                );
                
                if (matchingAssociation && matchingAssociation.TRegimesDeclarations) {
                    const tauxDC = targetTaux.toFixed(4);
                    regimesMap.set(tauxDC, matchingAssociation.TRegimesDeclarations.ID_Regime_Declaration);
                }
            }
        }

        // Pré-charger les colisages existants
        const existingColisagesWithRowKey = await prisma.tColisageDossiers.findMany({
            where: {
                Dossier: dossierId,
                UploadKey: { not: '-' },
            },
            select: {
                ID_Colisage_Dossier: true,
                UploadKey: true,
            },
        });

        const existingRowKeysMap = new Map(
            existingColisagesWithRowKey.map(c => [c.UploadKey!, c.ID_Colisage_Dossier])
        );

        // Transaction pour créer/mettre à jour les colisages
        try {
            await prisma.$transaction(async (tx) => {
                for (let i = 0; i < rows.length; i++) {
                    const row = rows[i];
                    try {
                        const deviseId = devisesMap.get(row.devise);
                        if (!deviseId) {
                            throw new Error(`Devise "${row.devise}" non trouvée`);
                        }

                        const paysId = paysMap.get(row.paysOrigine);
                        if (!paysId) {
                            throw new Error(`Pays "${row.paysOrigine}" non trouvé`);
                        }

                        let hsCodeId: number | undefined;
                        if (row.hscode !== null && row.hscode !== undefined) {
                            // Mapper "0" vers "-" pour correspondre au HS Code ID 0
                            const hsCodeToFind = String(row.hscode) === '0' ? '-' : String(row.hscode);
                            hsCodeId = hscodesMap.get(hsCodeToFind);
                        }

                        let regimeDeclarationId: number | undefined;
                        if (row.regimeRatio !== undefined && row.regimeRatio !== null) {
                            // Le ratio dans le fichier est en pourcentage (0-100)
                            // Dans la BD c'est entre 0 et 1, donc on divise par 100
                            const regimeRatioPercent = typeof row.regimeRatio === 'string' ? parseFloat(row.regimeRatio) : row.regimeRatio;

                            if (!isNaN(regimeRatioPercent)) {
                                // Convertir le pourcentage en décimal normalisé à 4 décimales (string)
                                const regimeRatioDecimal = (regimeRatioPercent / 100).toFixed(4);
                                
                                regimeDeclarationId = regimesMap.get(regimeRatioDecimal);
                                
                                // Vérifier si le régime existe (attention: l'ID peut être 0, donc vérifier undefined)
                                if (regimeDeclarationId === undefined) {
                                    throw new Error(`Régime avec taux DC ${regimeRatioPercent}% non trouvé pour ce client`);
                                }
                            }
                        }

                        const existingColisageId = row.rowKey ? existingRowKeysMap.get(row.rowKey) : undefined;

                        const data = {
                            Dossier: dossierId,
                            HS_Code: hsCodeId,
                            Description_Colis: row.description,
                            No_Commande: row.numeroCommande,
                            Nom_Fournisseur: row.nomFournisseur,
                            No_Facture: row.numeroFacture,
                            Item_No: row.itemNo,
                            Devise: deviseId,
                            Qte_Colis: row.quantite,
                            Prix_Unitaire_Colis: row.prixUnitaireColis,
                            Poids_Brut: row.poidsBrut,
                            Poids_Net: row.poidsNet,
                            Volume: row.volume,
                            Ajustement_Valeur: row.ajustementValeur,
                            Pays_Origine: paysId,
                            Regime_Declaration: regimeDeclarationId,
                            Regroupement_Client: row.regroupementClient,
                            UploadKey: row.rowKey,
                            Session: parseInt(session.user.id),
                            Date_Creation: new Date(),
                        };

                        if (existingColisageId && updateExisting) {
                            const updated = await tx.tColisageDossiers.update({
                                where: { ID_Colisage_Dossier: existingColisageId },
                                data,
                            });
                            updatedColisages.push(convertDecimalsToNumbers(updated));
                        } else if (!existingColisageId) {
                            const created = await tx.tColisageDossiers.create({
                                data,
                            });
                            createdColisages.push(convertDecimalsToNumbers(created));
                        } else {
                            throw new Error(`Le rowKey "${row.rowKey}" existe déjà`);
                        }
                    } catch (error: any) {
                        errors.push({
                            row: i + 1,
                            rowKey: row.rowKey,
                            error: error.message || "Erreur lors du traitement",
                        });
                        throw error;
                    }
                }
            }, {
                maxWait: 60000,
                timeout: 120000,
            });

            revalidatePath(`/dossiers/${dossierId}`);
            revalidatePath("/colisage");

            return {
                success: true,
                data: {
                    created: createdColisages.length,
                    updated: updatedColisages.length,
                    total: rows.length,
                    errors: errors.length > 0 ? errors : undefined,
                },
            };
        } catch (transactionError: any) {
            return {
                success: false,
                error: `Importation annulée : ${transactionError.message}`,
                data: {
                    created: 0,
                    updated: 0,
                    total: rows.length,
                    errors: errors.length > 0 ? errors : [{ row: 0, error: transactionError.message }],
                },
            };
        }
    } catch (error) {
        console.error("importSelectedColisages error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur lors de l'import",
        };
    }
}
