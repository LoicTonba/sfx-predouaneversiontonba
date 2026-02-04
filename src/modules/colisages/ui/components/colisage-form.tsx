"use client";

import { Button } from "../../../../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../../components/ui/form";
import { Input } from "../../../../components/ui/input";
import { TRegimeClientCreateSchema } from "../../../../lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import type { TRegimeClientCreate } from "../../../../lib/validation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  createColisage,
  updateColisage,
  getAllDevisesForSelect,
  getAllHscodesForSelect,
  getAllPaysForSelect,
  getAllRegimeDeclarationsForSelect,
} from "../../../colisages/server/colisage-actions";
import { toast } from "sonner";
import { TColisageDossiers } from "@/generated/prisma/client";
import { CommandSelect } from "../../../../components/command-select";


interface ColisageDossierFormProps {
  onSuccess?: (id?: string) => void;
  onCancel?: () => void;
  dosierId?: string;
  initialValues?: TColisageDossiers;
}

export const ColisageForm = ({
  onSuccess,
  onCancel,
  initialValues,
  dosierId,
}: ColisageDossierFormProps) => {
  const [regimeDeclarations, setRegimeDeclarations] = useState<
    Array<{ id: string; libelle: string }>
  >([]);
  const [devise, setDevise] = useState<Array<{ id: string; libelle: string }>>(
    []
  );
  const [hscodes, setHscodes] = useState<
    Array<{ id: number; libelle: string }>
  >([]);
  const [pays, setPays] = useState<Array<{ id: string; libelle: string }>>([]);
  const [isLoadingRegimeDeclarations, setIsLoadingRegimeDeclarations] =
    useState(true);
  const [isLoadingDevise, setIsLoadingDevise] = useState(true);
  const [isLoadingHscodes, setIsLoadingHscodes] = useState(true);
  const [isLoadingPays, setIsLoadingPays] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [deviseRes, pays, hscodes, regimeDeclarations] =
          await Promise.all([
            getAllDevisesForSelect(),
            getAllPaysForSelect(),
            getAllHscodesForSelect(),
            getAllRegimeDeclarationsForSelect(),
          ]);

        if (deviseRes.success) {
          setDevise(
            (deviseRes.data || []).map((devise) => ({
              id: devise.id.toString(),
              libelle: devise.libelle,
            }))
          );
        }

        if (pays.success) {
          setPays(
            (pays.data || []).map((pays) => ({
              id: pays.id.toString(),
              libelle: pays.libelle,
            }))
          );
        }
        if (hscodes.success) {
          setHscodes(
            (hscodes.data || []).map((hscode) => ({
              id: hscode.id,
              libelle: hscode.libelle,
            }))
          );
        }
        if (regimeDeclarations.success) {
          setRegimeDeclarations(
            (regimeDeclarations.data || []).map((regime) => ({
              id: regime.id.toString(),
              libelle: regime.libelle,
            }))
          );
        }
      } catch (error) {
        toast.error("Erreur lors du chargement des données");
      } finally {
        setIsLoadingHscodes(false);
        setIsLoadingPays(false);
        setIsLoadingDevise(false);
        setIsLoadingRegimeDeclarations(false);
      }
    };

    loadData();
  }, []);

  const form = useForm({
    mode: "onChange",
    defaultValues: {
      deviseId: initialValues?.Devise || "",
      paysOrigineId: initialValues?.Pays_Origine || "",
      hsCodeId: initialValues?.HS_Code || "",
      regimeDeclarationId: initialValues?.Regime_Declaration || "",
      // statutDossierId défini automatiquement à 1 (Ouvert)
      article: initialValues?.Item_No || "",
      description: initialValues?.Description_Colis || "",
      numeroCommande: initialValues?.No_Commande || "",
      nomFournisseur: initialValues?.Nom_Fournisseur || "",
      numeroFacture: initialValues?.No_Facture || "",
      regroupementClient: initialValues?.Regroupement_Client || "",
      prixUnitaireFacture: initialValues?.Prix_Unitaire_Colis || "",
      quantite: initialValues?.Qte_Colis ? Number(initialValues.Qte_Colis) : 0,
      poidsBrut: initialValues?.Poids_Brut
        ? Number(initialValues.Poids_Brut)
        : 0,
      poidsNet: initialValues?.Poids_Net ? Number(initialValues.Poids_Net) : 0,

      volume: initialValues?.Volume ? Number(initialValues.Volume) : 0,
    },
  });

  const isPending = form.formState.isSubmitting;
  const isEdit = !!initialValues?.ID_Colisage_Dossier;

  const onSubmit = async (data: any) => {
    if (isEdit) {
      try {
        const id = String(initialValues!.ID_Colisage_Dossier);
        const updatedColisage = await updateColisage({
          id: parseInt(id),
          ...data
        });
        if (updatedColisage.success) {
          onSuccess?.(
            updatedColisage.data?.Devise
              ? String(updatedColisage.data.Devise)
              : undefined
          );
          toast.success("Colisage mis à jour avec succès");
        } else {
          if (updatedColisage.error === "REFERENCE_EXISTS") {
            toast.error("Cette référence existe déjà pour un autre dossier");
          } else {
            toast.error("Erreur lors de la mise à jour du dossier");
          }
        }
      } catch (error) {
        console.error("Update error:", error);
        toast.error("Erreur lors de la mise à jour du dossier");
      }
    } else {
      try {
        const payload = {
          ...data,
          dossierId: Number(dosierId),
          deviseId: Number(data.deviseId),
          paysOrigineId: Number(data.paysOrigineId),
          hsCodeId: Number(data.hsCodeId),
          regimeDeclarationId: Number(data.regimeDeclarationId),
        };
        
        const Colisage = await createColisage(payload);
        console.log("Create response:", Colisage);
        if (Colisage.success) {
          onSuccess?.(Colisage.data?.ID_Colisage_Dossier?.toString());
          toast.success("Colisage créé avec succès");
        } else {
          console.error("Create error:", Colisage.error);
          if (Colisage.error === "REFERENCE_EXISTS") {
            toast.error("Un colisage avec cette référence existe déjà");
          } else {
            toast.error("Erreur lors de la création du colisage");
          }
        }
      } catch (error) {
        console.error("Create exception:", error);
        toast.error("Erreur lors de la création du colisage");
      }
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="nomFournisseur"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom Fournisseur</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nom du fournisseur" />
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
                  <FormLabel>Description Colis</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Description Colis" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="deviseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Devises</FormLabel>
                  <FormControl>
                    <CommandSelect
                      options={devise.map((devis) => ({
                        id: devis.id,
                        value: devis.id,
                        children: (
                          <div className="flex items-center gap-x-2">
                            <span>{devis.libelle}</span>
                          </div>
                        ),
                      }))}
                      onSelect={field.onChange}
                      value={field.value.toString()}
                      placeholder="Sélectionner le type de Devise"
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
                  <FormLabel>Pays Origine</FormLabel>
                  <FormControl>
                    <CommandSelect
                      options={pays.map((pays) => ({
                        id: pays.id,
                        value: pays.id,
                        children: (
                          <div className="flex items-center gap-x-2">
                            <span>{pays.libelle}</span>
                          </div>
                        ),
                      }))}
                      onSelect={field.onChange}
                      value={field.value.toString()}
                      placeholder="Sélectionner le Pays"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hsCodeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hs Code</FormLabel>
                  <FormControl>
                    <CommandSelect
                      options={hscodes.map((hscode) => ({
                        id: hscode.id.toString(),
                        value: hscode.id.toString(),
                        children: (
                          <div className="flex items-center gap-x-2">
                            <span>{hscode.libelle}</span>
                          </div>
                        ),
                      }))}
                      onSelect={field.onChange}
                      value={field.value.toString()}
                      placeholder="Sélectionner le type de hscode"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="regimeDeclarationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Regime Declaration</FormLabel>
                <FormControl>
                  <CommandSelect
                    options={regimeDeclarations.map((regime) => ({
                      id: regime.id,
                      value: regime.id,
                      children: (
                        <div className="flex items-center gap-x-2">
                          <span>{regime.libelle}</span>
                        </div>
                      ),
                    }))}
                    onSelect={field.onChange}
                    value={field.value.toString()}
                    placeholder="Sélectionner le Regime Declaration"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="numeroFacture"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numero de Facture</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Numero de Facture" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numeroCommande"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numero de la Commande</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Numero de la commande" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantité Colis</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="1"
                      min={"0"}
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
              name="article"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numero d'article</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="1"
                      min={"1"}
                      placeholder="1"
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
              name="prixUnitaireFacture"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prix Unitaire Facture</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="1"
                      min={"1"}
                      placeholder="300"
                      value={field.value?.toString() || ""}
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
              name="regroupementClient"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Regroupe du Client</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Regroupe du Client" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      min={"0"}
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
                      min={"0"}
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

          <div className="flex justify-between gap-x-2">
            {onCancel && (
              <Button
                variant="secondary"
                disabled={isPending}
                type="button"
                onClick={onCancel}
              >
                Fermer
              </Button>
            )}
            <Button type="submit" disabled={isPending}>
              {isEdit ? "Mettre à jour le colisage" : "Créer le colisage"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};