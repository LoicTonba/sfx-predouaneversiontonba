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
import { AlertCircle, Link2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RegimeAssociationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    regimes: Array<{ code: string; ratio: number; libelle: string }>;
    clientName: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const RegimeAssociationDialog = ({
    open,
    onOpenChange,
    regimes,
    clientName,
    onConfirm,
    onCancel,
}: RegimeAssociationDialogProps) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleConfirm = async () => {
        setIsProcessing(true);
        try {
            await onConfirm();
            // Ne pas fermer automatiquement - laissé au parent
        } catch (error) {
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancel = () => {
        onCancel();
        onOpenChange(false);
    };

    if (regimes.length === 0) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Link2 className="w-5 h-5 text-blue-500" />
                        Association régime-client requise
                    </DialogTitle>
                    <DialogDescription>
                        Les régimes suivants existent dans le système mais ne sont pas associés au client <strong>{clientName}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        <div className="space-y-3">
                            <p className="font-medium">
                                Régimes à associer ({regimes.length}) :
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {regimes.map((regime, index) => (
                                    <Badge key={index} variant="outline" className="text-sm">
                                        {regime.libelle} ({regime.ratio}% DC)
                                    </Badge>
                                ))}
                            </div>
                            <p className="text-sm text-muted-foreground mt-3">
                                Ces régimes doivent être associés au client pour pouvoir être utilisés lors de l'importation.
                            </p>
                        </div>
                    </AlertDescription>
                </Alert>

                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm">
                        <strong>Que va-t-il se passer ?</strong>
                    </p>
                    <ul className="text-sm mt-2 space-y-1 list-disc list-inside text-muted-foreground">
                        <li>Les régimes existants seront associés au client <strong>{clientName}</strong></li>
                        <li>Aucun nouveau régime ne sera créé</li>
                        <li>L'importation pourra continuer normalement</li>
                    </ul>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isProcessing}
                    >
                        Annuler l'import
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isProcessing}
                        className="gap-2"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Association en cours...
                            </>
                        ) : (
                            <>
                                <Link2 className="w-4 h-4" />
                                Associer et continuer
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};