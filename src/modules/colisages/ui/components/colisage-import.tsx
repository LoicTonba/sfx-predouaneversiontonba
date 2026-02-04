"use client";

import {  useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Checkbox } from "../../../../components/ui/checkbox";
import { ScrollArea } from "../../../../components/ui/scroll-area";
import { Badge } from "../../../../components/ui/badge";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
import {  importSelectedColisages } from "../../server/colisage-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";




interface ColisagePreviewItem {
  UploadKey: string;
  HS_Code: number;
  Description_Colis: string;
  No_Commande: string;
  Nom_Fournisseur: string;
  No_Facture: string;
  Devise: string;
  Qte_Colis: number;
  No_Article: number;
  Prix_Unitaire_Colis: number;
  Poids_Brut: number;
  Poids_Net: number;
  Volume: number;
  Pays_Origine: string;
  Regime_Declaration: string;
  Regroupement_Client: string;
  status: 'new' | 'existing';
}

interface PreviewData {
  preview: ColisagePreviewItem[];
  total: number;
  valid: number;
  stats: {
    new: number;
    existing: number;
  };
  errors?: string[];
}

interface ColisageImportPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dossierId: number;
  previewData: PreviewData | null;
}

export const ColisageImportPreviewDialog = ({
  open,
  onOpenChange,
  previewData,
  dossierId,
}: ColisageImportPreviewDialogProps) => {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [isImporting, setIsImporting] = useState(false);
  const [updateExisting, setUpdateExisting] = useState(false);

  const router = useRouter();


  /**
   * Sélection automatique de toutes les lignes
   * quand un nouvel aperçu est reçu
   */
  useEffect(() => {
      if (previewData?.preview) {
        setSelectedRows(
          new Set(previewData.preview.map((_, index) => index))
        );
      }
    }, [previewData]);

  if (!previewData) return null;

 const toggleRow = (index: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedRows.size === previewData.preview.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(previewData.preview.map((_, index) => index)));
    }
  };

  const handleImport = async () => {
    
    const rowsToImport = previewData.preview.filter((_, index) => selectedRows.has(index));
    
    console.log("Rows to import:", rowsToImport);
    if (rowsToImport.length === 0) {
      toast.error("Veuillez sélectionner au moins une ligne");
      return;
    }

    setIsImporting(true);

    try {
    
      // Passer le paramètre updateExisting à la fonction d'import
      const result = await importSelectedColisages(dossierId, rowsToImport, updateExisting);
      
      console.log("Import result:", result);

      

      if (!result.success) {
        toast.error(result.error || "Erreur lors de l'import");
        return;
      }
     
      const created = result.data?.created ?? 0;

      toast.success(`${created} colisage(s) importé(s) avec succès`);
      router.refresh();
      onOpenChange(false);
    } catch (err) {
      toast.error("Erreur lors de l'import");
      console.error(err);
    } finally {
      setIsImporting(false);
    }
  };


  const selectedCount = selectedRows.size;
  const newCount = previewData.preview.filter(
    (row, index) => selectedRows.has(index) && row.status === 'new'
  ).length;
  const existingCount = previewData.preview.filter(
    (row, index) => selectedRows.has(index) && row.status === 'existing'
  ).length;

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl! max-h-[90vh]!">
        <DialogHeader>
          <DialogTitle>Aperçu de l'import - {previewData.preview.length} ligne(s)</DialogTitle>
          <DialogDescription>
            Sélectionnez les lignes à importer. Les lignes existantes sont marquées en orange.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 py-2 border-b flex-wrap">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedRows.size === previewData.preview.length}
              onCheckedChange={toggleAll}
            />
            <span className="text-sm font-medium">
              Tout sélectionner ({selectedCount}/{previewData.preview.length})
            </span>
          </div>

          {existingCount > 0 && (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={updateExisting}
                onCheckedChange={(checked) => setUpdateExisting(Boolean(checked))}
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

        {previewData.errors && previewData.errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium">Erreurs détectées:</div>
              <ul className="mt-2 list-disc list-inside text-sm">
                {previewData.errors.slice(0, 5).map((error: string, index: number) => (
                  <li key={index}>{error}</li>
                ))}
                {previewData.errors.length > 5 && (
                  <li>... et {previewData.errors.length - 5} autres erreurs</li>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-2">
            {previewData.preview.map((row, index) => {
              const isExisting = row.status === 'existing';
              const isSelected = selectedRows.has(index);

              return (
                <div
                  key={row.UploadKey}
                  className={`flex items-start gap-3 p-3 border rounded-lg transition-colors ${
                    isSelected ? "bg-accent/50" : "bg-background"
                  } ${isExisting ? "border-orange-300" : "border-border"}`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleRow(index)}
                    className="mt-1"
                  />

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        {row.UploadKey}
                      </span>
                      {isExisting && (
                        <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
                          Existe
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        HS: {row.HS_Code}
                      </Badge>
                    </div>

                    <p className="text-sm font-medium">{row.Description_Colis}</p>
                    <p className="text-sm font-medium">{row.Nom_Fournisseur}</p>
                  </div>
                </div>
              );
            })}
          </div>

        <DialogFooter className="mt-5">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isImporting}>
            Annuler
          </Button>
          <Button onClick={handleImport} disabled={isImporting || selectedCount === 0}>
            {isImporting ? "Import en cours..." : `Importer ${selectedCount} ligne(s)`}
          </Button>
        </DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
    </>
  );
};