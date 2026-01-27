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
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";

// Schema pour l'édition lors de l'import - seulement les champs modifiables
const EditableColisageSchema = z.object({
  description: z.string().min(1, "Description requise"),
  numeroCommande: z.string().optional(),
  nomFournisseur: z.string().optional(),
  numeroFacture: z.string().optional(),
  itemNo: z.string().optional(),
  quantite: z.number().min(0, "Quantité doit être positive"),
  prixUnitaireColis: z.number().min(0, "Prix doit être positif"),
  poidsBrut: z.number().min(0, "Poids brut doit être positif"),
  poidsNet: z.number().min(0, "Poids net doit être positif"),
  volume: z.number().min(0, "Volume doit être positif"),
  regroupementClient: z.string().optional(),
});

type EditableColisage = z.infer<typeof EditableColisageSchema>;

interface EditableColisageFormProps {
  initialValues: {
    rowKey: string;
    hscode?: string;
    description: string;
    numeroCommande?: string;
    nomFournisseur?: string;
    numeroFacture?: string;
    itemNo?: string;
    devise: string;
    quantite: number;
    prixUnitaireColis: number;
    poidsBrut: number;
    poidsNet: number;
    volume: number;
    paysOrigine: string;
    regimeCode?: string;
    regroupementClient?: string;
  };
  onSave: (data: EditableColisage) => void;
  onCancel: () => void;
}

export const EditableColisageForm = ({
  initialValues,
  onSave,
  onCancel,
}: EditableColisageFormProps) => {
  const form = useForm<EditableColisage>({
    resolver: zodResolver(EditableColisageSchema),
    mode: "onChange",
    defaultValues: {
      description: initialValues.description || "",
      numeroCommande: initialValues.numeroCommande || "",
      nomFournisseur: initialValues.nomFournisseur || "",
      numeroFacture: initialValues.numeroFacture || "",
      itemNo: initialValues.itemNo || "",
      quantite: initialValues.quantite || 1,
      prixUnitaireColis: initialValues.prixUnitaireColis || 0,
      poidsBrut: initialValues.poidsBrut || 0,
      poidsNet: initialValues.poidsNet || 0,
      volume: initialValues.volume || 0,
      regroupementClient: initialValues.regroupementClient || "",
    },
  });

  const isPending = form.formState.isSubmitting;

  const onSubmit = (data: EditableColisage) => {
    onSave(data);
  };

  return (
    <div className="space-y-4">
      {/* Informations non modifiables */}
      <div className="bg-muted/50 p-4 rounded-lg space-y-3">
        <h4 className="font-medium text-sm text-muted-foreground">Informations de référence (non modifiables)</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <span className="text-xs text-muted-foreground">Row Key</span>
            <Badge variant="outline" className="block w-fit font-mono text-xs mt-1">
              {initialValues.rowKey}
            </Badge>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">HS Code</span>
            <Badge variant="secondary" className="block w-fit font-mono text-xs mt-1">
              {initialValues.hscode || "-"}
            </Badge>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Devise</span>
            <Badge variant="outline" className="block w-fit font-mono text-xs mt-1">
              {initialValues.devise}
            </Badge>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Pays d'origine</span>
            <Badge variant="outline" className="block w-fit text-xs mt-1">
              {initialValues.paysOrigine}
            </Badge>
          </div>
        </div>
        {initialValues.regimeCode && (
          <div>
            <span className="text-xs text-muted-foreground">Régime</span>
            <Badge variant="secondary" className="block w-fit text-xs mt-1">
              {initialValues.regimeCode}
            </Badge>
          </div>
        )}
      </div>

      {/* Formulaire pour les champs modifiables */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description*</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Description du colisage" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="numeroCommande"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>N° Commande</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      placeholder="Numéro de commande"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nomFournisseur"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fournisseur</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      placeholder="Nom du fournisseur"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="numeroFacture"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>N° Facture</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      placeholder="Numéro de facture"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="itemNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>N° Item</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ""}
                      placeholder="Numéro d'item"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="regroupementClient"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Regroupement Client</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ""}
                    placeholder="Regroupement client"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="quantite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantité</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      placeholder="0"
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prixUnitaireColis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prix Unitaire</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      placeholder="0"
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="poidsBrut"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poids Brut (kg)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      placeholder="0"
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="poidsNet"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poids Net (kg)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      placeholder="0"
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="volume"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Volume (m³)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      placeholder="0"
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-between gap-x-2 pt-4">
            <Button
              variant="ghost"
              disabled={isPending}
              type="button"
              onClick={onCancel}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "En cours..." : "Sauvegarder"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};