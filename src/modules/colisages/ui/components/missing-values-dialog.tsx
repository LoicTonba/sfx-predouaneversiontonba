"use client";

import { useState } from "react";
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
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
    createMissingDevises,
    createMissingHSCodes,
    createMissingPays,
    createMissingRegimes,
} from "../../../dossiers/server/create-missing-values-actions";

interface MissingValuesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    missingValues: {
        devises: string[];
        pays: string[];
        hscodes: string[];
        regimes: Array<{ code: string; ratio: number }>;
        clientId?: number;
    };
    onContinue: () => void;
    onCancel: () => void;
}

export const MissingValuesDialog = ({
    open,
    onOpenChange,
    missingValues,
    onContinue,
    onCancel,
}: MissingValuesDialogProps) => {
    const [isCreating, setIsCreating] = useState(false);

    const hasMissingValues =
        missingValues.devises.length > 0 ||
        missingValues.pays.length > 0 ||
        missingValues.hscodes.length > 0 ||
        missingValues.regimes.length > 0;

    const handleCreateAndContinue = async () => {
        setIsCreating(true);
        try {
            let successCount = 0;
            let errorCount = 0;
            let skippedCount = 0;

            // Créer les devises manquantes
            if (missingValues.devises.length > 0) {
                const result = await createMissingDevises(missingValues.devises);
                if (result.success) {
                    successCount += result.data?.length || 0;
                    skippedCount += result.skipped?.length || 0;
                } else {
                    errorCount += missingValues.devises.length;
                }
            }

            // Créer les pays manquants
            if (missingValues.pays.length > 0) {
                const result = await createMissingPays(missingValues.pays);
                if (result.success) {
                    successCount += result.data?.length || 0;
                    skippedCount += result.skipped?.length || 0;
                } else {
                    errorCount += missingValues.pays.length;
                }
            }

            // Créer les HS Codes manquants
            if (missingValues.hscodes.length > 0) {
                const result = await createMissingHSCodes(missingValues.hscodes);
                if (result.success) {
                    successCount += result.data?.length || 0;
                    skippedCount += result.skipped?.length || 0;
                } else {
                    errorCount += missingValues.hscodes.length;
                }
            }

            // Créer les régimes manquants avec le clientId du dossier
            if (missingValues.regimes.length > 0) {
                const result = await createMissingRegimes(missingValues.regimes, missingValues.clientId);
                if (result.success) {
                    successCount += result.data?.length || 0;
                    skippedCount += result.skipped?.length || 0;
                } else {
                    errorCount += missingValues.regimes.length;
                }
            }

            if (successCount > 0) {
                toast.success(`${successCount} valeur(s) créée(s) avec succès`);
            }

            if (skippedCount > 0) {
                toast.info(`${skippedCount} valeur(s) déjà existante(s)`);
            }

            if (errorCount > 0) {
                toast.error(`${errorCount} valeur(s) n'ont pas pu être créées`);
            }

            // Continuer l'import
            onContinue();
            onOpenChange(false);
        } catch (error) {
            toast.error("Erreur lors de la création des valeurs");
            console.error(error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleSkipAndContinue = () => {
        onCancel();
        onOpenChange(false);
    };

    if (!hasMissingValues) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                        Valeurs manquantes détectées
                    </DialogTitle>
                    <DialogDescription>
                        Certaines valeurs du fichier Excel n'existent pas dans la base de données.
                        Voulez-vous les créer automatiquement ?
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {missingValues.devises.length > 0 && (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <div className="font-medium mb-2">
                                    Devises manquantes ({missingValues.devises.length})
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {missingValues.devises.map((devise, index) => (
                                        <Badge key={index} variant="outline">
                                            {devise}
                                        </Badge>
                                    ))}
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}

                    {missingValues.pays.length > 0 && (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <div className="font-medium mb-2">
                                    Pays manquants ({missingValues.pays.length})
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {missingValues.pays.map((pays, index) => (
                                        <Badge key={index} variant="outline">
                                            {pays}
                                        </Badge>
                                    ))}
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}

                    {missingValues.hscodes.length > 0 && (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <div className="font-medium mb-2">
                                    HS Codes manquants ({missingValues.hscodes.length})
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {missingValues.hscodes.map((hscode, index) => (
                                        <Badge key={index} variant="outline" className="font-mono">
                                            {hscode}
                                        </Badge>
                                    ))}
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}

                    {missingValues.regimes.length > 0 && (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <div className="font-medium mb-2">
                                    Régimes déclarations manquants ({missingValues.regimes.length})
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {missingValues.regimes.map((regime, index) => (
                                        <Badge key={index} variant="outline">
                                            {regime.code} - {regime.ratio}% DC
                                        </Badge>
                                    ))}
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                        variant="outline"
                        onClick={handleSkipAndContinue}
                        disabled={isCreating}
                    >
                        Annuler l'import
                    </Button>
                    <Button
                        onClick={handleCreateAndContinue}
                        disabled={isCreating}
                        className="gap-2"
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Création en cours...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                Créer et continuer l'import
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};