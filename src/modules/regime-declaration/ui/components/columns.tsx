"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ColumnDef } from "@tanstack/react-table";
import { RegimeDeclarationWithDouanier } from "../../types";

// Fonction helper pour formater le taux régime
function formatTauxRegime(taux: number): string {
    if (taux === -2) return "TTC";
    if (taux === -1) return "100% TR";
    if (taux === 0) return "EXO";
    if (taux === 1) return "100% DC";
    if (taux > 0 && taux < 1) {
        return `${(taux * 100).toFixed(2)}% DC`;
    }
    return taux.toString();
}

export const columns: ColumnDef<RegimeDeclarationWithDouanier>[] = [
    {
        accessorKey: "libelle",
        header: "Libellé",
        cell: ({ row }) => (
            <span className="font-semibold">{row.original.libelleRegimeDeclaration}</span>
        ),
    },
    {
        accessorKey: "tauxRegime",
        header: "Taux Régime",
        cell: ({ row }) => {
            const taux = row.original.tauxRegime;
            return <span className="text-sm">{formatTauxRegime(Number(taux))}</span>;
        },
    },
    {
        accessorKey: "createdAt",
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