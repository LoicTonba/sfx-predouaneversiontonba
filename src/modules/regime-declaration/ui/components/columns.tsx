"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ColumnDef } from "@tanstack/react-table";
import { RegimeDeclarationWithDouanier } from "../../types";

export const columns: ColumnDef<RegimeDeclarationWithDouanier>[] = [
    {
        accessorKey: "libelle",
        header: "Libellé",
        cell: ({ row }) => (
            <span className="font-semibold">{row.original.libelleRegimeDeclaration}</span>
        ),
    },
    {
        accessorKey: "taux_dc",
        header: "Taux DC",
        cell: ({ row }) => (
            <span className="text-sm">{(row.original.tauxDC * 100).toFixed(2)}%</span>
        ),
    },
    {
        accessorKey: "date_creation",
        header: "Créé le",
        cell: ({ row }) => {
            const date = row.original.dateCreation;
            if (!date) return "-";
            try {
                return format(new Date(date), "dd MMM yyyy", { locale: fr });
            } catch {
                return "-";
            }
        },
    },
];