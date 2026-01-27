"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { NewConversionDialog } from "./new-conversion-dialog";

const ConversionsHeader = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <>
            <NewConversionDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
            <div className="py-4 px-4 md:px-8 flex flex-col gap-y-4">
                <div className="flex items-center justify-between">
                    <h5 className="font-medium text-xl">Conversions</h5>
                    <Button onClick={() => setIsDialogOpen(true)}>
                        <PlusIcon />
                        Nouvelle Conversion
                    </Button>
                </div>
            </div>
        </>
    );
};

export default ConversionsHeader;