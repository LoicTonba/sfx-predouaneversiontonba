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
import { CreateHSCodeDialogForm } from "../../../dossiers/ui/components/create-hscode-dialog";

interface MissingHSCodesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    missingHSCodes: string[];
    onContinue: () => void;
    onCancel: () => void;
}

export const MissingHSCodesDialog = ({
    open,
    onOpenChange,
    missingHSCodes: initialMissingHSCodes,
    onContinue,
    onCancel,
}: MissingHSCodesDialogProps) => {
    const [missingHSCodes, setMissingHSCodes] = useState<string[]>(initialMissingHSCodes);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [selectedHSCode, setSelectedHSCode] = useState<string>("");

    // Synchroniser le state local avec les props
    useEffect(() => {
        setMissingHSCodes(initialMissingHSCodes);
    }, [initialMissingHSCodes]);

    const handleCreateHSCode = (hsCode: string) => {
        setSelectedHSCode(hsCode);
        setShowCreateDialog(true);
    };

    const handleHSCodeCreated = (createdHSCode: string) => {
        // Retirer le HS Code créé de la liste locale
        const newMissingHSCodes = missingHSCodes.filter(code => code !== createdHSCode);
        setMissingHSCodes(newMissingHSCodes);
        setShowCreateDialog(false);
        toast.success(`HS Code ${createdHSCode} créé avec succès`);
        
        // Si tous les HS Codes ont été créés selon la liste locale, passer automatiquement à l'étape suivante
        // Le re-parsing dans onContinue vérifiera la réalité de la base de données
        if (newMissingHSCodes.length === 0) {
            setTimeout(() => {
                onContinue();
            }, 1000); // Délai plus long pour s'assurer que les données sont commitées
        }
    };

    const handleContinue = () => {
        if (missingHSCodes.length === 0) {
            onContinue();
        } else {
            // Il reste des HS Codes non créés, demander confirmation
            const confirmed = confirm(
                `Il reste ${missingHSCodes.length} HS Code(s) non créé(s). Voulez-vous continuer sans les créer ?`
            );
            if (confirmed) {
                onContinue();
            }
        }
    };

    if (initialMissingHSCodes.length === 0) {
        return null;
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-orange-500" />
                            HS Codes manquants ({missingHSCodes.length})
                        </DialogTitle>
                        <DialogDescription>
                            Les HS Codes suivants n'existent pas dans la base de données. 
                            Vous pouvez les créer individuellement ou continuer sans les créer.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <div className="space-y-3">
                                    {missingHSCodes.map((hsCode, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 border rounded w-[300px]">
                                            <Badge variant="outline" className="font-mono">
                                                {hsCode}
                                            </Badge>
                                            <Button
                                                size="sm"
                                                onClick={() => handleCreateHSCode(hsCode)}
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

            {/* Dialog de création HS Code */}
            <ResponsiveDialog
                title="Nouveau HS Code"
                description={`Créer le HS Code: ${selectedHSCode}`}
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
            >
                <CreateHSCodeDialogForm
                    initialCode={selectedHSCode}
                    onSuccess={() => {
                        handleHSCodeCreated(selectedHSCode);
                    }}
                    onCancel={() => setShowCreateDialog(false)}
                />
            </ResponsiveDialog>
        </>
    );
};