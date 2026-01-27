"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { PlusIcon, XCircleIcon, SearchIcon, FilterIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useDossiersFilters } from "../../hooks/use-dossiers-filters";
import { NewDossierDialog } from "./new-dossier-dialog";
import { FilterStatutDialog } from "./filter-statut-dialog";
import { FilterEtapeDialog } from "./filter-etape-dialog";

const DossiersHeader = () => {
    const { 
        search, 
        statutId, 
        etapeId, 
        setSearch, 
        setStatutId, 
        setEtapeId, 
        clearFilters 
    } = useDossiersFilters();
    
    const [inputValue, setInputValue] = useState(search);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isStatutFilterOpen, setIsStatutFilterOpen] = useState(false);
    const [isEtapeFilterOpen, setIsEtapeFilterOpen] = useState(false);
    const [statutLabels, setStatutLabels] = useState<Record<number, string>>({});
    const [etapeLabels, setEtapeLabels] = useState<Record<number, string>>({});

    const handleSearch = (value: string) => {
        setInputValue(value);
        setSearch(value);
    };

    const handleStatutFilter = (newStatutId: number | null) => {
        setStatutId(newStatutId);
    };

    const handleEtapeFilter = (newEtapeId: number | null) => {
        setEtapeId(newEtapeId);
    };

    const onClearFilters = () => {
        setInputValue("");
        clearFilters();
    };

    const hasActiveFilters = search || statutId !== null || etapeId !== null;

    useEffect(() => {
        const loadLabels = async () => {
            try {
                // Charger les statuts
                const { getAllStatutsDossiers, getAllEtapes } = await import("../../server/actions");
                
                const statutsResult = await getAllStatutsDossiers();
                if (statutsResult.success && statutsResult.data) {
                    const statutMap: Record<number, string> = {};
                    statutsResult.data.forEach(s => {
                        statutMap[s.id] = s.libelle;
                    });
                    setStatutLabels(statutMap);
                }

                // Charger les étapes
                const etapesResult = await getAllEtapes();
                if (etapesResult.success && etapesResult.data) {
                    const etapeMap: Record<number, string> = {};
                    etapesResult.data.forEach(e => {
                        if (e.id !== null && e.libelle !== null) {
                            etapeMap[e.id] = e.libelle;
                        }
                    });
                    setEtapeLabels(etapeMap);
                }
            } catch (error) {
                console.error("Error loading labels:", error);
            }
        };

        loadLabels();
    }, []);

    const getStatutLabel = (statutId: number | null) => {
        if (statutId === null) return null;
        return statutLabels[statutId] || `Statut ${statutId}`;
    };

    const getEtapeLabel = (etapeId: number | null) => {
        if (etapeId === null) return null;
        return etapeLabels[etapeId] || `Étape ${etapeId}`;
    };

    return (
        <>
            <NewDossierDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
            <FilterStatutDialog 
                open={isStatutFilterOpen} 
                onOpenChange={setIsStatutFilterOpen}
                onFilter={handleStatutFilter}
                selectedStatutId={statutId}
            />
            <FilterEtapeDialog 
                open={isEtapeFilterOpen} 
                onOpenChange={setIsEtapeFilterOpen}
                onFilter={handleEtapeFilter}
                selectedEtapeId={etapeId}
            />
            <div className="py-4 px-4 md:px-8 flex flex-col gap-y-4">
                <div className="flex items-center justify-between">
                    <h5 className="font-medium text-xl">Dossiers</h5>
                    <Button onClick={() => setIsDialogOpen(true)}>
                        <PlusIcon />
                        Nouveau Dossier
                    </Button>
                </div>
                <ScrollArea>
                    <div className="flex items-center gap-x-2 p-1">
                        <div className="relative">
                            <Input
                                placeholder="Rechercher un dossier..."
                                className="h-9 bg-white w-[250px] pl-7"
                                value={inputValue}
                                onChange={e => handleSearch(e.target.value)}
                            />
                            <SearchIcon className="size-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        </div>

                        {/* Boutons de filtres */}
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setIsStatutFilterOpen(true)}
                            className={statutId !== null ? "border-blue-500 bg-blue-50" : ""}
                        >
                            <FilterIcon className="w-4 h-4 mr-1" />
                            Statut
                            {statutId !== null && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                    {getStatutLabel(statutId)}
                                </Badge>
                            )}
                        </Button>

                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setIsEtapeFilterOpen(true)}
                            className={etapeId !== null ? "border-blue-500 bg-blue-50" : ""}
                        >
                            <FilterIcon className="w-4 h-4 mr-1" />
                            Étape
                            {etapeId !== null && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                    {getEtapeLabel(etapeId)}
                                </Badge>
                            )}
                        </Button>

                        {hasActiveFilters && (
                            <Button onClick={onClearFilters} variant="outline" size="sm">
                                <XCircleIcon className="w-4 h-4 mr-1 text-destructive" />
                                Effacer les filtres
                            </Button>
                        )}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
        </>
    );
};

export default DossiersHeader;