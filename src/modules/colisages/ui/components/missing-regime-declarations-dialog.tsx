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
import { RegimeDeclarationForm } from "@/modules/regime-declaration/ui/components/regime-declaration-form";
import { ResponsiveDialog } from "@/components/responsive-dialog";

interface MissingRegimeDeclarationsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    missingRegimes: Array<{ code: string; ratio: number; libelle: string }>;
    onContinue: () => void;
    onCancel: () => void;
    onRegimeCreated?: (regimeCode: string) => void;
}

export const MissingRegimeDeclarationsDialog = ({
    open,
    onOpenChange,
    missingRegimes: initialMissingRegimes,
    onContinue,
    onCancel,
    onRegimeCreated,
}: MissingRegimeDeclarationsDialogProps) => {
    const [missingRegimes, setMissingRegimes] = useState<Array<{ code: string; ratio: number; libelle: string }>>(initialMissingRegimes);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [currentRegime, setCurrentRegime] = useState<{ code: string; ratio: number; libelle: string } | null>(null);

    // Synchroniser le state local avec les props
    useEffect(() => {
        setMissingRegimes(initialMissingRegimes);
    }, [initialMissingRegimes]);

    const handleCreateRegime = (regime: { code: string; ratio: number; libelle: string }) => {
        setCurrentRegime(regime);
        setShowCreateDialog(true);
    };

    const handleRegimeCreated = (regimeCode: string) => {
        // Retirer le régime créé de la liste
        const newMissingRegimes = missingRegimes.filter(regime => regime.code !== regimeCode);
        setMissingRegimes(newMissingRegimes);
        setShowCreateDialog(false);
        setCurrentRegime(null);
        toast.success(`Régime ${regimeCode} créé avec succès`);

        // Notifier le parent qu'un régime a été créé
        if (onRegimeCreated) {
            onRegimeCreated(regimeCode);
        }

        // Si tous les régimes ont été créés, passer automatiquement à l'étape suivante
        if (newMissingRegimes.length === 0) {
            setTimeout(() => {
                onContinue();
            }, 500);
        }
    };

    const handleContinue = () => {
        if (missingRegimes.length === 0) {
            onContinue();
        } else {
            // Il reste des régimes non créés, demander confirmation
            const confirmed = confirm(
                `Il reste ${missingRegimes.length} régime(s) non créé(s). Voulez-vous continuer sans les créer ?`
            );
            if (confirmed) {
                onContinue();
            }
        }
    };

    const handleCancel = () => {
        onCancel();
        onOpenChange(false);
    };

    if (initialMissingRegimes.length === 0) {
        return null;
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                            Régimes déclarations manquants ({missingRegimes.length})
                        </DialogTitle>
                        <DialogDescription>
                            Les régimes suivants n'existent pas dans le système. Vous pouvez les créer individuellement ou continuer sans les créer.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <div className="space-y-3">
                                    <p className="font-medium">
                                        Régimes à créer ({missingRegimes.length}) :
                                    </p>
                                    <div className="space-y-2">
                                        {missingRegimes.map((regime, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                                                <Badge variant="outline" className="text-sm">
                                                    {regime.libelle} ({regime.ratio}% DC)
                                                </Badge>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleCreateRegime(regime)}
                                                    className="gap-2"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Créer cette valeur
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </AlertDescription>
                        </Alert>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                        <p className="text-sm">
                            <strong>Étapes suivantes :</strong>
                        </p>
                        <ul className="text-sm mt-2 space-y-1 list-disc list-inside text-muted-foreground">
                            <li>Créer les régimes déclarations manquants</li>
                            <li>Associer les régimes aux clients</li>
                            <li>Vérifier les devises, pays et HS codes</li>
                            <li>Procéder à l'importation</li>
                        </ul>
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                        >
                            Annuler l'import
                        </Button>
                        {missingRegimes.length === 0 ? (
                            <Button
                                onClick={handleContinue}
                                className="gap-2"
                            >
                                Continuer vers l'association client-régime
                            </Button>
                        ) : (
                            <Button
                                onClick={handleContinue}
                                variant="secondary"
                                className="gap-2"
                            >
                                Continuer sans créer ({missingRegimes.length} restant(s))
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ResponsiveDialog
                title="Créer un régime déclaration"
                description={`Créer le régime: ${currentRegime?.libelle || ''}`}
                open={showCreateDialog}
                onOpenChange={(open) => {
                    // Ne fermer que si explicitement demandé
                    if (!open) {
                        setShowCreateDialog(false);
                        setCurrentRegime(null);
                    }
                }}
            >
                <RegimeDeclarationForm
                    onSuccess={(id) => {
                        if (currentRegime) {
                            handleRegimeCreated(currentRegime.code);
                        }
                    }}
                    onCancel={() => {
                        setShowCreateDialog(false);
                        setCurrentRegime(null);
                    }}
                    initialValues={currentRegime ? {
                        libelle: currentRegime.libelle,
                        tauxDC: currentRegime.ratio,
                        regimeDouanierId: "0"
                    } : undefined}
                />
            </ResponsiveDialog>
        </>
    );
};