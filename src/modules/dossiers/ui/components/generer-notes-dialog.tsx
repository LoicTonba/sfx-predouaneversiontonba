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
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { checkConversionExists, genererNotesDetail, createMissingExchangeRates } from "../../server/note-detail-actions";
import { MissingExchangeRatesDialog } from "./missing-exchange-rates-dialog";

interface GenererNotesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    dossierId: number;
    entiteId: number;
}

export const GenererNotesDialog = ({
    open,
    onOpenChange,
    dossierId,
    entiteId,
}: GenererNotesDialogProps) => {
    const [dateDeclaration, setDateDeclaration] = useState<Date>();
    const [isChecking, setIsChecking] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [conversionExists, setConversionExists] = useState<boolean | null>(null);
    const [showMissingRatesDialog, setShowMissingRatesDialog] = useState(false);
    const [missingRatesData, setMissingRatesData] = useState<any>(null);
    const router = useRouter();

    const handleDateSelect = async (date: Date | undefined) => {
        setDateDeclaration(date);
        setConversionExists(null);

        if (!date) return;

        setIsChecking(true);
        try {
            const result = await checkConversionExists(date, entiteId);
            if (result.success) {
                setConversionExists(result.exists);
                if (!result.exists) {
                    toast.error("Aucune conversion trouvée pour cette date");
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsChecking(false);
        }
    };

    const handleGenerer = async () => {
        if (!dateDeclaration) {
            toast.error("Veuillez sélectionner une date de déclaration");
            return;
        }

        if (conversionExists === false) {
            toast.error("Aucune conversion disponible pour cette date");
            return;
        }

        setIsGenerating(true);

        try {
            const result = await genererNotesDetail(dossierId, dateDeclaration);

            if (!result.success) {
                // Vérifier si c'est une erreur de taux manquants
                if (result.error === "MISSING_EXCHANGE_RATES" && result.missingRates) {
                    setMissingRatesData(result);
                    setShowMissingRatesDialog(true);
                    setIsGenerating(false);
                    return;
                }

                toast.error(result.error || "Erreur lors de la génération");
                return;
            }

            toast.success("Notes de détail générées avec succès");
            router.refresh();
            onOpenChange(false);
        } catch (error) {
            toast.error("Erreur lors de la génération");
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCreateMissingRates = async (rates: Array<{ deviseId: number; tauxChange: number }>) => {
        try {
            const result = await createMissingExchangeRates(missingRatesData.conversionId, rates);

            if (!result.success) {
                toast.error("Erreur lors de la création des taux");
                return;
            }

            toast.success("Taux de change créés avec succès");
            setShowMissingRatesDialog(false);

            // Réessayer la génération
            handleGenerer();
        } catch (error) {
            toast.error("Erreur lors de la création des taux");
            console.error(error);
        }
    };

    return (
        <>
            <MissingExchangeRatesDialog
                open={showMissingRatesDialog}
                onOpenChange={setShowMissingRatesDialog}
                missingRates={missingRatesData?.missingRates || []}
                dateConvertion={missingRatesData?.dateConvertion || new Date()}
                onConfirm={handleCreateMissingRates}
            />
            <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Générer les notes de détail</DialogTitle>
                    <DialogDescription>
                        Sélectionnez la date de déclaration pour générer les notes de détail du dossier.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="date-declaration">Date de déclaration</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !dateDeclaration && "text-muted-foreground"
                                    )}
                                    disabled={isChecking || isGenerating}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateDeclaration ? (
                                        format(dateDeclaration, "PPP", { locale: fr })
                                    ) : (
                                        <span>Sélectionner une date</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={dateDeclaration}
                                    onSelect={handleDateSelect}
                                    disabled={(date) => date > new Date()}
                                    initialFocus
                                    locale={fr}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {isChecking && (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Vérification de la conversion pour cette date...
                            </AlertDescription>
                        </Alert>
                    )}

                    {conversionExists === false && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Aucune conversion trouvée pour cette date. Veuillez créer une conversion avant de générer les notes de détail.
                            </AlertDescription>
                        </Alert>
                    )}

                    {conversionExists === true && (
                        <Alert className="border-green-500 bg-green-50">
                            <AlertCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-600">
                                Conversion disponible pour cette date. Vous pouvez générer les notes de détail.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isGenerating}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleGenerer}
                        disabled={!dateDeclaration || conversionExists !== true || isGenerating}
                    >
                        {isGenerating ? "Génération..." : "Générer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    );
};