"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { CornerDownRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Type basé sur VDossiers
export type DossierView = {
    ID_Dossier: number;
    No_Dossier: string | null;
    No_OT: string | null;
    Nom_Client: string;
    Libelle_Type_Dossier: string;
    Libelle_Sens_Trafic: string;
    Libelle_Mode_Transport: string;
    Nbre_Paquetage_Pesee: number;
    Poids_Brut_Pesee: number;
    Poids_Net_Pesee: number;
    Volume_Pesee: number;
    Description_Dossier: string;
    Libelle_Statut_Dossier: string;
    Nom_Responsable: string;
    Libelle_Etape_Actuelle: string | null;
    Date_Creation: Date;
    Date_Ouverture_Dossier: Date | null;
};

export const columns: ColumnDef<DossierView>[] = [    
    {
        accessorKey: "No_Dossier",
        header: "N° Dossier / N° OT",
        cell: ({ row }) => (
            <div className="flex flex-col gap-y-1">
                <span className="font-semibold">{row.original.No_Dossier || "N/A"}</span>
                <div className="flex items-center gap-x-1">
                    <CornerDownRightIcon className="size-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                        {row.original.No_OT || "N/A"}dsf
                        {row.original.ID_Dossier || "N/A"}
                    </span>
                </div>
            </div>
        ),
    },
    {
        id: "globalSearch",
        accessorFn: (row) => `${row.No_Dossier || ''} ${row.No_OT || ''} ${row.Nom_Client} ${row.Libelle_Type_Dossier}`.toLowerCase(),
        header: "",
        cell: () => null,
        enableSorting: false,
        enableHiding: false,
        size: 0,
    },
    {
        accessorKey: "Nom_Client",
        header: "Client",
        cell: ({ row }) => (
            <span className="capitalize">{row.original.Nom_Client}</span>
        ),
    },
    {
        accessorKey: "Libelle_Type_Dossier",
        header: "Type / Sens",
        cell: ({ row }) => (
            <div className="flex flex-col gap-y-1">
                <span className="font-semibold text-sm">{row.original.Libelle_Type_Dossier}</span>
                <div className="flex items-center gap-x-1">
                    <CornerDownRightIcon className="size-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                        {row.original.Libelle_Sens_Trafic}
                    </span>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "Libelle_Mode_Transport",
        header: "Mode Transport",
        cell: ({ row }) => (
            <Badge variant="outline" className="capitalize">
                {row.original.Libelle_Mode_Transport}
            </Badge>
        ),
    },
    {
        accessorKey: "Nbre_Paquetage_Pesee",
        header: "Colis / Poids",
        cell: ({ row }) => (
            <div className="flex flex-col gap-y-1">
                <span className="font-semibold text-sm">{Number(row.original.Nbre_Paquetage_Pesee)} colis</span>
                <div className="flex items-center gap-x-1">
                    <CornerDownRightIcon className="size-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                        {Number(row.original.Poids_Brut_Pesee).toFixed(2)} kg
                    </span>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "Libelle_Etape_Actuelle",
        header: "Étape Actuelle",
        cell: ({ row }) => {
            const etape = row.original.Libelle_Etape_Actuelle;
            const etapeCOlor: Record<string, string> = {
                "Ouvert": "bg-blue-100 text-blue-800 border-blue-200",
                "File Opening": "bg-amber-100 text-amber-800 border-amber-200",
                "Operations Completed": "bg-emerald-100 text-emerald-800 border-emerald-200",
                "Operations Cancelled": "bg-red-100 text-red-800 border-red-200",
            };
            return etape ? (
                <Badge variant="secondary" className={cn("capitalize",
                    etapeCOlor[etape] || "bg-slate-100 text-slate-800 border-slate-200"
                )}>
                    {etape}
                </Badge>
            ) : (
                <span className="text-muted-foreground text-sm">-</span>
            );
        },
    },
    {
        accessorKey: "Libelle_Statut_Dossier",
        header: "Statut",
        cell: ({ row }) => {
            const status = row.original.Libelle_Statut_Dossier;
            const statusColor: Record<string, string> = {
                "Ouvert": "bg-blue-100 text-blue-800 border-blue-200",
                "Operations in progress": "bg-amber-100 text-amber-800 border-amber-200",
                "Operations completed": "bg-emerald-100 text-emerald-800 border-emerald-200",
                "Operations Cancelled": "bg-red-100 text-red-800 border-red-200",
            };

            console.log("Status:", status);

            return (
                <Badge className={statusColor[status] || "bg-slate-100 text-slate-800 border-slate-200"}>
                    {status}
                    
                </Badge>
            );
        },
    },
    {
        accessorKey: "Nom_Responsable",
        header: "Responsable",
        cell: ({ row }) => (
            <Badge variant="outline" className="capitalize">
                {row.original.Nom_Responsable}
            </Badge>
        ),
    },
];