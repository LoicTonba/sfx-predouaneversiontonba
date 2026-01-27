"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { EditableColisageForm } from "./editable-colisage-form";

interface ParsedRow {
    _rowIndex: number;
    rowKey: string;
    hscode?: string;
    description: string;
    numeroCommande?: string;
    nomFournisseur?: string;
    numeroFacture?: string;
    itemNo?: string;
    devise: string;
    quantite: number;
    prixUnitaireColis: number;
    poidsBrut: number;
    poidsNet: number;
    volume: number;
    paysOrigine: string;
    regimeCode?: string;
    regimeRatio?: number;
    regroupementClient?: string;
}

interface EditImportColisageDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    row: ParsedRow;
    onSave: (updatedRow: ParsedRow) => void;
}

export const EditImportColisageDialog = ({
    open,
    onOpenChange,
    row,
    onSave,
}: EditImportColisageDialogProps) => {
    const handleSave = (data: any) => {
        // Mettre à jour la ligne avec les nouvelles données
        const updatedRow: ParsedRow = {
            ...row,
            description: data.description,
            numeroCommande: data.numeroCommande,
            nomFournisseur: data.nomFournisseur,
            numeroFacture: data.numeroFacture,
            itemNo: data.itemNo,
            quantite: data.quantite,
            prixUnitaireColis: data.prixUnitaireColis,
            poidsBrut: data.poidsBrut,
            poidsNet: data.poidsNet,
            volume: data.volume,
            regroupementClient: data.regroupementClient,
        };

        onSave(updatedRow);
        onOpenChange(false);
    };

    const handleCancel = () => {
        onOpenChange(false);
    };

    // Convertir les données pour le formulaire
    const formData = {
        rowKey: row.rowKey,
        hscode: row.hscode,
        description: row.description,
        numeroCommande: row.numeroCommande,
        nomFournisseur: row.nomFournisseur,
        numeroFacture: row.numeroFacture,
        itemNo: row.itemNo,
        devise: row.devise,
        quantite: row.quantite,
        prixUnitaireColis: row.prixUnitaireColis,
        poidsBrut: row.poidsBrut,
        poidsNet: row.poidsNet,
        volume: row.volume,
        paysOrigine: row.paysOrigine,
        regimeCode: row.regimeCode,
        regroupementClient: row.regroupementClient,
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Modifier le colisage - {row.rowKey}</DialogTitle>
                </DialogHeader>
                
                <EditableColisageForm
                    initialValues={formData}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            </DialogContent>
        </Dialog>
    );
};