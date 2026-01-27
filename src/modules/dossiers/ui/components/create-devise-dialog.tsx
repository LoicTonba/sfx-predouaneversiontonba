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
import { TDevisesCreateSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import type { TDevisesCreate } from "@/lib/validation";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createDevise } from "@/modules/devises/server/actions";

interface CreateDeviseDialogFormProps {
  initialCode?: string;
  onSuccess?: (id?: string) => void;
  onCancel?: () => void;
}

export const CreateDeviseDialogForm = ({
  initialCode = "",
  onSuccess,
  onCancel,
}: CreateDeviseDialogFormProps) => {
  const form = useForm<TDevisesCreate>({
    resolver: zodResolver(TDevisesCreateSchema),
    defaultValues: {
      code: initialCode,
      libelle: "",
      decimal: 2,
    },
  });

  const isPending = form.formState.isSubmitting;

  const onSubmit = async (data: TDevisesCreate) => {
    try {
      const devise = await createDevise(data);
      if (devise.success) {
        onSuccess?.(devise.data?.ID_Devise?.toString());
        toast.success("Devise créée avec succès");
      } else {
        toast.error("Erreur lors de la création de la devise");
      }
    } catch (error) {
      toast.error("Erreur lors de la création de la devise");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code*</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. USD" />
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
                <Input {...field} type="text" placeholder="e.g. Dollar américain" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="decimal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Décimales*</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number"
                  placeholder="e.g. 2"
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
            Créer la Devise
          </Button>
        </div>
      </form>
    </Form>
  );
};