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
        tauxDC: number;
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
            // Convertir de décimal (0-1) vers pourcentage (0-100) pour l'affichage
            tauxDC: initialValues?.tauxDC ? Number(initialValues.tauxDC) * 100 : 0,
            regimeDouanierId: "0", // Toujours régime 0 par défaut
        },
    });

    // Watch le taux DC pour auto-remplir le libellé
    const tauxDC = form.watch("tauxDC");

    const isPending = form.formState.isSubmitting;
    const isEdit = !!initialValues?.id;

    // Auto-remplir le libellé quand le taux DC change
    useEffect(() => {
        if (tauxDC !== undefined) {
            const tauxTR = 100 - tauxDC;
            let autoLibelle = "";

            if (tauxDC === 0) {
                autoLibelle = "Exonération";
            } else if (tauxTR === 0) {
                autoLibelle = "100% DC";
            } else {
                autoLibelle = `${tauxTR.toFixed(2)}% TR et ${tauxDC.toFixed(2)}% DC`;
            }

            form.setValue("libelle", autoLibelle, { shouldValidate: true });
        }
    }, [tauxDC, form]);

    const onSubmit = async (data: TRegimeDeclarationCreate) => {
        console.log('🚀 [RegimeDeclarationForm] onSubmit - data:', data);
        
        // Préparer les données finales
        const finalData = { ...data };

        // S'assurer que le régime douanier est toujours 0 (régime par défaut)
        finalData.regimeDouanierId = "0";

        // Convertir le taux DC de pourcentage (0-100) en décimal (0-1) pour la base de données
        const tauxDCPourcentage = finalData.tauxDC; // Garder la valeur originale pour l'affichage
        finalData.tauxDC = finalData.tauxDC / 100; // Convertir en décimal pour la BD

        // S'assurer que le libellé est rempli
        if (!finalData.libelle || finalData.libelle.trim() === "") {
            const tauxTR = 100 - tauxDCPourcentage;
            
            if (tauxDCPourcentage === 0) {
                finalData.libelle = "Exonération";
            } else if (tauxTR === 0) {
                finalData.libelle = "100% DC";
            } else {
                finalData.libelle = `${tauxTR.toFixed(2)}% TR et ${tauxDCPourcentage.toFixed(2)}% DC`;
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
                    name="tauxDC"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Taux DC*</FormLabel>
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