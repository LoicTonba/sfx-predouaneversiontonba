"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { PlusIcon, XCircleIcon, SearchIcon } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useRegimeDeclarationSearch } from "../../hooks/use-regime-declaration-search";
import { NewRegimeDeclarationDialog } from "./new-regime-declaration-dialog";

export const RegimeDeclarationListHeader = () => {
    const { search, setSearch } = useRegimeDeclarationSearch();
    const [inputValue, setInputValue] = useState("");
    const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);

    const handleSearch = (value: string) => {
        setInputValue(value);
        setSearch(value);
    };

    const onClearFilters = () => {
        setInputValue("");
        setSearch("");
    };

    return (
        <>
            <NewRegimeDeclarationDialog
                open={isNewDialogOpen}
                onOpenChange={setIsNewDialogOpen}
            />
            <div className="py-4 px-4 md:px-8 flex flex-col gap-y-4">
                <div className="flex items-center justify-between">
                    <h5 className="font-medium text-xl">Régimes de Déclaration</h5>
                    <Button onClick={() => setIsNewDialogOpen(true)}>
                        <PlusIcon />
                        Nouveau Régime
                    </Button>
                </div>
                <ScrollArea>
                    <div className="flex items-center gap-x-2 p-1">
                        <div className="relative">
                            <Input
                                placeholder="Rechercher un régime..."
                                className="h-9 bg-white w-[250px] pl-7"
                                value={inputValue}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                            <SearchIcon className="size-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        </div>
                        {search && (
                            <Button onClick={onClearFilters} variant="outline">
                                <XCircleIcon className="text-destructive" />
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