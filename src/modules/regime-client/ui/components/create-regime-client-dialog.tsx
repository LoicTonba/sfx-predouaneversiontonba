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
import { GeneratedAvatar } from "@/components/generated-avatar";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getAllClients } from "../../../clients/server/actions";
import { getAllRegimesDeclarationsForSelect, createRegimeClient } from "../../server/regime-client-actions";

const createRegimeClientSchema = z.object({
    clientId: z.string().min(1, "Veuillez sélectionner un client"),
    regimeId: z.string().min(1, "Veuillez sélectionner un régime"),
});

interface CreateRegimeClientDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export const CreateRegimeClientDialog = ({
    open,
    onOpenChange,
    onSuccess,
}: CreateRegimeClientDialogProps) => {
    const [clients, setClients] = useState<any[]>([]);
    const [regimes, setRegimes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof createRegimeClientSchema>>({
        resolver: zodResolver(createRegimeClientSchema),
        defaultValues: {
            clientId: "",
            regimeId: "",
        },
    });

    useEffect(() => {
        if (open) {
            loadData();
            form.reset();
        }
    }, [open, form]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [clientsResult, regimesResult] = await Promise.all([
                getAllClients(1, 10000),
                getAllRegimesDeclarationsForSelect()
            ]);
            
            if (clientsResult.success && clientsResult.data) {
                setClients(clientsResult.data.map(c => ({
                    id: c.ID_Client.toString(),
                    value: c.ID_Client.toString(),
                    children: (
                        <div className="flex items-center gap-x-2">
                            <GeneratedAvatar
                                seed={c.Nom_Client}
                                variant="initials"
                                className="border size-6"
                            />
                            <span>{c.Nom_Client}</span>
                        </div>
                    ),
                })));
            }
            
            if (regimesResult.success && regimesResult.data) {
                setRegimes(regimesResult.data.map(r => ({
                    id: r.value,
                    value: r.value,
                    children: <span>{r.label}</span>
                })));
            }
        } catch (error) {
            console.error("Error loading data:", error);
            toast.error("Erreur lors du chargement des données");
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (data: z.infer<typeof createRegimeClientSchema>) => {
        try {
            // Protection : ne pas créer si les valeurs sont vides ou invalides
            if (!data.clientId || !data.regimeId || data.clientId === "" || data.regimeId === "") {
                toast.error("Veuillez sélectionner un client et un régime valides");
                return;
            }
            
            const result = await createRegimeClient({
                clientId: parseInt(data.clientId),
                regimeId: parseInt(data.regimeId)
            });
            if (result.success) {
                onSuccess();
                toast.success("Association créée avec succès");
            } else {
                toast.error(result.error || "Erreur lors de la création");
            }
        } catch (error) {
            toast.error("Erreur lors de la création");
        }
    };

    const isPending = form.formState.isSubmitting;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Nouvelle association régime-client</DialogTitle>
                    <DialogDescription>
                        Créer une nouvelle association entre un client et un régime de déclaration
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="clientId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Client*</FormLabel>
                                    <FormControl>
                                        <CommandSelect
                                            options={clients}
                                            value={field.value}
                                            onSelect={field.onChange}
                                            placeholder="Sélectionner un client..."
                                            className={isLoading || isPending ? "opacity-50 pointer-events-none" : ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="regimeId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Régime de déclaration*</FormLabel>
                                    <FormControl>
                                        <CommandSelect
                                            options={regimes}
                                            value={field.value}
                                            onSelect={field.onChange}
                                            placeholder="Sélectionner un régime..."
                                            className={isLoading || isPending ? "opacity-50 pointer-events-none" : ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                        type="button"
                    >
                        Fermer
                    </Button>
                    <Button
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={isPending}
                        type="button"
                    >
                        {isPending ? "Création..." : "Créer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};