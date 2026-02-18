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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
            tauxRegime: initialValues?.tauxRegime 
                ? (Number(initialValues.tauxRegime) >= 0 && Number(initialValues.tauxRegime) <= 1 
                    ? Number(initialValues.tauxRegime) * 100 
                    : Number(initialValues.tauxRegime))
                : 0,
            regimeDouanierId: "0", // Toujours régime 0 par défaut
        },
    });

    // Watch le taux Regime pour auto-remplir le libellé
    const tauxRegime = form.watch("tauxRegime");

    const isPending = form.formState.isSubmitting;
    const isEdit = !!initialValues?.id;

      // Auto-remplir le libellé quand le taux Regime change
    useEffect(() => {
        if (tauxRegime !== undefined) {
            let autoLibelle = "";

            if (tauxRegime === -2) {
                autoLibelle = "TTC";
            } else if (tauxRegime === -1) {
                autoLibelle = "100% TR";
            } else if (tauxRegime === 0) {
                autoLibelle = "Exonération";
            } else if (tauxRegime === 100) {
                autoLibelle = "100% DC";
            } else if (tauxRegime > 0 && tauxRegime < 100) {
                const tauxTR = 100 - tauxRegime;
                autoLibelle = `${tauxTR.toFixed(2)}% TR et ${tauxRegime.toFixed(2)}% DC`;
            }

            if (autoLibelle) {
                form.setValue("libelle", autoLibelle, { shouldValidate: true });
            }
        }
    }, [tauxRegime, form]);

    const onSubmit = async (data: TRegimeDeclarationCreate) => {
        console.log('🚀 [RegimeDeclarationForm] onSubmit - data:', data);
        
        // Préparer les données finales
        const finalData = { ...data };

        // S'assurer que le régime douanier est toujours 0 (régime par défaut)
        finalData.regimeDouanierId = "0";

        // Convertir le taux Regime selon le cas
        if (finalData.tauxRegime === -2 || finalData.tauxRegime === -1) {
            // TTC ou 100% TR - garder tel quel
        } else if (finalData.tauxRegime >= 0 && finalData.tauxRegime <= 100) {
            // Convertir de pourcentage (0-100) en décimal (0-1) pour la BD
            finalData.tauxRegime = finalData.tauxRegime / 100;
        }

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

        console.log('📝 [RegimeDeclarationForm] finalData:', finalData);
        console.log('🔄 [RegimeDeclarationForm] isEdit:', isEdit);

        if (isEdit && initialValues?.id) {
            try {
                console.log('📝 [RegimeDeclarationForm] Updating regime...');
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
                console.log('📝 [RegimeDeclarationForm] Creating regime...');
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
                                    {...field}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    placeholder="Taux de déclaration"
                                    onChange={(e) => {
                                        let value = parseFloat(e.target.value) || 0;
                                        // Limiter à 2 décimales
                                        value = Math.round(value * 100) / 100;
                                        // Limiter entre 0 et 100
                                        value = Math.max(0, Math.min(100, value));
                                        field.onChange(value);
                                    }}
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