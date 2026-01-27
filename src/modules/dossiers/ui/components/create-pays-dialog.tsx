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
import { TPaysCreateSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import type { TPaysCreate } from "@/lib/validation";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createPays } from "@/modules/pays/server/actions";

interface CreatePaysDialogFormProps {
  initialCode?: string;
  onSuccess?: (id?: string) => void;
  onCancel?: () => void;
}

export const CreatePaysDialogForm = ({
  initialCode = "",
  onSuccess,
  onCancel,
}: CreatePaysDialogFormProps) => {
  const form = useForm<TPaysCreate>({
    resolver: zodResolver(TPaysCreateSchema),
    defaultValues: {
      codePays: initialCode,
      libellePays: "",
    },
  });

  const isPending = form.formState.isSubmitting;

  const onSubmit = async (data: TPaysCreate) => {
    try {
      const pays = await createPays(data);
      if (pays.success) {
        onSuccess?.(pays.data?.ID_Pays?.toString());
        toast.success("Pays créé avec succès");
      } else {
        toast.error("Erreur lors de la création du pays");
      }
    } catch (error) {
      toast.error("Erreur lors de la création du pays");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="codePays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code*</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. CM" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="libellePays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Libellé*</FormLabel>
              <FormControl>
                <Input {...field} type="text" placeholder="e.g. Cameroun" />
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
            Créer le Pays
          </Button>
        </div>
      </form>
    </Form>
  );
};