"use client";

import { useEffect, useState } from "react";
import { getColisagesDossier } from "../../server/colisage-actions";
import { LoadingState } from "@/components/loading-state";
import { EmptyState } from "@/components/empty-state";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { CreateColisageDialog } from "./create-colisage-dialog";
import { DeleteAllColisagesDialog } from "./delete-all-colisages-dialog";
import { deleteColisage } from "../../server/colisage-actions";
import { useColisagePDFReport } from "../../hooks/use-colisage-pdf-report";

interface ColisageListForDossierProps {
    dossierId: number;
}

export const ColisageListForDossier = ({ dossierId }: ColisageListForDossierProps) => {
    const [colisages, setColisages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const router = useRouter();
    const { generatePDFReport, isGenerating } = useColisagePDFReport();
    


    useEffect(() => {
        loadColisages();
    }, [dossierId]);

    const loadColisages = async () => {
        setIsLoading(true);
        try {
            const result = await getColisagesDossier(dossierId);
            if (result.success && result.data) {
                setColisages(result.data);
            }
        } catch (error) {
            console.error("Error loading colisages:", error);
            toast.error("Erreur lors du chargement des colisages");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRowClick = (colisage: any) => {
        router.push(`/dossiers/${dossierId}/colisages/${colisage.ID_Colisage_Dossier}`);
    };

    const handleDeleteClick = () => {
        setShowDeleteDialog(true);
    };

    const handleDeleteSuccess = () => {
        loadColisages();
        setSelectedRows([]);
    };

    const handleGeneratePDF = async () => {
        await generatePDFReport(dossierId);
    };

    const columns: ColumnDef<any>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Tout sélectionner"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Sélectionner la ligne"
                    onClick={(e) => e.stopPropagation()}
                />
            ),
            enableSorting: false,
            enableHiding: false,
            size: 50,
        },
        {
            accessorKey: "Nom_Fournisseur",
            header: "Fournisseur",
            cell: ({ row }) => {
                const fournisseur = row.getValue("Nom_Fournisseur") as string;
                return (
                    <div className="max-w-[150px] truncate" title={fournisseur}>
                        {fournisseur || "-"}
                    </div>
                );
            },
        },
         {
            accessorKey: "No_Facture",
            header: "N° Facture",
            cell: ({ row }) => {
                const noFacture = row.getValue("No_Facture") as string;
                return noFacture ? (
                    <Badge variant="outline" className="font-mono text-xs">{noFacture}</Badge>
                ) : (
                    <span className="text-muted-foreground">-</span>
                );
            },
        },
        {
            accessorKey: "Item_No",
            header: "N° Item",
            cell: ({ row }) => {
                const itemNo = row.getValue("Item_No") as string;
                return itemNo ? (
                    <Badge variant="outline" className="font-mono text-xs">{itemNo}</Badge>
                ) : (
                    <span className="text-muted-foreground">-</span>
                );
            },
        },
        {
            accessorKey: "HS_Code",
            header: "HS Code",
            cell: ({ row }) => {
                const hsCode = row.getValue("HS_Code") as string;
                return hsCode ? (
                    <Badge variant="secondary" className="font-mono text-xs">{hsCode}</Badge>
                ) : (
                    <span className="text-muted-foreground">Not Found</span>
                );
            },
            size: 120,
        },
        {
            accessorKey: "Libelle_Regime_Declaration",
            header: "Régime Déclaration",
            cell: ({ row }) => {
                const regime = row.getValue("Libelle_Regime_Declaration") as string;
                return regime ? (
                    <Badge variant="secondary" className="text-xs">{regime}</Badge>
                ) : (
                    <span className="text-muted-foreground">-</span>
                );
            },
        },
        {
            accessorKey: "Code_Devise",
            header: "Devise",
            cell: ({ row }) => {
                const devise = row.getValue("Code_Devise") as string;
                return devise ? (
                    <Badge variant="outline" className="font-mono text-xs">{devise}</Badge>
                ) : (
                    <span className="text-muted-foreground">-</span>
                );
            },
        },
        {
            accessorKey: "Pays_Origine",
            header: "Pays d'Origine",
            cell: ({ row }) => {
                const pays = row.getValue("Pays_Origine") as string;
                return pays || "-";
            },
        },
        {
            accessorKey: "Regroupement_Client",
            header: "Regroupement Client",
            cell: ({ row }) => {
                const regroupement = row.getValue("Regroupement_Client") as string;
                return regroupement || "-";
            },
        },
    ];

    if (isLoading) {
        return (
            <div className="py-8">
                <LoadingState
                    title="Chargement des colisages..."
                    description="Veuillez patienter..."
                />
            </div>
        );
    }

    if (colisages.length === 0) {
        return (
            <EmptyState
                title="Aucun colisage"
                description="Importez un fichier Excel pour ajouter des colisages à ce dossier"
            />
        );
    }



    return (
        <>
            <CreateColisageDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                dossierId={dossierId}
                onSuccess={loadColisages}
            />
            <DeleteAllColisagesDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                colisages={colisages}
                selectedRows={selectedRows}
                onSuccess={handleDeleteSuccess}
            />
            <div className="space-y-4">
                {/* Header avec boutons */}
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Colisages</h3>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handleGeneratePDF}
                            variant="outline"
                            size="sm"
                            disabled={isGenerating}
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            {isGenerating ? 'Génération...' : 'Rapport PDF'}
                        </Button>
                        <Button
                            onClick={() => setShowCreateDialog(true)}
                            size="sm"
                        >
                            <Plus className="w-4 h-4" />
                            Nouveau colisage
                        </Button>
                    </div>
                </div>

                {/* Barre d'actions pour la sélection */}
                {colisages.length > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        {selectedRows.length > 0 ? (
                            <>
                                <span className="text-sm font-medium">
                                    {selectedRows.length} ligne(s) sélectionnée(s)
                                </span>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleDeleteClick}
                                    className="ml-auto"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Supprimer la sélection
                                </Button>
                            </>
                        ) : (
                            <>
                                <span className="text-sm font-medium">
                                    {colisages.length} colisage(s) au total
                                </span>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleDeleteClick}
                                    className="ml-auto"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Supprimer tout
                                </Button>
                            </>
                        )}
                    </div>
                )}

                {/* Tableau avec clic sur les lignes */}
                <DataTable 
                    columns={columns} 
                    data={colisages}
                    onRowClick={handleRowClick}
                    searchKey="HS_Code"
                    searchPlaceholder="Rechercher par HS Code..."
                    enableRowSelection={true}
                    onSelectionChange={setSelectedRows}
                />
            </div>
        </>
    );
};