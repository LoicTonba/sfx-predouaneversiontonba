"use client";

import { DataTable } from "@/components/data-table";
import { columns } from "../components/columns";
import { useRouter } from "next/navigation";
import { RegimeDeclarationWithDouanier } from "../../types";

interface RegimeDeclarationViewProps {
    regimeDeclarations: RegimeDeclarationWithDouanier[];
}

export const RegimeDeclarationView = ({
    regimeDeclarations,
}: RegimeDeclarationViewProps) => {

    const router = useRouter();

    return (
        <div className="py-4 px-4 md:px-8 flex flex-col gap-y-4">
            <DataTable 
                columns={columns} 
                data={regimeDeclarations} 
                onRowClick={(row) => router.push(`/regime-declaration/${row.id}`)}
            />
           
        </div>
    );
};

export const RegimeDeclarationLoadingView = () => {
    return (
        <div className="py-4 px-4 md:px-8">
            <div className="animate-pulse space-y-4">
                <div className="h-10 bg-gray-200 rounded" />
                <div className="h-64 bg-gray-200 rounded" />
            </div>
        </div>
    );
};

export const RegimeDeclarationErrorView = () => {
    return (
        <div className="py-4 px-4 md:px-8">
            <div className="text-center py-8">
                <p className="text-red-600">Erreur lors du chargement des régimes de déclaration</p>
            </div>
        </div>
    );
};