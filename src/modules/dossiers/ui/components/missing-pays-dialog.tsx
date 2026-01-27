"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { CreatePaysDialogForm } from "./create-pays-dialog";

interface MissingPaysDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    missingPays: string[];
    onContinue: () => void;
    onCancel: () => void;
}

export const MissingPaysDialog = ({
    open,
    onOpenChange,
    missingPays: initialMissingPays,
    onContinue,
    onCancel,
}: MissingPaysDialogProps) => {

    const [missingPays, setMissingPays] = useState<string[]>(initialMissingPays);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [selectedPays, setSelectedPays] = useState<string>("");

    // Synchroniser le state local avec les props
    useEffect(() => {

        setMissingPays(initialMissingPays);
    }, [initialMissingPays]);

    const handleCreatePays = (pays: string) => {
        setSelectedPays(pays);
        setShowCreateDialog(true);
    };

    const handlePaysCreated = (createdPays: string) => {
        // Retirer le pays créé de la liste
        const newMissingPays = missingPays.filter(p => p !== createdPays);
        setMissingPays(newMissingPays);
        setShowCreateDialog(false);
        toast.success(`Pays ${createdPays} créé avec succès`);
        
        // Si tous les pays ont été créés selon la liste locale, passer automatiquement à l'étape suivante
        // Le re-parsing dans onContinue vérifiera la réalité de la base de données
        if (newMissingPays.length === 0) {
            setTimeout(() => {
                onContinue();
            }, 1000); // Délai plus long pour s'assurer que les données sont commitées
        }
    };

    const handleContinue = () => {
        if (missingPays.length === 0) {
            onContinue();
        } else {
            // Il reste des pays non créés, demander confirmation
            const confirmed = confirm(
                `Il reste ${missingPays.length} pays non créé(s). Voulez-vous continuer sans les créer ?`
            );
            if (confirmed) {
                onContinue();
            }
        }
    };

    if (initialMissingPays.length === 0) {
        return null;
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-orange-500" />
                            Pays manquants ({missingPays.length})
                        </DialogTitle>
                        <DialogDescription>
                            Les pays suivants n'existent pas dans la base de données. 
                            Vous pouvez les créer individuellement ou continuer sans les créer.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <div className="space-y-3 gap-4">
                                    {missingPays.map((pays, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 border rounded w-[300px]">
                                            <Badge variant="outline">
                                                {pays}
                                            </Badge>
                                            <Button
                                                size="sm"
                                                onClick={() => handleCreatePays(pays)}
                                                className="gap-2"
                                            >
                                                <Plus className="w-4 h-4" />
                                              
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </AlertDescription>
                        </Alert>
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button
                            variant="outline"
                            onClick={onCancel}
                        >
                            Annuler l'import
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog de création Pays */}
            <ResponsiveDialog
                title="Nouveau Pays"
                description={`Créer le pays: ${selectedPays}`}
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
            >
                <CreatePaysDialogForm
                    initialCode={selectedPays}
                    onSuccess={() => {
                        handlePaysCreated(selectedPays);
                    }}
                    onCancel={() => setShowCreateDialog(false)}
                />
            </ResponsiveDialog>
        </>
    );
};