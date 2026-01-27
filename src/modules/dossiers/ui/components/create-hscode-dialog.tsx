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
import { HscodeCreateSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import type { HscodeCreate } from "@/lib/validation";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createHSCode } from "@/modules/hscode/server/actions";

interface CreateHSCodeDialogFormProps {
  initialCode?: string;
  onSuccess?: (id?: string) => void;
  onCancel?: () => void;
}

export const CreateHSCodeDialogForm = ({
  initialCode = "",
  onSuccess,
  onCancel,
}: CreateHSCodeDialogFormProps) => {
  const form = useForm<HscodeCreate>({
    resolver: zodResolver(HscodeCreateSchema),
    defaultValues: {
      code: initialCode,
      libelle: "",
    },
  });

  const isPending = form.formState.isSubmitting;

  const onSubmit = async (data: HscodeCreate) => {
    try {
      const hscode = await createHSCode(data);
      if (hscode.success) {
        onSuccess?.(hscode.data?.ID_HS_Code?.toString());
        toast.success("HS Code créé avec succès");
      } else {
        toast.error("Erreur lors de la création du HS Code");
      }
    } catch (error) {
      toast.error("Erreur lors de la création du HS Code");
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
                <Input {...field} placeholder="e.g. 123456" />
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
                <Input {...field} type="text" placeholder="Description du produit" />
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
            Créer le HS Code
          </Button>
        </div>
      </form>
    </Form>
  );
};