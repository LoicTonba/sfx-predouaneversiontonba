"use client";

import { Button } from "../../../../components/ui/button";
import { ScrollArea, ScrollBar } from "../../../../components/ui/scroll-area";
import { PlusIcon, XCircleIcon, SearchIcon } from "lucide-react";
import { useState } from "react";
import { Input } from "../../../../components/ui/input";
import { useColisageSearch } from "../../hooks/use-colisage-search";
// import { NewColisageDialog } from "./new-colisage-dialog";

type ColisageHeaderProps = {
    dosierId: string;
};

export const ColisageHeaderForDossier = ({ dosierId }: ColisageHeaderProps) => {
    const { search, setSearch } = useColisageSearch();
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
            {/* <NewColisageDialog
                open={isNewDialogOpen}
                onOpenChange={setIsNewDialogOpen}
                dosierId={dosierId}
            /> */}
            <div className="py-4 px-4 md:px-8 flex flex-col gap-y-4">
                <div className="flex items-center justify-between">
                    <h5 className="font-medium text-xl">Les Colisages de ce dossier</h5>
                    {/* <Button onClick={() => setIsNewDialogOpen(true)}>
                        <PlusIcon />
                        Nouveau Colisage
                    </Button> */}
                </div>
                <ScrollArea>
                    <div className="flex items-center gap-x-2 p-1">
                        <div className="relative">
                            <Input
                                placeholder="Rechercher un dossier..."
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