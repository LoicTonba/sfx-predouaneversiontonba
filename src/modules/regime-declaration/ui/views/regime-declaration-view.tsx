"use client";

import { DataTable } from "@/components/data-table";
import { columns } from "../components/columns";
import { useRouter } from "next/navigation";
import { RegimeDeclarationWithDouanier } from "../../types";

interface RegimeDeclarationViewProps {
    regimeDeclarations: RegimeDeclarationWithDouanier[];
    total: number;
    currentPage: number;
}

export const RegimeDeclarationView = ({
    regimeDeclarations,
    total,
    currentPage,
}: RegimeDeclarationViewProps) => {
    const pageSize = 10;
    const totalPages = Math.ceil(total / pageSize);

    const router = useRouter();

    const handlePageChange = (page: number) => {
        const url = new URL(window.location.href);
        url.searchParams.set("page", page.toString());
        window.location.href = url.toString();
    };

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