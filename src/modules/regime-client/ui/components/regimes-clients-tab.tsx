"use client";

import { useEffect, useState } from "react";
import { LoadingState } from "@/components/loading-state";
import { EmptyState } from "@/components/empty-state";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Filter, X } from "lucide-react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { CreateRegimeClientDialog } from "./create-regime-client-dialog";
import { FilterClientDialog } from "../../../clients/ui/components/filter-client-dialog";
import { CleanupButton } from "./cleanup-button";
import { useConfirm } from "@/hooks/use-confirm";
import { getRegimesClients, deleteRegimeClient } from "../../server/regime-client-actions";

interface RegimeClient {
    id: number;
    clientId: number;
    clientNom: string;
    regimeId: number;
    regimeLibelle: string;
    tauxRegime: number;
    dateCreation: string;
    nomCreation: string;
}

export const RegimesClientsTab = () => {
    const [regimesClients, setRegimesClients] = useState<RegimeClient[]>([]);
    const [filteredRegimesClients, setFilteredRegimesClients] = useState<RegimeClient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showFilterDialog, setShowFilterDialog] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
    const [selectedClientName, setSelectedClientName] = useState<string | null>(null);

    const [ConfirmDialog, confirm] = useConfirm(
        "Confirmer la suppression",
        "Voulez-vous vraiment supprimer cette association ? Cette action est irréversible."
    );

    useEffect(() => {
        loadRegimesClients();
    }, []);

    useEffect(() => {
        applyFilter();
    }, [regimesClients, selectedClientId]);

    const loadRegimesClients = async () => {
        setIsLoading(true);
        try {
            const result = await getRegimesClients();
            if (result.success && result.data) {
                setRegimesClients(result.data);
            } else {
                toast.error(result.error || "Erreur lors du chargement");
            }
        } catch (error) {
            console.error("Error loading regimes clients:", error);
            toast.error("Erreur lors du chargement");
        } finally {
            setIsLoading(false);
        }
    };

    const applyFilter = () => {
        if (selectedClientId === null) {
            setFilteredRegimesClients(regimesClients);
        } else {
            const filtered = regimesClients.filter(rc => rc.clientId === selectedClientId);
            setFilteredRegimesClients(filtered);
        }
    };

    const handleFilter = (clientId: number | null) => {
        setSelectedClientId(clientId);
        if (clientId === null) {
            setSelectedClientName(null);
        } else {
            const client = regimesClients.find(rc => rc.clientId === clientId);
            setSelectedClientName(client?.clientNom || null);
        }
    };

    const handleClearFilter = () => {
        setSelectedClientId(null);
        setSelectedClientName(null);
    };

    const handleDelete = async (regimeClient: RegimeClient) => {
        const ok = await confirm();
        if (!ok) return;

        try {
            const result = await deleteRegimeClient(regimeClient.id);
            if (result.success) {
                toast.success("Association supprimée");
                loadRegimesClients();
            } else {
                toast.error(result.error || "Erreur lors de la suppression");
            }
        } catch (error) {
            toast.error("Erreur lors de la suppression");
        }
    };

    const columns: ColumnDef<RegimeClient>[] = [
        {
            accessorKey: "clientNom",
            header: "Client",
            cell: ({ row }) => (
                <div className="font-medium">{row.getValue("clientNom")}</div>
            ),
        },
        {
            accessorKey: "regimeLibelle",
            header: "Régime de déclaration",
            cell: ({ row }) => (
                <Badge variant="secondary">{row.getValue("regimeLibelle")}</Badge>
            ),
        },
        {
            accessorKey: "tauxRegime",
            header: "Taux Régime",
            cell: ({ row }) => {
                // Garde-fou: évite le crash `undefined.toString()` si la donnée est absente.
                const rawTaux = row.getValue("tauxRegime");
                const taux = typeof rawTaux === "number" ? rawTaux : Number(rawTaux);
                if (!Number.isFinite(taux)) {
                    return <Badge variant="outline">-</Badge>;
                }
                let label = "";
                let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
                
                if (taux === -2) {
                    label = "TTC";
                    variant = "secondary";
                } else if (taux === -1) {
                    label = "100% TR";
                    variant = "default";
                } else if (taux === 0) {
                    label = "EXO";
                    variant = "outline";
                } else if (taux === 1) {
                    label = "100% DC";
                    variant = "default";
                } else if (taux > 0 && taux < 1) {
                    label = `${(taux * 100).toFixed(1)}% DC`;
                    variant = "outline";
                } else {
                    label = String(taux);
                }
                return (
                    <Badge variant={variant}>
                        {label}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "dateCreation",
            header: "Date de création",
            cell: ({ row }) => {
                const dateValue = row.getValue("dateCreation") as string;
                if (!dateValue) return "-";
                
                try {
                    const date = new Date(dateValue);
                    if (isNaN(date.getTime())) return "-";
                    return date.toLocaleDateString("fr-FR");
                } catch {
                    return "-";
                }
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const regimeClient = row.original;
                return (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(regimeClient)}
                        className="text-destructive hover:text-destructive"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                    </Button>
                );
            },
        },
    ];

    if (isLoading) {
        return (
            <LoadingState 
                title="Chargement des associations..." 
                description="Veuillez patienter..." 
            />
        );
    }

    return (
        <>
            <ConfirmDialog />
            
            <CreateRegimeClientDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                onSuccess={() => {
                    setShowCreateDialog(false);
                    loadRegimesClients();
                    toast.success("Association créée avec succès");
                }}
            />

            <FilterClientDialog
                open={showFilterDialog}
                onOpenChange={setShowFilterDialog}
                onFilter={handleFilter}
                selectedClientId={selectedClientId}
            />

            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-medium">Associations régimes-clients</h3>
                    <p className="text-sm text-muted-foreground">
                        Gérez les associations entre clients et régimes de déclaration
                        {selectedClientName && (
                            <span className="ml-2 text-primary">
                                • Filtré par: {selectedClientName}
                            </span>
                        )}
                    </p>
                </div>
                
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowFilterDialog(true)}
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        Filtrer
                        {selectedClientId && (
                            <Badge variant="secondary" className="ml-2">
                                1
                            </Badge>
                        )}
                    </Button>
                    
                    {selectedClientId && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearFilter}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                    
                    <CleanupButton />
                    
                    <Button onClick={() => setShowCreateDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nouvelle association
                    </Button>
                </div>
            </div>

            {filteredRegimesClients.length === 0 ? (
                <EmptyState
                    title={selectedClientId ? "Aucune association pour ce client" : "Aucune association"}
                    description={
                        selectedClientId 
                            ? `Aucune association régime-client n'a été trouvée pour ${selectedClientName}.`
                            : "Aucune association régime-client n'a été trouvée."
                    }
                />
            ) : (
                <DataTable
                    columns={columns}
                    data={filteredRegimesClients}
                    searchKey="clientNom"
                    searchPlaceholder="Rechercher par client..."
                />
            )}
        </>
    );
};
