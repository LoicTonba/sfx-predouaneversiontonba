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
import { Label } from "@/components/ui/label";
import { CommandSelect } from "@/components/command-select";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getAllRegimesDeclarationsForSelect, associateRegimeToClient } from "../../../regime-client/server/regime-client-actions";

const associateRegimeSchema = z.object({
    regimeId: z.string().min(1, "Veuillez sélectionner un régime"),
});

interface Client {
    id: number;
    nomClient: string;
}

interface AssociateRegimeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    client: Client | null;
    onSuccess: () => void;
}

export const AssociateRegimeDialog = ({
    open,
    onOpenChange,
    client,
    onSuccess,
}: AssociateRegimeDialogProps) => {
    const [regimes, setRegimes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof associateRegimeSchema>>({
        resolver: zodResolver(associateRegimeSchema),
        defaultValues: {
            regimeId: "",
        },
    });

    useEffect(() => {
        if (open) {
            loadRegimes();
            form.reset();
        }
    }, [open, form]);

    const loadRegimes = async () => {
        setIsLoading(true);
        try {
            const result = await getAllRegimesDeclarationsForSelect();
            if (result.success && result.data) {
                setRegimes(result.data.map(r => ({
                    id: r.value,
                    value: r.value,
                    children: <span>{r.label}</span>
                })));
            } else {
                toast.error(result.error || "Erreur lors du chargement des régimes");
            }
        } catch (error) {
            console.error("Error loading regimes:", error);
            toast.error("Erreur lors du chargement des régimes");
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (data: z.infer<typeof associateRegimeSchema>) => {
        if (!client) {
            toast.error("Aucun client sélectionné");
            return;
        }

        try {
            const result = await associateRegimeToClient(client.id, parseInt(data.regimeId));
            if (result.success) {
                onSuccess();
                toast.success("Régime associé avec succès");
            } else {
                toast.error(result.error || "Erreur lors de l'association");
            }
        } catch (error) {
            toast.error("Erreur lors de l'association");
        }
    };

    const isPending = form.formState.isSubmitting;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Associer un régime</DialogTitle>
                    <DialogDescription>
                        Associer un régime de déclaration au client{" "}
                        <strong>{client?.nomClient}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Client sélectionné</Label>
                        <div className="p-3 bg-muted rounded-md">
                            <div className="flex items-center gap-x-2">
                                <GeneratedAvatar
                                    seed={client?.nomClient || ""}
                                    variant="initials"
                                    className="border size-6"
                                />
                                <span className="font-medium">{client?.nomClient}</span>
                            </div>
                        </div>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                </div>

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
                        {isPending ? "Association..." : "Associer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};