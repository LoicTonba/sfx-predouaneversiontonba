"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { importSelectedColisages } from "../../server/import-colisage-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { EditableColisageCard } from "./editable-colisage-card";
import { EditImportColisageDialog } from "./edit-import-colisage-dialog";

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

interface ColisageImportPreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    dossierId: number;
    parsedRows: ParsedRow[];
    existingRowKeys?: Array<{ id: number; uploadKey: string | null; descriptionColis: string }>;
}

export const ColisageImportPreviewDialog = ({
    open,
    onOpenChange,
    dossierId,
    parsedRows,
    existingRowKeys = [],
}: ColisageImportPreviewDialogProps) => {
    const [selectedRows, setSelectedRows] = useState<Set<number>>(
        new Set(parsedRows.map((_, idx) => idx))
    );
    const [isImporting, setIsImporting] = useState(false);
    const [updateExisting, setUpdateExisting] = useState(false);
    const [editedRows, setEditedRows] = useState<ParsedRow[]>(parsedRows);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
    
    // Mettre à jour editedRows quand parsedRows change
    useEffect(() => {
        console.log('🔄 [ColisageImportPreview] parsedRows mis à jour:', parsedRows);
        console.log('🔄 [ColisageImportPreview] parsedRows.length:', parsedRows.length);
        setEditedRows(parsedRows);
        setSelectedRows(new Set(parsedRows.map((_, idx) => idx)));
    }, [parsedRows]);
    const router = useRouter();

    const existingKeysSet = new Set(existingRowKeys.map((r) => r.uploadKey));

    const toggleRow = (index: number) => {
        const newSelected = new Set(selectedRows);
        if (newSelected.has(index)) {
            newSelected.delete(index);
        } else {
            newSelected.add(index);
        }
        setSelectedRows(newSelected);
    };

    const toggleAll = () => {
        if (selectedRows.size === editedRows.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(editedRows.map((_, idx) => idx)));
        }
    };

    const handleEditRow = (index: number) => {
        setEditingRowIndex(index);
        setShowEditDialog(true);
    };

    const handleEditSave = (updatedRow: ParsedRow) => {
        if (editingRowIndex !== null) {
            const newEditedRows = [...editedRows];
            newEditedRows[editingRowIndex] = updatedRow;
            setEditedRows(newEditedRows);
        }
        setShowEditDialog(false);
        setEditingRowIndex(null);
    };

    const handleEditCancel = () => {
        setShowEditDialog(false);
        setEditingRowIndex(null);
    };

    const handleImport = async () => {
        const rowsToImport = editedRows.filter((_, idx) => selectedRows.has(idx));

        if (rowsToImport.length === 0) {
            toast.error("Veuillez sélectionner au moins une ligne");
            return;
        }

        setIsImporting(true);

        try {
            const result = await importSelectedColisages(dossierId, rowsToImport, updateExisting);

            if (!result.success) {
                toast.error(result.error || "Erreur lors de l'import");
                return;
            }

            if (result.data) {
                const { created, updated, total, errors } = result.data;

                if (created > 0 || updated > 0) {
                    toast.success(
                        `${created} créé(s), ${updated} mis à jour sur ${total} ligne(s)`
                    );
                }

                if (errors && errors.length > 0) {
                    toast.error(`${errors.length} ligne(s) ont échoué`, {
                        description: errors.slice(0, 3).map((e) => `Ligne ${e.row}: ${e.error}`).join("\n"),
                    });
                }

                // Forcer le rechargement de la page du dossier
                router.refresh();
                
                // Naviguer vers la même page pour forcer le rechargement
                setTimeout(() => {
                    router.push(`/dossiers/${dossierId}`);
                }, 300);
                
                onOpenChange(false);
            }
        } catch (err) {
            toast.error("Erreur lors de l'import");
            console.error(err);
        } finally {
            setIsImporting(false);
        }
    };

    const selectedCount = selectedRows.size;
    const newCount = editedRows.filter(
        (row, idx) => selectedRows.has(idx) && !existingKeysSet.has(row.rowKey)
    ).length;
    const existingCount = editedRows.filter(
        (row, idx) => selectedRows.has(idx) && existingKeysSet.has(row.rowKey)
    ).length;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl! max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Aperçu de l'import - {parsedRows.length} ligne(s)</DialogTitle>
                    <DialogDescription>
                        Sélectionnez les lignes à importer. Les lignes existantes sont marquées en orange.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center gap-4 py-2 border-b">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            checked={selectedRows.size === editedRows.length}
                            onCheckedChange={toggleAll}
                        />
                        <span className="text-sm font-medium">
                            Tout sélectionner ({selectedCount}/{editedRows.length})
                        </span>
                    </div>

                    {existingCount > 0 && (
                        <div className="flex items-center gap-2">
                            <Checkbox
                                checked={updateExisting}
                                onCheckedChange={(checked) => setUpdateExisting(!!checked)}
                            />
                            <span className="text-sm">Mettre à jour les existants</span>
                        </div>
                    )}

                    <div className="ml-auto flex gap-2">
                        <Badge variant="secondary">{newCount} nouveau(x)</Badge>
                        {existingCount > 0 && (
                            <Badge variant="outline" className="border-orange-500 text-orange-600">
                                {existingCount} existant(s)
                            </Badge>
                        )}
                    </div>
                </div>

                <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-2">
                        {editedRows.length === 0 ? (
                            <div className="flex items-center justify-center h-32 text-muted-foreground">
                                <p>Aucune donnée à afficher</p>
                            </div>
                        ) : (
                            editedRows.map((row, idx) => {
                                const isExisting = existingKeysSet.has(row.rowKey);
                                const isSelected = selectedRows.has(idx);

                                return (
                                    <EditableColisageCard
                                        key={idx}
                                        row={row}
                                        index={idx}
                                        isSelected={isSelected}
                                        isExisting={isExisting}
                                        onToggle={() => toggleRow(idx)}
                                        onEdit={() => handleEditRow(idx)}
                                    />
                                );
                            })
                        )}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isImporting}>
                                Annuler
                            </Button>
                            <Button onClick={handleImport} disabled={isImporting || selectedCount === 0}>
                                {isImporting ? "Import en cours..." : `Importer ${selectedCount} ligne(s)`}
                            </Button>
                        </div>
                    </div>
                </ScrollArea>

            </DialogContent>

            {/* Modal d'édition spécialisé pour l'import */}
            {editingRowIndex !== null && (
                <EditImportColisageDialog
                    open={showEditDialog}
                    onOpenChange={setShowEditDialog}
                    row={editedRows[editingRowIndex]}
                    onSave={handleEditSave}
                />
            )}
        </Dialog>
    );
};