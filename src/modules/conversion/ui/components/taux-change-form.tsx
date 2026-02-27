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
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createTauxChange, getAllDevisesForSelect } from "../../server/taux-change-actions";
import { toast } from "sonner";
import { CommandSelect } from "@/components/command-select";

interface DeviseSelectOption {
    ID_Devise: number;
    Code_Devise: string;
    Libelle_Devise: string;
}


interface TauxChangeFormProps {
    conversionId: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export const TauxChangeForm = ({
    conversionId,
    onSuccess,
    onCancel,
}: TauxChangeFormProps) => {
    const [devises, setDevises] = useState<DeviseSelectOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const devisesRes = await getAllDevisesForSelect();
                if (devisesRes.success) {
                    {
                        setDevises(devisesRes.data || []);
                    }
                }
            } catch (error) {
                toast.error("Erreur lors du chargement des données");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    const form = useForm({
        mode: "onChange",
        defaultValues: {
            deviseId: "",
            tauxChange: "",
        },
    });

    const isPending = form.formState.isSubmitting;

    const onSubmit = async (data: { deviseId: string; tauxChange: string }) => {
        try {
            const result = await createTauxChange({
                ID_Convertion: conversionId,
                ID_Devise: data.deviseId,
                Taux_Change: data.tauxChange,
            });
            if (result.success) {
                onSuccess?.();
                toast.success("Taux de change ajouté avec succès");
            } else {
                toast.error(result.error || "Erreur lors de l'ajout");
            }
        } catch (error) {
            toast.error("Erreur lors de l'ajout");
        }
    };

    if (isLoading) {
        return <div className="p-4 text-center">Chargement...</div>;
    }

    return (
        <Form {...form}>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700">
                    <strong>Note :</strong> La devise locale a automatiquement un taux de 1.0 et n'apparaît pas dans cette liste.
                </p>
            </div>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="deviseId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Devise*</FormLabel>
                            <FormControl>
                                <CommandSelect
                                    options={devises.map((devise) => ({
                                        id: devise.ID_Devise.toString(),
                                        value: devise.ID_Devise.toString(),
                                        children: <span>{devise.Code_Devise} - {devise.Libelle_Devise}</span>,
                                    }))}
                                    onSelect={(value) => field.onChange(value)}
                                    value={field.value}
                                    placeholder="Sélectionner une devise"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="tauxChange"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Taux de change*</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    type="number"
                                    step="0.000001"
                                    placeholder="1.234567"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-between gap-x-2">
                    {onCancel && (
                        <Button
                            variant="secondary"
                            disabled={isPending}
                            type="button"
                            onClick={onCancel}
                        >
                            Annuler
                        </Button>
                    )}
                    <Button type="submit" disabled={isPending}>
                        Ajouter le taux
                    </Button>
                </div>
            </form>
        </Form>
    );
};