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
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { CommandSelect } from "@/components/command-select";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  getAllHscodesForSelect,
  getAllDevisesForSelect,
  getAllPaysForSelect,
  getAllRegimeDeclarationsForSelect
} from "../../server/colisage-actions";
import { 
  createColisage as createColisageOriginal,
  updateColisage as updateColisageOriginal
} from "../../server/colisage-actions";

// Schema de validation identique au module colisage
const ColisageCreateSchema = z.object({
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
  hscodeId: z.string().optional(),
  deviseId: z.string().min(1, "Devise requise"),
  paysOrigineId: z.string().min(1, "Pays d'origine requis"),
  regimeDeclarationId: z.string().optional(),
});

type ColisageCreate = z.infer<typeof ColisageCreateSchema>;

interface ColisageFormForDossierProps {
  dossierId: number;
  onSuccess?: (id?: string) => void;
  onCancel?: () => void;
  initialValues?: {
    id: string;
    description: string;
    numeroCommande?: string | null;
    nomFournisseur?: string | null;
    numeroFacture?: string | null;
    itemNo?: string | null;
    quantite: number;
    prixUnitaireColis: number;
    poidsBrut: number;
    poidsNet: number;
    volume: number;
    regroupementClient?: string | null;
    hscodeId?: string | null;
    deviseId?: string;
    paysOrigineId?: string;
    regimeDeclarationId?: string | null;
  };
}

export const ColisageFormForDossier = ({
  dossierId,
  onSuccess,
  onCancel,
  initialValues,
}: ColisageFormForDossierProps) => {
  console.log("🔧 ColisageFormForDossier - initialValues:", initialValues);
  const [hscodes, setHscodes] = useState<any[]>([]);
  const [devises, setDevises] = useState<any[]>([]);
  const [pays, setPays] = useState<any[]>([]);
  const [regimes, setRegimes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<ColisageCreate>({
    resolver: zodResolver(ColisageCreateSchema),
    mode: "onChange",
    defaultValues: {
      description: initialValues?.description || "",
      numeroCommande: initialValues?.numeroCommande || "",
      nomFournisseur: initialValues?.nomFournisseur || "",
      numeroFacture: initialValues?.numeroFacture || "",
      itemNo: initialValues?.itemNo || "",
      quantite: initialValues?.quantite || 1,
      prixUnitaireColis: initialValues?.prixUnitaireColis || 0,
      poidsBrut: initialValues?.poidsBrut || 0,
      poidsNet: initialValues?.poidsNet || 0,
      volume: initialValues?.volume || 0,
      regroupementClient: initialValues?.regroupementClient || "",
      hscodeId: initialValues?.hscodeId || "",
      deviseId: initialValues?.deviseId || "",
      paysOrigineId: initialValues?.paysOrigineId || "",
      regimeDeclarationId: initialValues?.regimeDeclarationId || "",
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("🔄 Chargement des données de référence...");
        
        const [hscodesRes, devisesRes, paysRes, regimesRes] = await Promise.all([
          getAllHscodesForSelect(),
          getAllDevisesForSelect(),
          getAllPaysForSelect(),
          getAllRegimeDeclarationsForSelect(),
        ]);

        console.log("📊 Résultats chargement:", {
          hscodes: hscodesRes.success ? `${hscodesRes.data?.length} items` : hscodesRes.error,
          devises: devisesRes.success ? `${devisesRes.data?.length} items` : devisesRes.error,
          pays: paysRes.success ? `${paysRes.data?.length} items` : paysRes.error,
          regimes: regimesRes.success ? `${regimesRes.data?.length} items` : regimesRes.error,
        });

        if (hscodesRes.success) {
          console.log("✅ HS Codes:", hscodesRes.data?.slice(0, 2));
          setHscodes(hscodesRes.data || []);
        }
        if (devisesRes.success) {
          console.log("✅ Devises:", devisesRes.data?.slice(0, 2));
          console.log("🔍 Devise 153 trouvée?", devisesRes.data?.find(d => d.id.toString() === "153"));
          setDevises(devisesRes.data || []);
        }
        if (paysRes.success) {
          console.log("✅ Pays:", paysRes.data?.slice(0, 2));
          console.log("🔍 Pays 4 trouvé?", paysRes.data?.find(p => p.id.toString() === "4"));
          setPays(paysRes.data || []);
        }
        if (regimesRes.success) {
          console.log("✅ Régimes:", regimesRes.data);
          setRegimes(regimesRes.data || []);
        }
      } catch (error) {
        console.error("❌ Erreur chargement:", error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);



  const isPending = form.formState.isSubmitting;
  const isEdit = !!initialValues?.id;

  const onSubmit = async (data: ColisageCreate) => {
    try {
      console.log("Données soumises:", data);

      if (isEdit) {
        const updated = await updateColisageOriginal({
          id: parseInt(initialValues.id),
          ...data
        });
        console.log("Résultat update:", updated);

        if (updated.success) {
          toast.success("Colisage mis à jour avec succès");
          onSuccess?.(initialValues.id);
        } else {
          console.error("Erreur update:", updated.error);
          toast.error("Erreur lors de la mise à jour");
        }
      } else {
        // Ajouter le dossierId pour la création
        const createData = { ...data, dossierId };
        const created = await createColisageOriginal(createData);
        console.log("Résultat création:", created);

        if (created.success) {
          toast.success("Colisage créé avec succès");
          onSuccess?.(created.data?.id?.toString());
        } else {
          console.error("Erreur création:", created.error);
          toast.error("Erreur lors de la création");
        }
      }
    } catch (error) {
      console.error("Erreur dans onSubmit:", error);
      toast.error("Une erreur est survenue");
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Chargement...</div>;
  }

  return (
    <Form {...form} key={initialValues?.id || 'new'}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 h-[600px] overflow-y-scroll scrollbar-hide"
      >
        <FormField
          control={form.control}
          name="deviseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Devise*</FormLabel>
              <FormControl>
                <CommandSelect
                  options={devises.map((devise) => ({
                    id: devise.id.toString(),
                    value: devise.id.toString(),
                    children: <span>{devise.code} - {devise.libelle}</span>,
                  }))}
                  onSelect={field.onChange}
                  value={field.value || ""}
                  placeholder="Sélectionner une devise"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paysOrigineId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pays d'Origine*</FormLabel>
              <FormControl>
                <CommandSelect
                  options={pays.map((country) => ({
                    id: country.id.toString(),
                    value: country.id.toString(),
                    children: <span>{country.code} - {country.libelle}</span>,
                  }))}
                  onSelect={field.onChange}
                  value={field.value || ""}
                  placeholder="Sélectionner un pays"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hscodeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>HS Code</FormLabel>
              <FormControl>
                <CommandSelect
                  options={hscodes.map((hscode) => ({
                    id: hscode.id.toString(),
                    value: hscode.id.toString(),
                    children: <span>{hscode.code} - {hscode.libelle}</span>,
                  }))}
                  onSelect={field.onChange}
                  value={field.value || ""}
                  placeholder="Sélectionner un HS code"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="regimeDeclarationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Régime de Déclaration</FormLabel>
              <FormControl>
                <CommandSelect
                  options={regimes.map((regime) => ({
                    id: regime.id.toString(),
                    value: regime.id.toString(),
                    children: <span>{regime.libelle}</span>,
                  }))}
                  onSelect={field.onChange}
                  value={field.value || ""}
                  placeholder="Sélectionner un régime"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
          {onCancel && (
            <Button
              variant="ghost"
              disabled={isPending}
              type="button"
              onClick={onCancel}
            >
              Annuler
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending ? "En cours..." : isEdit ? "Mettre à jour" : "Créer"}
          </Button>
        </div>
      </form>
    </Form>
  );
};