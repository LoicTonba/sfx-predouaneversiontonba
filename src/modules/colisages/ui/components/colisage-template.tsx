"use client";

import { useState } from "react";
import { Button } from "../../../../components/ui/button";
import { Upload, Download } from "lucide-react";
import { toast } from "sonner";
import { previewColisagesImport } from "../../../colisages/server/colisage-actions";
import { ColisageImportPreviewDialog } from "../../../colisages/ui/components/colisage-import";
import { NewHscodeDialog } from "@/modules/hscode/ui/components/new-hscode-dialog";


interface ColisageImportPreviewDialogProps {
  dossierId: string | number;
}


export const ColisageImportDialog = ({ dossierId }: ColisageImportPreviewDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [isNewHscodeDialogOpen, setIsNewHscodeDialogOpen] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      toast.error("Veuillez sélectionner un fichier Excel (.xlsx ou .xls)");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await previewColisagesImport(formData, Number(dossierId));
      
      if (!result.success || !result.data) {
        if (result.data?.missingData?.hsCodes && result.data.missingData.hsCodes.length > 0) {
          setIsNewHscodeDialogOpen(true);
        }
        toast.error(result.error || "Erreur lors de l'analyse");
        return;
      }

      setPreviewData(result.data);
      setShowPreview(true);

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
     const templateData = [
            {
                "UploadKey": "LIGNE-001",
                "HS_Code": "123456",
                "Descr": "Exemple de produit",
                "Command_No": "CMD-001",
                "Supplier_Name": "Nom du fournisseur",
                "Invoice_No": "FACT-001",
                "Item_No": "1",
                "Currency": "XOF",
                "Qty": 100,
                "Unit_Prize": 25.50,
                "Gross_Weight": 150,
                "Net_Weight": 140,
                "Volume": 2.5,
                "Country_Origin": "CM",
                "Regime_Code": "IM4",
                "Regime_Ratio": 0,
                "Customer_Grouping": "Site Perenco"
            },
            {
                "UploadKey": "LIGNE-002",
                "HS_Code": "654321",
                "Descr": "Autre produit 100% DC",
                "Command_No": "CMD-002",
                "Supplier_Name": "Autre fournisseur",
                "Invoice_No": "FACT-002",
                "Item_No": "2",
                "Currency": "XOF",
                "Qty": 50,
                "Unit_Prize": 45.00,
                "Gross_Weight": 80,
                "Net_Weight": 75,
                "Volume": 1.5,
                "Country_Origin": "FR",
                "Regime_Code": "IM4",
                "Regime_Ratio": 100,
                "Customer_Grouping": "Site Perenco"
            },
            {
                "UploadKey": "LIGNE-003",
                "HS_Code": "789012",
                "Descr": "Produit avec 30% DC",
                "Command_No": "CMD-003",
                "Supplier_Name": "Troisième fournisseur",
                "Invoice_No": "FACT-003",
                "Item_No": "3",
                "Currency": "EUR",
                "Qty": 75,
                "Unit_Prize": 120.00,
                "Gross_Weight": 200,
                "Net_Weight": 190,
                "Volume": 3.0,
                "Country_Origin": "US",
                "Regime_Code": "IM4",
                "Regime_Ratio": 30,
                "Customer_Grouping": "Site Perenco"
            }
        ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Colisage");

    worksheet['!cols'] = [
      { wch: 15 },
      { wch: 12 },
      { wch: 40 }
    ];

    XLSX.writeFile(workbook, "template-Colisage.xlsx");
  };

  return (
    <>
      <NewHscodeDialog open={isNewHscodeDialogOpen} onOpenChange={setIsNewHscodeDialogOpen} />
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

        <label htmlFor="excel-import-hscode" className="cursor-pointer">
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
            id="excel-import-hscode"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            disabled={isLoading}
            className="hidden"
          />
        </label>
      </div>

      <ColisageImportPreviewDialog
              open={showPreview}
              onOpenChange={setShowPreview}
              previewData={previewData} dossierId={Number(dossierId)}  />
    </>
  );
};