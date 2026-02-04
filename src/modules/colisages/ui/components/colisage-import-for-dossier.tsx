"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Download } from "lucide-react";
import { toast } from "sonner";
import {
    parseColisageExcelFile,
    checkExistingRowKeys,
} from "../../server/import-colisage-actions";
import { ColisageImportPreviewDialog } from "./colisage-import-preview-dialog";
import { MissingValuesDialog } from "./missing-values-dialog";
import { MissingDevisesDialog } from "./missing-devises-dialog";
import { MissingPaysDialog } from "./missing-pays-dialog";
import { MissingHSCodesDialog } from "./missing-hscodes-dialog";
import { MissingRegimeDeclarationsDialog } from "./missing-regime-declarations-dialog";
import { RegimeAssociationDialog } from "./regime-association-dialog";
import { associateRegimesToClient, getClientName } from "../../server/associate-regimes-actions";

interface ColisageImportForDossierProps {
    dossierId: number;
}

export const ColisageImportForDossier = ({ dossierId }: ColisageImportForDossierProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [showMissingValues, setShowMissingValues] = useState(false);
    const [showMissingDevises, setShowMissingDevises] = useState(false);
    const [showMissingPays, setShowMissingPays] = useState(false);
    const [showMissingHSCodes, setShowMissingHSCodes] = useState(false);
    const [showMissingRegimeDeclarations, setShowMissingRegimeDeclarations] = useState(false);
    const [currentStep, setCurrentStep] = useState<'regime-declarations' | 'regimes' | 'devises' | 'pays' | 'hscodes' | 'preview'>('regime-declarations');

    // Fonction pour démarrer le processus séquentiel
    const startSequentialProcess = (missingValuesData: any) => {
        console.log('🚀 [startSequentialProcess] Données reçues:', missingValuesData);
        
        // 1. Vérifier s'il y a des régimes déclarations manquants (qui n'existent pas du tout)
        if (missingValuesData.regimes?.length > 0) {
            console.log('📋 [startSequentialProcess] Régimes manquants détectés:', missingValuesData.regimes);
            setCurrentStep('regime-declarations');
            setShowMissingRegimeDeclarations(true);
            return;
        }

        // 2. Vérifier s'il y a des régimes non associés (qui existent mais pas associés au client)
        if (missingValuesData.unassociatedRegimes?.length > 0) {
            console.log('🔗 [startSequentialProcess] Régimes non associés détectés:', missingValuesData.unassociatedRegimes);
            setCurrentStep('regimes');
            setShowRegimeAssociation(true);
            return;
        }

        // 3. Vérifier s'il y a des devises manquantes
        if (missingValuesData.devises?.length > 0) {
            console.log('💱 [startSequentialProcess] Devises manquantes détectées:', missingValuesData.devises);
            setCurrentStep('devises');
            setShowMissingDevises(true);
            return;
        }

        // 4. Vérifier s'il y a des pays manquants
        if (missingValuesData.pays?.length > 0) {
            console.log('🌍 [startSequentialProcess] Pays manquants détectés:', missingValuesData.pays);
            setCurrentStep('pays');
            setShowMissingPays(true);
            return;
        }

        // 5. Vérifier s'il y a des HS Codes manquants
        if (missingValuesData.hscodes?.length > 0) {
            console.log('📦 [startSequentialProcess] HS Codes manquants détectés:', missingValuesData.hscodes);
            setCurrentStep('hscodes');
            setShowMissingHSCodes(true);
            return;
        }

        // 6. Tout est OK, aller au preview
        console.log('✅ [startSequentialProcess] Toutes les validations OK, passage au preview');
        setCurrentStep('preview');
        setShowPreview(true);
    };

    // Fonction pour passer à l'étape suivante avec des données mises à jour
    const goToNextStep = async (updatedMissingValues?: any) => {
        // Utiliser les données mises à jour si fournies, sinon les données actuelles
        const currentMissingValues = updatedMissingValues || missingValues;
        
        console.log('🚀 [goToNextStep] Étape actuelle:', currentStep);
        console.log('🚀 [goToNextStep] Données utilisées:', currentMissingValues);
        
        if (currentStep === 'regime-declarations') {
            // Après les régimes déclarations, vérifier les régimes non associés
            if (currentMissingValues?.unassociatedRegimes?.length > 0) {
                console.log('🔗 [goToNextStep] Régimes non associés détectés, ouverture du dialogue');
                setCurrentStep('regimes');
                setShowRegimeAssociation(true);
            } else {
                console.log('🔗 [goToNextStep] Pas de régimes non associés, passage aux devises');
                setCurrentStep('devises');
                setTimeout(() => goToNextStep(currentMissingValues), 0); // Récursif asynchrone
            }
        } else if (currentStep === 'regimes') {
            // Après les régimes, vérifier les devises
            console.log('🔍 [goToNextStep] Étape regimes - Vérification devises:', currentMissingValues?.devises);
            if (currentMissingValues?.devises?.length > 0) {
                console.log('💱 [goToNextStep] Devises manquantes détectées, ouverture du dialogue');
                setCurrentStep('devises');
                setShowMissingDevises(true);
            } else {
                console.log('💱 [goToNextStep] Pas de devises manquantes, passage aux pays');
                setCurrentStep('pays');
                setTimeout(() => {
                    console.log('🔄 [goToNextStep] Récursion vers pays avec:', currentMissingValues);
                    goToNextStep(currentMissingValues);
                }, 100); // Récursif asynchrone
            }
        } else if (currentStep === 'devises') {
            // Après les devises, vérifier les pays
            if (currentMissingValues?.pays?.length > 0) {
                console.log('🌍 [goToNextStep] Pays manquants détectés, ouverture du dialogue');
                setCurrentStep('pays');
                setShowMissingPays(true);
            } else {
                console.log('🌍 [goToNextStep] Pas de pays manquants, passage aux HS Codes');
                setCurrentStep('hscodes');
                setTimeout(() => goToNextStep(currentMissingValues), 0); // Récursif asynchrone
            }
        } else if (currentStep === 'pays') {
            // Après les pays, vérifier les HS Codes
            console.log('🔍 [goToNextStep] Étape pays - Vérification HS Codes:', currentMissingValues?.hscodes);
            if (currentMissingValues?.hscodes?.length > 0) {
                console.log('📦 [goToNextStep] HS Codes manquants détectés, ouverture du dialogue');
                setCurrentStep('hscodes');
                setShowMissingHSCodes(true);
            } else {
                console.log('📦 [goToNextStep] Pas de HS Codes manquants, passage au preview');
                setCurrentStep('preview');
                setShowPreview(true);
            }
        } else if (currentStep === 'hscodes') {
            // Après les HS Codes, aller au preview
            console.log('✅ [goToNextStep] Passage au preview final');
            setCurrentStep('preview');
            setShowPreview(true);
        }
    };

    // Fonction pour annuler tout le processus
    const cancelAllProcess = () => {
        setShowMissingRegimeDeclarations(false);
        setShowRegimeAssociation(false);
        setShowMissingDevises(false);
        setShowMissingPays(false);
        setShowMissingHSCodes(false);
        setShowPreview(false);
        setParsedRows([]);
        setMissingValues(null);
        setCurrentStep('regime-declarations');
    };
    const [showRegimeAssociation, setShowRegimeAssociation] = useState(false);
    const [parsedRows, setParsedRows] = useState<any[]>([]);
    const [existingRowKeys, setExistingRowKeys] = useState<any[]>([]);
    const [missingValues, setMissingValues] = useState<any>(null);
    const [clientName, setClientName] = useState<string>("");
    const [currentFile, setCurrentFile] = useState<File | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
            toast.error("Veuillez sélectionner un fichier Excel (.xlsx ou .xls)");
            return;
        }

        setIsLoading(true);
        setCurrentFile(file); // Stocker le fichier pour re-parsing ultérieur

        try {
            const formData = new FormData();
            formData.append("file", file);

            // Parse le fichier avec le dossierId pour récupérer le client
            const parseResult = await parseColisageExcelFile(formData, dossierId);
            if (!parseResult.success || !parseResult.data) {
                toast.error(parseResult.error || "Erreur lors du parsing");
                return;
            }

            // Vérifier les rowKeys existants
            const rowKeys = parseResult.data.rows.map((r: any) => r.rowKey).filter(Boolean);
            const existingResult = await checkExistingRowKeys(dossierId, rowKeys);

            setParsedRows(parseResult.data.rows);
            setExistingRowKeys(existingResult.success ? existingResult.data || [] : []);
            

            
            setMissingValues({
                ...parseResult.data.missingValues,
                clientId: parseResult.data.clientId
            });

            // Récupérer le nom du client
            const clientNameResult = await getClientName(parseResult.data.clientId);
            setClientName(clientNameResult.data || `Client ${parseResult.data.clientId}`);

            // Démarrer le processus séquentiel

            startSequentialProcess(parseResult.data.missingValues);

            e.target.value = "";
        } catch (err) {
            toast.error("Erreur lors du traitement du fichier");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const downloadTemplate = () => {
        const XLSX = require("xlsx");
        
        // Données de test avec colonnes Regime_Code et Regime_Ratio
        const templateData = [
            {
                "Row_Key": "LIGNE-001",
                "HS_Code": "",
                "Descr": "Produit standard exonéré",
                "Command_No": "CMD-001",
                "Supplier_Name": "Fournisseur A",
                "Invoice_No": "FACT-001",
                "Item_No": "001",
                "Currency": "XOF",
                "Qty": 100,
                "Unit_Prize": 25000,
                "Gross_Weight": 150,
                "Net_Weight": 140,
                "Volume": 2.5,
                "Country_Origin": "CM",
                "Regime_Code": "",
                "Regime_Ratio": 0,
                "Customer_Grouping": "Site Perenco"
            },
            {
                "Row_Key": "LIGNE-002",
                "HS_Code": "123456",
                "Descr": "Produit avec droits complets",
                "Command_No": "CMD-002",
                "Supplier_Name": "Fournisseur B",
                "Invoice_No": "FACT-002",
                "Item_No": "002",
                "Currency": "USD",
                "Qty": 50,
                "Unit_Prize": 1500,
                "Gross_Weight": 75,
                "Net_Weight": 70,
                "Volume": 1.2,
                "Country_Origin": "FR",
                "Regime_Code": "",
                "Regime_Ratio": 100,
                "Customer_Grouping": "Site Douala"
            },
            {
                "Row_Key": "LIGNE-003",
                "HS_Code": "789012",
                "Descr": "Produit électronique - régime partiel",
                "Command_No": "CMD-003",
                "Supplier_Name": "Fournisseur C",
                "Invoice_No": "FACT-003",
                "Item_No": "003",
                "Currency": "EUR",
                "Qty": 25,
                "Unit_Prize": 500,
                "Gross_Weight": 30,
                "Net_Weight": 28,
                "Volume": 0.5,
                "Country_Origin": "US",
                "Regime_Code": "",
                "Regime_Ratio": 50,
                "Customer_Grouping": "Site Kribi"
            },
            {
                "Row_Key": "LIGNE-004",
                "Descr": "Matériel de construction",
                "Command_No": "CMD-004",
                "Supplier_Name": "Fournisseur D",
                "Invoice_No": "FACT-004",
                "Currency": "XOF",
                "Qty": 200,
                "Unit_Prize": 15000,
                "Gross_Weight": 300,
                "Net_Weight": 280,
                "Volume": 5.0,
                "Country_Origin": "CM",
                "Regime_Code": "",
                "Regime_Ratio": 25,
                "Customer_Grouping": "Site Limbé"
            },
            {
                "Row_Key": "LIGNE-005",
                "Descr": "Équipement industriel",
                "Command_No": "CMD-005",
                "Supplier_Name": "Fournisseur E",
                "Invoice_No": "FACT-005",
                "Currency": "XOF",
                "Qty": 75,
                "Unit_Prize": 35000,
                "Gross_Weight": 120,
                "Net_Weight": 110,
                "Volume": 2.0,
                "Country_Origin": "CM",
                "Regime_Code": "",
                "Regime_Ratio": 75,
                "Customer_Grouping": "Site Yaoundé"
            }
        ];

        const worksheet = XLSX.utils.json_to_sheet(templateData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Colisages");

        // Largeurs des colonnes (avec régimes)
        worksheet['!cols'] = [
            { wch: 15 }, // Row_Key
            { wch: 12 }, // HS_Code (optionnel)
            { wch: 40 }, // Descr
            { wch: 15 }, // Command_No
            { wch: 25 }, // Supplier_Name
            { wch: 15 }, // Invoice_No
            { wch: 10 }, // Currency
            { wch: 10 }, // Qty
            { wch: 15 }, // Unit_Prize
            { wch: 15 }, // Gross_Weight
            { wch: 15 }, // Net_Weight
            { wch: 10 }, // Volume
            { wch: 15 }, // Country_Origin
            { wch: 15 }, // Regime_Code (vide)
            { wch: 15 }, // Regime_Ratio (obligatoire)
            { wch: 20 }  // Customer_Grouping
        ];

        XLSX.writeFile(workbook, "template-colisages.xlsx");
        
        toast.success("Template téléchargé - Regime_Code vide, Regime_Ratio obligatoire (0-100%)");
    };

    return (
        <>
            <div className="flex items-center gap-2">
                <Button
                    onClick={downloadTemplate}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                >
                    <Download className="w-4 h-4" />
                    Template
                </Button>

                <label htmlFor="excel-import-dossier" className="cursor-pointer">
                    <Button
                        asChild
                        disabled={isLoading}
                        variant="outline"
                        size="sm"
                    >
                        <span className="flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            {isLoading ? "Chargement..." : "Importer Excel"}
                        </span>
                    </Button>
                    <input
                        id="excel-import-dossier"
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                        disabled={isLoading}
                        className="hidden"
                    />
                </label>
            </div>

            <MissingRegimeDeclarationsDialog
                open={showMissingRegimeDeclarations}
                onOpenChange={setShowMissingRegimeDeclarations}
                missingRegimes={missingValues?.regimes || []}
                onRegimeCreated={async (regimeCode) => {
                    // Re-parser le fichier immédiatement après création d'un régime
                    if (currentFile) {
                        const formData = new FormData();
                        formData.append("file", currentFile);
                        const reparseResult = await parseColisageExcelFile(formData, dossierId);
                        
                        if (reparseResult.success && reparseResult.data) {
                            // Mettre à jour avec les nouvelles données validées
                            setMissingValues({
                                ...reparseResult.data.missingValues,
                                clientId: reparseResult.data.clientId
                            });
                        }
                    }
                }}
                onContinue={async () => {
                    // Re-parser une dernière fois avant de continuer
                    if (currentFile) {
                        const formData = new FormData();
                        formData.append("file", currentFile);
                        const reparseResult = await parseColisageExcelFile(formData, dossierId);
                        
                        if (reparseResult.success && reparseResult.data) {
                            // Mettre à jour avec les nouvelles données validées
                            const updatedMissingValues = {
                                ...reparseResult.data.missingValues,
                                clientId: reparseResult.data.clientId
                            };
                            setMissingValues(updatedMissingValues);
                            
                            setShowMissingRegimeDeclarations(false);
                            goToNextStep(updatedMissingValues);
                        } else {
                            setShowMissingRegimeDeclarations(false);
                            goToNextStep();
                        }
                    } else {
                        setShowMissingRegimeDeclarations(false);
                        goToNextStep();
                    }
                }}
                onCancel={cancelAllProcess}
            />

            <RegimeAssociationDialog
                open={showRegimeAssociation}
                onOpenChange={(open) => {
                    // Ne pas fermer automatiquement le dialogue
                    if (!open) return;
                    setShowRegimeAssociation(open);
                }}
                regimes={missingValues?.unassociatedRegimes || []}
                clientName={clientName}
                onConfirm={async () => {
                    if (missingValues?.unassociatedRegimes && missingValues.clientId) {
                        const result = await associateRegimesToClient(
                            missingValues.unassociatedRegimes,
                            missingValues.clientId
                        );
                        
                        if (result.success) {
                            const { associated, alreadyAssociated } = result.data || {};
                            if (associated && associated > 0) {
                                toast.success(`${associated} régime(s) associé(s) au client - L'import va continuer automatiquement`);
                            }
                            if (alreadyAssociated && alreadyAssociated > 0) {
                                toast.info(`${alreadyAssociated} régime(s) déjà associé(s)`);
                            }
                            
                            // Attendre un peu pour que la BD se mette à jour
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            
                            // Re-parser le fichier pour revalider avec les nouvelles associations
                            if (currentFile) {
                                console.log('🔄 [RegimeAssociation] Re-parsing après association...');
                                const formData = new FormData();
                                formData.append("file", currentFile);
                                const reparseResult = await parseColisageExcelFile(formData, dossierId);
                                
                                console.log('📊 [RegimeAssociation] Résultat re-parsing:', reparseResult);
                                
                                if (reparseResult.success && reparseResult.data) {
                                    // Mettre à jour avec les nouvelles données validées
                                    const updatedMissingValues = {
                                        ...reparseResult.data.missingValues,
                                        clientId: reparseResult.data.clientId
                                    };
                                    setMissingValues(updatedMissingValues);
                                    
                                    console.log('✅ [RegimeAssociation] MissingValues mis à jour:', updatedMissingValues);
                                    
                                    // Fermer le dialogue et redémarrer le processus séquentiel avec les nouvelles données
                                    setShowRegimeAssociation(false);
                                    
                                    // Redémarrer le processus séquentiel avec les données mises à jour
                                    setTimeout(() => {
                                        console.log('🔄 [RegimeAssociation] Redémarrage du processus séquentiel avec:', updatedMissingValues);
                                        
                                        // Forcer la mise à jour du currentStep avant de redémarrer
                                        setCurrentStep('devises');
                                        
                                        // Redémarrer le processus
                                        setTimeout(() => {
                                            startSequentialProcess(updatedMissingValues);
                                        }, 100);
                                    }, 300);
                                } else {
                                    // En cas d'erreur de re-parsing, afficher un message et fermer
                                    setShowRegimeAssociation(false);
                                    toast.info("Régimes associés avec succès. Veuillez relancer l'import pour continuer.", {
                                        duration: 5000
                                    });
                                }
                            } else {
                                // Pas de fichier à re-parser, afficher un message et fermer
                                setShowRegimeAssociation(false);
                                toast.info("Régimes associés avec succès. Veuillez relancer l'import pour continuer.", {
                                    duration: 5000
                                });
                            }
                        } else {
                            toast.error("Erreur lors de l'association des régimes");
                        }
                    }
                }}
                onCancel={cancelAllProcess}
            />

            <MissingDevisesDialog
                open={showMissingDevises}
                onOpenChange={setShowMissingDevises}
                missingDevises={missingValues?.devises || []}
                onContinue={async () => {
                    // Re-parser pour vérifier si les devises ont été créées
                    if (currentFile) {
                        // Petit délai pour s'assurer que les données sont commitées
                        await new Promise(resolve => setTimeout(resolve, 500));
                        
                        const formData = new FormData();
                        formData.append("file", currentFile);
                        const reparseResult = await parseColisageExcelFile(formData, dossierId);
                        
                        if (reparseResult.success && reparseResult.data) {
                            const updatedMissingValues = {
                                ...reparseResult.data.missingValues,
                                clientId: reparseResult.data.clientId
                            };
                            setMissingValues(updatedMissingValues);
                            
                            setShowMissingDevises(false);
                            goToNextStep(updatedMissingValues);
                        } else {
                            setShowMissingDevises(false);
                            goToNextStep();
                        }
                    } else {
                        setShowMissingDevises(false);
                        goToNextStep();
                    }
                }}
                onCancel={cancelAllProcess}
            />

            <MissingPaysDialog
                open={showMissingPays}
                onOpenChange={setShowMissingPays}
                missingPays={missingValues?.pays || []}
                onContinue={async () => {
                    // Re-parser pour vérifier si les pays ont été créés
                    if (currentFile) {
                        // Petit délai pour s'assurer que les données sont commitées
                        await new Promise(resolve => setTimeout(resolve, 500));
                        
                        const formData = new FormData();
                        formData.append("file", currentFile);
                        const reparseResult = await parseColisageExcelFile(formData, dossierId);
                        
                        if (reparseResult.success && reparseResult.data) {
                            const updatedMissingValues = {
                                ...reparseResult.data.missingValues,
                                clientId: reparseResult.data.clientId
                            };
                            setMissingValues(updatedMissingValues);
                            
                            setShowMissingPays(false);
                            goToNextStep(updatedMissingValues);
                        } else {
                            setShowMissingPays(false);
                            goToNextStep();
                        }
                    } else {
                        setShowMissingPays(false);
                        goToNextStep();
                    }
                }}
                onCancel={cancelAllProcess}
            />

            <MissingHSCodesDialog
                open={showMissingHSCodes}
                onOpenChange={setShowMissingHSCodes}
                missingHSCodes={missingValues?.hscodes || []}
                onContinue={async () => {
                    // Re-parser pour vérifier si les HS codes ont été créés
                    if (currentFile) {
                        // Petit délai pour s'assurer que les données sont commitées
                        await new Promise(resolve => setTimeout(resolve, 500));
                        
                        const formData = new FormData();
                        formData.append("file", currentFile);
                        const reparseResult = await parseColisageExcelFile(formData, dossierId);
                        
                        if (reparseResult.success && reparseResult.data) {
                            const updatedMissingValues = {
                                ...reparseResult.data.missingValues,
                                clientId: reparseResult.data.clientId
                            };
                            setMissingValues(updatedMissingValues);
                            
                            setShowMissingHSCodes(false);
                            goToNextStep(updatedMissingValues);
                        } else {
                            setShowMissingHSCodes(false);
                            goToNextStep();
                        }
                    } else {
                        setShowMissingHSCodes(false);
                        goToNextStep();
                    }
                }}
                onCancel={cancelAllProcess}
            />

            {/* Garder l'ancien dialogue pour compatibilité si nécessaire */}
            <MissingValuesDialog
                open={showMissingValues}
                onOpenChange={setShowMissingValues}
                missingValues={missingValues || { devises: [], pays: [], hscodes: [], regimes: [], clientId: undefined }}
                onContinue={() => {
                    setShowMissingValues(false);
                    setShowPreview(true);
                }}
                onCancel={cancelAllProcess}
            />

            <ColisageImportPreviewDialog
                open={showPreview}
                onOpenChange={setShowPreview}
                dossierId={dossierId}
                parsedRows={parsedRows}
                existingRowKeys={existingRowKeys}
            />
        </>
    );
};