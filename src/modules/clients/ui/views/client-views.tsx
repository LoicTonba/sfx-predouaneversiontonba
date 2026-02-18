"use client";

import { DataTable } from "@/components/data-table";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { columns } from "../components/columns";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { useMemo, useState } from "react";
import { useClientsSearch } from "../../hooks/use-clients-search";
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from "@/constants";

// Type pour VClients (vue SQL Server)
type VClient = {
  ID_Client: number;
  Nom_Client: string;
  ID_Entite: number;
  Date_Creation: Date | string;
  Nom_Creation: string | null;
};

type Props = {
  client: VClient[];
  total?: number;
  currentPage?: number;
};

export const ClientView = ({ client, total = 0, currentPage = DEFAULT_PAGE }: Props) => {
  const router = useRouter();
  const { search } = useClientsSearch();
  const [page, setPage] = useState(currentPage || DEFAULT_PAGE);

  const pageSize = DEFAULT_PAGE_SIZE;

  // Filtrer les données localement
  const filteredClients = useMemo(() => {
    if (!search) return client;

    const searchLower = search.toLowerCase();
    return client.filter((c: any) =>
      c.Nom_Client?.toLowerCase().includes(searchLower) ||
      c.nom?.toLowerCase().includes(searchLower)
    );
  }, [client, search])

  // Paginer les données filtrées
  const paginatedClients = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredClients.slice(startIndex, endIndex);
  }, [filteredClients, page, pageSize]);

  const totalPages = filteredClients.length > 0 ? Math.ceil(filteredClients.length / pageSize) : 1;

  return (
    <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
      {paginatedClients && paginatedClients.length > 0 && (
        <DataTable
          data={paginatedClients}
          columns={columns as any}
          onRowClick={(row) => router.push(`/client/${(row as any).ID_Client}`)}
        />
      )}

      {filteredClients?.length === 0 && (
        <EmptyState
          title={search ? "Aucun client trouvé" : "Creer votre premier Client"}
          description={search ? `Aucun résultat pour "${search}"` : "Il n'y a pas encore de Clients dans votre compte."}
        />
      )}
    </div>
  );
};

export const ClientLoadingView = () => {
  return (
    <LoadingState
      title="Chargements Clients"
      description="Ceci peut prendre quelques secondes..."
    />
  );
};

export const ClientErrorView = () => {
  return (
    <ErrorState
      title="Erreur du chargements des Clients"
      description="Quelque chose n'a pas marcher lors du chargement des Clients. Veuillez reessayer."
    />
  );
};
