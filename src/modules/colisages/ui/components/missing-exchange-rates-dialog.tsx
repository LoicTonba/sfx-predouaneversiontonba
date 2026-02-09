"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@radix-ui/react-scroll-area";

interface MissingRate {
    deviseId: number;
    Code_Devise: string;
    Libelle_Devise: string;
}

interface MissingExchangeRatesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    missingRates: MissingRate[];
    dateConvertion: Date | string;
    onConfirm: (rates: Array<{ deviseId: number; tauxChange: number }>) => void;
}

export const MissingExchangeRatesDialog = ({
    open,
    onOpenChange,
    missingRates,
    dateConvertion,
    onConfirm,
}: MissingExchangeRatesDialogProps) => {
    const [rates, setRates] = useState<Record<number, string>>({});
    


    const handleRateChange = (deviseId: number, value: string) => {
        setRates((prev) => ({ ...prev, [deviseId]: value }));
    };

    const handleConfirm = () => {
        const ratesArray = missingRates.map((rate) => ({
            deviseId: rate.deviseId,
            tauxChange: parseFloat(rates[rate.deviseId] || "0"),
        }));

        // Vérifier que tous les taux sont valides
        const allValid = ratesArray.every((r) => r.tauxChange > 0);
        if (!allValid) {
            alert("Veuillez saisir des taux valides pour toutes les devises");
            return;
        }

        onConfirm(ratesArray);
    };

    const formatDate = (date: Date | string) => {
        try {
            const d = typeof date === "string" ? new Date(date) : date;
            return d.toLocaleDateString("fr-FR");
        } catch {
            return date.toString();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Taux de change manquants</DialogTitle>
                    <DialogDescription>
                        Les taux de change suivants sont manquants pour la date de conversion{" "}
                        <strong>{formatDate(dateConvertion)}</strong>. Veuillez les saisir pour
                        continuer.
                    </DialogDescription>
                </DialogHeader>

                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Les taux doivent être exprimés en devise locale (XAF). Par exemple, si 1 EUR
                        = 655.96 XAF, saisissez 655.96.
                    </AlertDescription>
                </Alert>

                <div className="space-y-4 py-4">
                    {missingRates.map((rate, index) => (
                        <div key={rate.deviseId} className="space-y-2 p-3 border rounded-lg">
                           <ScrollArea>
                             <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground min-w-[80px]">
                                    1 {rate.Code_Devise || `ID-${rate.deviseId}`} =
                                </span>
                                <Input
                                    id={`rate-${rate.deviseId}`}
                                    type="number"
                                    step="0.000001"
                                    min="0"
                                    placeholder="0.000000"
                                    value={rates[rate.deviseId] || ""}
                                    onChange={(e) => handleRateChange(rate.deviseId, e.target.value)}
                                    className="flex-1"
                                />
                                <span className="text-sm text-muted-foreground min-w-[40px]">XAF</span>
                            </div>
                           </ScrollArea>
                        </div>
                    ))}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Annuler
                    </Button>
                    <Button onClick={handleConfirm}>Créer les taux et continuer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};