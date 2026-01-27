"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const columns: ColumnDef<any>[] = [
    {
        accessorKey: "Date_Convertion",
        header: "Date de conversion",
        cell: ({ row }) => {
            const dateValue = row.getValue("Date_Convertion");
            if (!dateValue) return "N/A";
            try {
                const date = new Date(dateValue as string);
                return format(date, "dd MMMM yyyy", { locale: fr });
            } catch {
                return "N/A";
            }
        },
    },
    {
        accessorKey: "Date_Creation",
        header: "Date de création",
        cell: ({ row }) => {
            const dateValue = row.getValue("Date_Creation");
            if (!dateValue) return "N/A";
            try {
                const date = new Date(dateValue as string);
                return format(date, "dd/MM/yyyy HH:mm", { locale: fr });
            } catch {
                return "N/A";
            }
        },
    },
];