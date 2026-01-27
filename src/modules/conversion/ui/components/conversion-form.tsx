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
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import React from "react";
import { useForm } from "react-hook-form";
import { createConversion } from "../../server/actions";
import { toast } from "sonner";

interface ConversionFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

export const ConversionForm = ({
    onSuccess,
    onCancel,
}: ConversionFormProps) => {
    const form = useForm({
        mode: "onChange",
        defaultValues: {
            Date_Convertion: undefined as Date | undefined,
        },
    });

    const isPending = form.formState.isSubmitting;

    const onSubmit = async (data: any) => {
        try {
            const result = await createConversion(data);
            if (result.success) {
                onSuccess?.();
                toast.success("Conversion créée avec succès");
            } else {
                toast.error(result.error || "Erreur lors de la création");
            }
        } catch (error) {
            toast.error("Erreur lors de la création");
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="Date_Convertion"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Date de conversion*</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value ? (
                                                format(field.value, "dd MMMM yyyy", { locale: fr })
                                            ) : (
                                                <span>Sélectionner une date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        locale={fr}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
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
                        Créer la conversion
                    </Button>
                </div>
            </form>
        </Form>
    );
};