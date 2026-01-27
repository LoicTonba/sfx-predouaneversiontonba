"use client";

import { DataTable } from "@/components/data-table";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { columns, DossierView } from "../components/columns";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { useMemo } from "react";
import { useDossiersFilters } from "../../hooks/use-dossiers-filters";

type Props = {
    dossiers: DossierView[];
    total?: number;
    currentPage?: number;
};

export const DossiersView = ({ dossiers }: Props) => {
    const router = useRouter();
    const { search } = useDossiersFilters();

    // Filtrer les données localement selon la recherche du header
    const filteredDossiers = useMemo(() => {
        if (!search) return dossiers;

        const searchLower = search.toLowerCase();
        return dossiers.filter(d =>
            d.No_Dossier?.toLowerCase().includes(searchLower) ||
            d.No_OT?.toLowerCase().includes(searchLower) ||
            d.Nom_Client?.toLowerCase().includes(searchLower) ||
            d.Libelle_Type_Dossier?.toLowerCase().includes(searchLower)
        );
    }, [dossiers, search]);

    console.log("filteredDossiers", filteredDossiers);

    return (
        <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
            {filteredDossiers && filteredDossiers.length > 0 ? (
                <DataTable
                    data={filteredDossiers}
                    columns={columns}
                    onRowClick={(row) => router.push(`/dossiers/${row.ID_Dossier}`)}
                />
            ) : (
                <EmptyState
                    title={search ? "Aucun dossier trouvé" : "Créer votre premier dossier"}
                    description={search ? `Aucun résultat pour "${search}"` : "Il n'y a pas encore de dossiers dans votre compte."}
                />
            )}
        </div>
    );
};

export const DossiersLoadingView = () => {
    return (
        <LoadingState
            title="Chargement des dossiers"
            description="Ceci peut prendre quelques secondes..."
        />
    );
};

export const DossiersErrorView = () => {
    return (
        <ErrorState
            title="Erreur du chargement des dossiers"
            description="Quelque chose n'a pas marché lors du chargement des dossiers. Veuillez réessayer."
        />
    );
};