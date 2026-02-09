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
import { CreateDeviseDialogForm } from "../../../dossiers/ui/components/create-devise-dialog";

interface MissingDevisesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    missingDevises: string[];
    onContinue: () => void;
    onCancel: () => void;
}

export const MissingDevisesDialog = ({
    open,
    onOpenChange,
    missingDevises: initialMissingDevises,
    onContinue,
    onCancel,
}: MissingDevisesDialogProps) => {
    const [missingDevises, setMissingDevises] = useState<string[]>(initialMissingDevises);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [selectedDevise, setSelectedDevise] = useState<string>("");

    // Synchroniser le state local avec les props
    useEffect(() => {
        setMissingDevises(initialMissingDevises);
    }, [initialMissingDevises]);

    const handleCreateDevise = (devise: string) => {
        setSelectedDevise(devise);
        setShowCreateDialog(true);
    };

    const handleDeviseCreated = (createdDevise: string) => {
        // Retirer la devise créée de la liste
        const newMissingDevises = missingDevises.filter(d => d !== createdDevise);
        setMissingDevises(newMissingDevises);
        setShowCreateDialog(false);
        toast.success(`Devise ${createdDevise} créée avec succès`);
        
        // Si toutes les devises ont été créées selon la liste locale, passer automatiquement à l'étape suivante
        // Le re-parsing dans onContinue vérifiera la réalité de la base de données
        if (newMissingDevises.length === 0) {
            setTimeout(() => {
                onContinue();
            }, 1000); // Délai plus long pour s'assurer que les données sont commitées
        }
    };

    const handleContinue = () => {
        if (missingDevises.length === 0) {
            onContinue();
        } else {
            // Il reste des devises non créées, demander confirmation
            const confirmed = confirm(
                `Il reste ${missingDevises.length} devise(s) non créée(s). Voulez-vous continuer sans les créer ?`
            );
            if (confirmed) {
                onContinue();
            }
        }
    };

    if (initialMissingDevises.length === 0) {
        return null;
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-orange-500" />
                            Devises manquantes ({missingDevises.length})
                        </DialogTitle>
                        <DialogDescription>
                            Les devises suivantes n'existent pas dans la base de données. 
                            Vous pouvez les créer individuellement ou continuer sans les créer.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <div className="space-y-3">
                                    {missingDevises.map((devise, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 border rounded w-[300px]">
                                            <Badge variant="outline">
                                                {devise}
                                            </Badge>
                                            <Button
                                                size="sm"
                                                onClick={() => handleCreateDevise(devise)}
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

            {/* Dialog de création Devise */}
            <ResponsiveDialog
                title="Nouvelle Devise"
                description={`Créer la devise: ${selectedDevise}`}
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
            >
                <CreateDeviseDialogForm
                    initialCode={selectedDevise}
                    onSuccess={() => {
                        handleDeviseCreated(selectedDevise);
                    }}
                    onCancel={() => setShowCreateDialog(false)}
                />
            </ResponsiveDialog>
        </>
    );
};