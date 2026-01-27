"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { CommandSelect } from "@/components/command-select";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const filterStatutSchema = z.object({
    statutId: z.string().optional(),
});

interface FilterStatutDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onFilter: (statutId: number | null) => void;
    selectedStatutId: number | null;
}

export const FilterStatutDialog = ({
    open,
    onOpenChange,
    onFilter,
    selectedStatutId,
}: FilterStatutDialogProps) => {
    const [statuts, setStatuts] = useState<any[]>([]);

    const form = useForm<z.infer<typeof filterStatutSchema>>({
        resolver: zodResolver(filterStatutSchema),
        defaultValues: {
            statutId: selectedStatutId?.toString() || "",
        },
    });

    useEffect(() => {
        if (open) {
            loadStatuts();
            form.setValue("statutId", selectedStatutId?.toString() || "");
        }
    }, [open, selectedStatutId, form]);

    const loadStatuts = async () => {
        try {
            // Récupérer les statuts depuis la base de données
            const { getAllStatutsDossiers } = await import("../../server/actions");
            const result = await getAllStatutsDossiers();
            
            if (result.success && result.data) {
                const statutOptions = result.data.map(s => ({
                    id: s.id.toString(),
                    label: s.libelle,
                    color: s.id === 0 ? "bg-blue-100 text-blue-800 border border-blue-200" :
                           s.id === -1 ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                           s.id === -2 ? "bg-red-100 text-red-800 border border-red-200" :
                           "bg-slate-100 text-slate-800 border border-slate-200"
                }));

                const formattedStatuts = statutOptions.map(s => ({
                    id: s.id,
                    value: s.id,
                    children: (
                        <div className="flex items-center gap-x-2">
                            <div className={`w-3 h-3 rounded-full ${s.color}`}></div>
                            <span>{s.label}</span>
                        </div>
                    ),
                }));

                // Ajouter l'option "Tous les statuts"
                setStatuts([
                    {
                        id: "",
                        value: "",
                        children: <span className="font-medium text-muted-foreground">Tous les statuts</span>
                    },
                    ...formattedStatuts
                ]);
            } else {
                // Fallback en cas d'erreur
                setStatuts([{
                    id: "",
                    value: "",
                    children: <span className="font-medium text-muted-foreground">Tous les statuts</span>
                }]);
            }
        } catch (error) {
            console.error("Error loading statuts:", error);
            toast.error("Erreur lors du chargement des statuts");
        }
    };

    const onSubmit = (data: z.infer<typeof filterStatutSchema>) => {
        const statutId = data.statutId && data.statutId !== "" ? parseInt(data.statutId) : null;
        onFilter(statutId);
        onOpenChange(false);
    };

    const handleClearFilter = () => {
        form.setValue("statutId", "");
        onFilter(null);
        onOpenChange(false);
    };

    const isPending = form.formState.isSubmitting;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Filtrer par statut</DialogTitle>
                    <DialogDescription>
                        Sélectionnez un statut pour afficher uniquement les dossiers correspondants
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="statutId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Statut</FormLabel>
                                    <FormControl>
                                        <CommandSelect
                                            options={statuts}
                                            value={field.value || ""}
                                            onSelect={field.onChange}
                                            placeholder="Sélectionner un statut..."
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>

                <DialogFooter className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={handleClearFilter}
                        disabled={isPending}
                        type="button"
                    >
                        Effacer le filtre
                    </Button>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                            type="button"
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={form.handleSubmit(onSubmit)}
                            disabled={isPending}
                            type="button"
                        >
                            {isPending ? "Application..." : "Appliquer"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};