"use client";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TRegimeDeclarationCreateSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import type { TRegimeDeclarationCreate } from "@/lib/validation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createRegimeDeclaration, updateRegimeDeclaration } from "../../server/actions";

interface RegimeDeclarationFormProps {
    onSuccess?: (id?: string) => void;
    onCancel?: () => void;
    initialValues?: {
        id?: string;
        libelle: string;
        tauxRegime: number;
        regimeDouanierId: string;
    };
}

export const RegimeDeclarationForm = ({
    onSuccess,
    onCancel,
    initialValues,
}: RegimeDeclarationFormProps) => {
    const form = useForm<TRegimeDeclarationCreate>({
        resolver: zodResolver(TRegimeDeclarationCreateSchema),
        defaultValues: {
            libelle: initialValues?.libelle ?? "",
            // Convertir de décimal vers pourcentage pour l'affichage si c'est un ratio DC
            tauxRegime: initialValues?.tauxRegime ?? 0,
            regimeDouanierId: "0", // Toujours régime 0 par défaut
        },
    });

    // Watch le taux Regime pour auto-remplir le libellé
    const tauxRegime = form.watch("tauxRegime");

    const isPending = form.formState.isSubmitting;
    const isEdit = !!initialValues?.id;

      // Auto-remplir le libellé quand le taux Regime change
    useEffect(() => {
        if (tauxRegime !== undefined && tauxRegime !== null) {
            let autoLibelle = "";
            const numValue = Number(tauxRegime);
            if (numValue === -2) {
                autoLibelle = "TTC";
            } else if (numValue === -1) {
                autoLibelle = "100% TR";
            } else if (numValue === 0) {
                autoLibelle = "Exonération";
            } else if (numValue === 1) {
                autoLibelle = "100% DC";
            } else if (numValue > 0 && numValue < 1) {
                // C'est un ratio décimal (ex: 0.5149 = 51.49% DC)
                const tauxDC = numValue * 100;
                const tauxTR = 100 - tauxDC;
                autoLibelle = `${tauxTR.toFixed(2)}% TR et ${tauxDC.toFixed(2)}% DC`;
            }

            if (autoLibelle) {
                form.setValue("libelle", autoLibelle, { shouldValidate: true });
            }
        }
    }, [tauxRegime, form]);

    const onSubmit = async (data: TRegimeDeclarationCreate) => {
        console.log('[RegimeDeclarationForm] onSubmit - data:', data);
        
        // Préparer les données finales
        const finalData = { ...data };

        // S'assurer que le régime douanier est toujours 0 (régime par défaut)
        finalData.regimeDouanierId = "0";

        // Le taux Regime est déjà au bon format (décimal)
        // Pas de conversion nécessaire

        // S'assurer que le libellé est rempli
        if (!finalData.libelle || finalData.libelle.trim() === "") {
            if (finalData.tauxRegime === -2) {
                finalData.libelle = "TTC";
            } else if (finalData.tauxRegime === -1) {
                finalData.libelle = "100% TR";
            } else if (finalData.tauxRegime === 0) {
                finalData.libelle = "Exonération";
            } else if (finalData.tauxRegime === 1) {
                finalData.libelle = "100% DC";
            } else if (finalData.tauxRegime > 0 && finalData.tauxRegime < 1) {
                const tauxDCPct = finalData.tauxRegime * 100;
                const tauxTRPct = 100 - tauxDCPct;
                finalData.libelle = `${tauxTRPct.toFixed(2)}% TR et ${tauxDCPct.toFixed(2)}% DC`;
            }
        }

        console.log('[RegimeDeclarationForm] finalData:', finalData);
        console.log('[RegimeDeclarationForm] isEdit:', isEdit);

        if (isEdit && initialValues?.id) {
            try {
                console.log('[RegimeDeclarationForm] Updating regime...');
                const updatedRegime = await updateRegimeDeclaration(initialValues.id, finalData);
                console.log('✅ [RegimeDeclarationForm] Update result:', updatedRegime);
                if (updatedRegime.success) {
                    toast.success("Régime de déclaration mis à jour avec succès");
                    onSuccess?.(initialValues.id);
                } else {
                    console.error('❌ [RegimeDeclarationForm] Update failed:', updatedRegime.error);
                    toast.error(String(updatedRegime.error) || "Erreur lors de la mise à jour");
                }
            } catch (error) {
                console.error('❌ [RegimeDeclarationForm] Update error:', error);
                toast.error("Erreur lors de la mise à jour du régime de déclaration");
            }
        } else {
            try {
                console.log('[RegimeDeclarationForm] Creating regime...');
                const regime = await createRegimeDeclaration(finalData);
                console.log('✅ [RegimeDeclarationForm] Create result:', regime);
                if (regime.success && regime.data?.id) {
                    onSuccess?.(regime.data.id.toString());
                    toast.success("Régime de déclaration créé avec succès");
                } else {
                    console.error('❌ [RegimeDeclarationForm] Create failed:', regime.error);
                    toast.error(String(regime.error) || "Erreur lors de la création");
                }
            } catch (error) {
                console.error('❌ [RegimeDeclarationForm] Create error:', error);
                toast.error("Erreur lors de la création du régime de déclaration");
            }
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="tauxRegime"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Taux Régime*</FormLabel>
                            <FormControl>
                                <Input
                                    value={field.value}
                                    type="number"
                                    step="0.0001"
                                    placeholder="Ex: -2, -1, 0, 0.5149, 1"
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === '' || value === '-') {
                                            field.onChange(0);
                                            return;
                                        }
                                        const numValue = parseFloat(value);
                                        if (!isNaN(numValue)) {
                                            field.onChange(numValue);
                                        }
                                    }}
                                    onBlur={field.onBlur}
                                    name={field.name}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="libelle"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Libellé*</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    type="text"
                                    placeholder="Libellé du régime"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-between gap-x-2">
                    {onCancel && (
                        <Button
                            variant="ghost"
                            disabled={isPending}
                            type="button"
                            onClick={onCancel}
                        >
                            Fermer
                        </Button>
                    )}
                    <Button type="submit" disabled={isPending}>
                        {isEdit ? "Mettre à jour" : "Créer"}
                    </Button>
                </div>
            </form>
        </Form>
    );
};