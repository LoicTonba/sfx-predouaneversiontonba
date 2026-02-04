"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Trash2, RefreshCw, Download, FileSpreadsheet, FileDown } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/hooks/use-confirm";
import {
    genererNotesDetail,
    supprimerNotesDetail,
    getNotesDetail
} from "../../server/note-detail-actions";
import { GenererNotesDialog } from "../components/generer-notes-dialog";
import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/loading-state";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NoteDetailViewProps {
    dossierId: number;
    entiteId: number;
}

export const NoteDetailView = ({ dossierId, entiteId }: NoteDetailViewProps) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [notes, setNotes] = useState<any[]>([]);
    const [showGenererDialog, setShowGenererDialog] = useState(false);
    const router = useRouter();

    const [DeleteConfirmation, confirmDelete] = useConfirm(
        "Supprimer la note de détails?",
        "Voulez-vous vraiment supprimer toutes les lignes de la note de détails ? Cette action est irréversible."
    );

    useEffect(() => {
        loadNotes();
    }, [dossierId]);

    const loadNotes = async () => {
        console.log(" [loadNotes] Début - dossierId:", dossierId);
        setIsLoading(true);
        try {
            const result = await getNotesDetail(dossierId);
            console.log(" [loadNotes] Résultat reçu:", result);
            console.log(" [loadNotes] success:", result.success);
            console.log(" [loadNotes] data:", result.data);
            console.log(" [loadNotes] data.length:", result.data?.length);
            
            if (result.success && result.data) {
                console.log(" [loadNotes] Mise à jour du state avec", result.data.length, "notes");
                setNotes(result.data);
            } else {
                console.log(" [loadNotes] Pas de données ou erreur:", result.error);
            }
        } catch (error) {
            console.error(" [loadNotes] Error loading notes:", error);
        } finally {
            setIsLoading(false);
            console.log(" [loadNotes] Fin");
        }
    };

    const handleDelete = async () => {
        const ok = await confirmDelete();
        if (!ok) return;

        setIsDeleting(true);
        try {
            const result = await supprimerNotesDetail(dossierId);

            if (result.success) {
                toast.success("Note de détails supprimée avec succès");
                await loadNotes();
                router.refresh();
            } else {
                toast.error(result.error || "Erreur lors de la suppression");
            }
        } catch (error) {
            toast.error("Erreur lors de la suppression de la note");
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    const exportToExcel = () => {
        try {
            const XLSX = require("xlsx");

            const exportData = notes.map((note) => ({
                "Groupement": note.Regroupement_Client || "",
                "Régime Déclaration": note.Libelle_Regime_Declaration || "",
                "Régime": note.Regime || "",
                "Pays d'origine": note.Pays_Origine || "",
                "HS Code": note.HS_Code || "",
                "Quantité": Number(note.Qte_Colis),
                "Prix Unitaire": Number(note.Prix_Unitaire_Colis),
                "Prix Total": Number(note.Qte_Colis) * Number(note.Prix_Unitaire_Colis),
                "Volume (m³)": Number(note.Volume),
                "Poids Brut (kg)": Number(note.Poids_Brut || 0),
                "Poids Net (kg)": Number(note.Poids_Net || 0),
            }));

            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Note de Détails");

            worksheet['!cols'] = [
                { wch: 15 }, // Groupement
                { wch: 30 }, // Régime Déclaration
                { wch: 10 }, // Régime
                { wch: 20 }, // Pays d'origine
                { wch: 15 }, // HS Code
                { wch: 12 }, // Quantité
                { wch: 12 }, // Prix Unitaire
                { wch: 15 }, // Prix Total
                { wch: 12 }, // Volume
                { wch: 12 }, // Poids Brut
                { wch: 12 }, // Poids Net
            ];

            XLSX.writeFile(workbook, `note-details-dossier-${dossierId}.xlsx`);
            toast.success("Export Excel réussi");
        } catch (error) {
            toast.error("Erreur lors de l'export Excel");
            console.error(error);
        }
    };

    const exportToCSV = () => {
        try {
            const headers = [
                "Groupement", "Régime Déclaration", "Régime", 
                "Pays d'origine", "HS Code", "Quantité", "Prix Unitaire", "Prix Total", "Volume (m³)", "Poids Brut (kg)", "Poids Net (kg)"
            ];

            const rows = notes.map((note) => [
                `"${(note.Regroupement_Client || "").replace(/"/g, '""')}"`,
                `"${(note.Libelle_Regime_Declaration || "").replace(/"/g, '""')}"`,
                note.Regime || "",
                `"${(note.Pays_Origine || "").replace(/"/g, '""')}"`,
                note.HS_Code || "",
                Number(note.Qte_Colis),
                Number(note.Prix_Unitaire_Colis),
                Number(note.Qte_Colis) * Number(note.Prix_Unitaire_Colis),
                Number(note.Volume),
                Number(note.Poids_Brut || 0),
                Number(note.Poids_Net || 0),
            ]);

            const csvContent = [
                headers.join(","),
                ...rows.map(row => row.join(","))
            ].join("\n");

            const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `note-details-dossier-${dossierId}.csv`);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("Export CSV réussi");
        } catch (error) {
            toast.error("Erreur lors de l'export CSV");
            console.error(error);
        }
    };

    const exportToPDF = async () => {
        try {
            const jsPDF = (await import("jspdf")).default;
            const autoTable = (await import("jspdf-autotable")).default;

            const doc = new jsPDF({
                orientation: "landscape",
                unit: "mm",
                format: "a4"
            });

            // === EN-TÊTE AVEC LOGO ===
            // Bordure d'en-tête
            doc.setDrawColor(245, 158, 66);
            doc.setLineWidth(0.5);
            doc.line(14, 8, 283, 8);
            doc.line(14, 32, 283, 32);

            // Essayer d'ajouter le logo PNG
            try {
                const logoResponse = await fetch('/logo.png');
                if (logoResponse.ok) {
                    const logoBlob = await logoResponse.blob();
                    const logoBase64 = await new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result as string);
                        reader.readAsDataURL(logoBlob);
                    });
                    
                    // Ajouter le logo (ajuster la taille selon le logo)
                    doc.addImage(logoBase64, 'PNG', 16, 10, 20, 20);
                    
                    // Nom de l'entreprise à côté du logo
                    doc.setFontSize(16);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(245, 158, 66);
                    doc.text('SFX PRE-DOUANE', 42, 18);
                    
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(100, 100, 100);
                    doc.text('Solutions de déclaration dans CAMCIS', 42, 24);
                } else {
                    throw new Error('Logo non trouvé');
                }
            } catch (error) {
                // Fallback sans logo
                doc.setFontSize(18);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(245, 158, 66);
                doc.text('SFX PRE-DOUANE', 16, 20);
                
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(100, 100, 100);
                doc.text('Solutions de déclaration dans CAMCIS', 16, 26);
            }

            // === TITRE ET INFORMATIONS ===
            // Titre principal centré
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            const titleWidth = doc.getTextWidth('NOTE DE DÉTAIL');
            doc.text('NOTE DE DÉTAIL', (297 - titleWidth) / 2, 18);

            // Informations du dossier (côté droit)
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(245, 158, 66);
            doc.text(`DOSSIER N° ${dossierId}`, 220, 15);
            
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            doc.text(`Date d'export: ${new Date().toLocaleDateString('fr-FR', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric' 
            })}`, 220, 20);
            doc.text(`Heure: ${new Date().toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            })}`, 220, 25);

            // === DESCRIPTION ===
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(60, 60, 60);
            doc.text('Ce document présente le détail des colisages validés pour intégration dans le système CAMSIS.', 14, 38);
            doc.text('Toutes les informations ont été vérifiées et sont prêtes pour la déclaration douanière.', 14, 43);

            // === STATISTIQUES DANS UN ENCADRÉ ===
            const dcCount = notes.filter(n => n.Regime === "DC").length;
            const trCount = notes.filter(n => n.Regime === "TR").length;
            const totalPoids = notes.reduce((sum, n) => sum + Number(n.Poids_Brut || 0), 0);
            const totalVolume = notes.reduce((sum, n) => sum + Number(n.Volume || 0), 0);
            const totalValeur = notes.reduce((sum, n) => sum + (Number(n.Qte_Colis) * Number(n.Prix_Unitaire_Colis)), 0);

            // Encadré pour les statistiques
            doc.setFillColor(248, 249, 250);
            doc.rect(14, 47, 269, 16, 'F');
            doc.setDrawColor(200, 200, 200);
            doc.rect(14, 47, 269, 16, 'S');

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text('RÉSUMÉ STATISTIQUE', 16, 52);

            doc.setFont('helvetica', 'normal');
            doc.text(`• Total lignes: ${notes.length}`, 16, 57);
            doc.text(`• Régime DC: ${dcCount}`, 70, 57);
            doc.text(`• Régime TR: ${trCount}`, 120, 57);
            doc.text(`• Poids total: ${totalPoids.toFixed(2)} kg`, 170, 57);
            doc.text(`• Volume total: ${totalVolume.toFixed(2)} m³`, 16, 61);
            doc.text(`• Valeur totale: ${totalValeur.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}`, 120, 61);

            const tableData = notes.map((note) => [
                (note.Regroupement_Client || "").substring(0, 15),
                (note.Libelle_Regime_Declaration || "").substring(0, 20),
                (note.Pays_Origine || "").substring(0, 15),
                note.HS_Code || "",
                note.Regime || "",
                Number(note.Qte_Colis).toFixed(2),
                Number(note.Prix_Unitaire_Colis).toFixed(2),
                (Number(note.Qte_Colis) * Number(note.Prix_Unitaire_Colis)).toFixed(2),
                Number(note.Volume).toFixed(2),
                Number(note.Poids_Brut || 0).toFixed(2),
                Number(note.Poids_Net || 0).toFixed(2),
                Number(note.Nbre_Paquetage || 0).toFixed(0),
            ]);

            // === TABLEAU DES DONNÉES ===
            const pageWidth = doc.internal.pageSize.getWidth();
            const marginLeft = 14;
            const marginRight = 14;
            const availableWidth = pageWidth - marginLeft - marginRight;

            autoTable(doc, {
                startY: 68,
                margin: { left: marginLeft, right: marginRight },
                tableWidth: availableWidth,
                head: [["Groupement", "Régime Décl.", "Pays D'origine", "HS Code", "" ,"Qté", "Prix Unit.", "Prix Total", "Volume", "Poids Brut", "Poids Net", "Nbre Paquetage"]],
                body: tableData,
                styles: { 
                    fontSize: 8,
                    cellPadding: 2,
                    lineColor: [200, 200, 200],
                    lineWidth: 0.1,
                    overflow: 'linebreak',
                    halign: 'left'
                },
                headStyles: { 
                    fillColor: [245, 158, 66],
                    textColor: [255, 255, 255],
                    fontSize: 9,
                    fontStyle: 'bold',
                    halign: 'center'
                },
                alternateRowStyles: { fillColor: [248, 249, 250] },
                columnStyles: {
                    2: { halign: 'center' }, // Régime
                    4: { halign: 'center' }, // HS Code
                    5: { halign: 'right' }, // Qté
                    6: { halign: 'right' }, // Prix Unit.
                    7: { halign: 'right' }, // Prix Total
                    8: { halign: 'right' }, // Volume
                    9: { halign: 'right' }, // Poids Brut
                    10: { halign: 'right' }, // Poids Net
                    11: { halign: 'right' }, // Nbre Paquetage
                },
            });

            // === PIED DE PAGE ===
            const pageHeight = doc.internal.pageSize.height;
            
            // Ligne de séparation
            doc.setDrawColor(200, 200, 200);
            doc.line(14, pageHeight - 20, 283, pageHeight - 20);
            
            // Informations de pied de page
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text('SFX PRE-DOUANE', 14, pageHeight - 15);
            doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 14, pageHeight - 10);
            
            // Numéro de page (côté droit)
            doc.text('Page 1', 270, pageHeight - 10);

            doc.save(`note-details-dossier-${dossierId}-${new Date().toISOString().split('T')[0]}.pdf`);
            toast.success("Export PDF réussi");
        } catch (error) {
            toast.error("Erreur lors de l'export PDF");
            console.error(error);
        }
    };

    const columns: ColumnDef<any>[] = [
        // 1. Groupement
        {
            accessorKey: "Regroupement_Client",
            header: "Groupement",
            cell: ({ row }) => {
                const groupement = row.getValue("Regroupement_Client") as string;
                return (
                    <div className="text-xs" title={groupement}>
                        {groupement || "-"}
                    </div>
                );
            },
        },
        // 2. Régime déclaration
        {
            accessorKey: "Libelle_Regime_Declaration",
            header: "Régime Déclaration",
            cell: ({ row }) => {
                const libelle = row.getValue("Libelle_Regime_Declaration") as string;
                return (
                    <div className="max-w-xs truncate text-xs" title={libelle}>
                        {libelle || "-"}
                    </div>
                );
            },
        },
        // 3. Pays d'origine
        {
            accessorKey: "Pays_Origine",
            header: "Pays d'origine",
            cell: ({ row }) => {
                const pays = row.getValue("Pays_Origine") as string;
                return (
                    <div className="text-xs" title={pays}>
                        {pays || "-"}
                    </div>
                );
            },
        },
        // 4. HS Code
        {
            accessorKey: "HS_Code",
            header: "HS Code",
            cell: ({ row }) => {
                const hsCode = row.getValue("HS_Code") as string;
                return (
                    <div className="text-xs font-mono" title={hsCode}>
                        {hsCode || "-"}
                    </div>
                );
            },
        },
        // 5. Régime
        {
            accessorKey: "Regime",
            header: "-",
            cell: ({ row }) => {
                const regime = row.getValue("Regime") as string;
                const color = regime === "DC" ? "bg-red-100 text-red-800" :
                    regime === "TR" ? "bg-green-100 text-green-800" :
                        "bg-gray-100 text-gray-800";
                return (
                    <Badge className={color}>
                        {regime || ""}
                    </Badge>
                );
            },
        },
        // 6. Quantité
        {
            accessorKey: "Qte_Colis",
            header: "Quantité",
            cell: ({ row }) => {
                const qte = row.getValue("Qte_Colis") as number;
                return Number(qte).toFixed(2);
            },
        },
        // 7. Prix
        {
            accessorKey: "Prix_Unitaire_Colis",
            header: "Prix",
            cell: ({ row }) => {
                const prix = row.getValue("Prix_Unitaire_Colis") as number;
                return Number(prix).toFixed(2);
            },
        },
        // 8. Volume
        {
            accessorKey: "Volume",
            header: "Volume",
            cell: ({ row }) => {
                const vol = row.getValue("Volume") as number;
                return `${Number(vol).toFixed(2)} m³`;
            },
        },
        // 9. Prix Total (Quantité × Prix Unitaire)
        {
            id: "prixTotal",
            header: "Prix Total",
            cell: ({ row }) => {
                const qte = Number(row.getValue("Qte_Colis") || 0);
                const prix = Number(row.getValue("Prix_Unitaire_Colis") || 0);
                const total = qte * prix;
                return (
                    <div className="font-semibold text-green-700">
                        {total.toFixed(2)}
                    </div>
                );
            },
        },
        // 10. Poids Brut
        {
            accessorKey: "Poids_Brut",
            header: "Poids Brut",
            cell: ({ row }) => {
                const poids = row.getValue("Poids_Brut") as number;
                return `${Number(poids || 0).toFixed(2)} kg`;
            },
        },
        // 11. Poids Net
        {
            accessorKey: "Poids_Net",
            header: "Poids Net",
            cell: ({ row }) => {
                const poids = row.getValue("Poids_Net") as number;
                return `${Number(poids || 0).toFixed(2)} kg`;
            },
        },
        // 12. Nombre de Paquetages
        {
            accessorKey: "Nbre_Paquetage",
            header: "Nbre Paquetage",
            cell: ({ row }) => {
                const nbre = row.getValue("Nbre_Paquetage") as number;
                return Number(nbre || 0).toFixed(0);
            },
        },
    ];

    if (isLoading) {
        return (
            <div className="py-8">
                <LoadingState
                    title="Chargement de la note de détails..."
                    description="Veuillez patienter..."
                />
            </div>
        );
    }

    return (
        <>
            <DeleteConfirmation />
            <GenererNotesDialog
                open={showGenererDialog}
                onOpenChange={(open) => {
                    setShowGenererDialog(open);
                    if (!open) {
                        loadNotes();
                    }
                }}
                dossierId={dossierId}
                entiteId={entiteId}
            />
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium">
                            Note de Détails
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Générez la note de détails à partir des colisages et régimes de déclaration
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {notes.length > 0 && (
                            <>
                                <Button
                                    onClick={loadNotes}
                                    variant="outline"
                                    size="sm"
                                    disabled={isDeleting}
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </Button>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={isDeleting}
                                        >
                                            <Download className="w-4 h-4" />
                                            Exporter
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={exportToExcel}>
                                            <FileSpreadsheet className="w-4 h-4 mr-2" />
                                            Excel (.xlsx)
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={exportToPDF}>
                                            <FileText className="w-4 h-4 mr-2" />
                                            PDF
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={exportToCSV}>
                                            <FileDown className="w-4 h-4 mr-2" />
                                            CSV
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <Button
                                    onClick={handleDelete}
                                    variant="outline"
                                    size="sm"
                                    disabled={isDeleting}
                                    className="text-destructive hover:text-destructive"
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Suppression...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            Supprimer
                                        </>
                                    )}
                                </Button>
                            </>
                        )}
                        <Button
                            onClick={() => setShowGenererDialog(true)}
                            disabled={isDeleting}
                            size="sm"
                        >
                            <FileText className="w-4 h-4" />
                            {notes.length > 0 ? "Régénérer" : "Générer"}
                        </Button>
                    </div>
                </div>

                {notes.length > 0 && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Lignes</p>
                                    <p className="text-2xl font-bold">{notes.length}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Lignes DC</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {notes.filter(n => n.Regime === "DC").length}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Lignes TR</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {notes.filter(n => n.Regime === "TR").length}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Poids Total</p>
                                    <p className="text-2xl font-bold">
                                        {notes.reduce((sum, n) => sum + Number(n.Poids_Brut || 0), 0).toFixed(2)} kg
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Volume Total</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {notes.reduce((sum, n) => sum + Number(n.Volume || 0), 0).toFixed(2)} m³
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Valeur Totale</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {notes.reduce((sum, n) => sum + (Number(n.Qte_Colis || 0) * Number(n.Prix_Unitaire_Colis || 0)), 0).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {notes.length > 0 ? (
                    <DataTable 
                        columns={columns} 
                        data={notes}
                        searchKey="Libelle_Regime_Declaration"
                        searchPlaceholder="Rechercher par régime déclaration..."
                    />
                ) : (
                    <EmptyState
                        title="Aucune note de détails"
                        description="Cliquez sur 'Générer' pour créer la note de détails à partir des colisages"
                    />
                )}
            </div>
        </>
    );
};