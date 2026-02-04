"use client";

import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Calendar } from "lucide-react";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { ClientIdViewHeader } from "../components/client-id-view-header";
import { useConfirm } from "@/hooks/use-confirm";
import { deleteClient } from "../../server/actions";
import { UpdateClientDialog } from "../components/update-client-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ClientDossiers } from "../components/client-dossiers";

// Type pour VClients (vue SQL Server)
type VClient = {
  ID_Client: number;
  Nom_Client: string;
  ID_Entite: number;
  Date_Creation: Date | string;
  Nom_Creation: string | null;
};

interface Props {
  clientId: string;
  client: VClient;
  dossiers?: any[];
}

export const ClientIdView = ({ clientId, client, dossiers = [] }: Props) => {
  const router = useRouter();

  const [updateclientDialogOpen, setUpdateclientDialogOpen] = useState(false);

  const [RemoveConfirmation, confirmRemove] = useConfirm(
    "Êtes-vous sûr?",
    `Voulez-vous vraiment supprimer le client "${client.Nom_Client}" ? Cette action est irréversible.`
  );

  const handleRemoveClient = async () => {
    const ok = await confirmRemove();

    if (!ok) return;

    try {
      const res = await deleteClient(clientId);

      if (!res.success) {
        toast.error("Erreur lors de la suppression du client.");
        return;
      }
      toast.success("Client supprimé avec succès.");
      router.push("/client");
    } catch (error) {
      toast.error("Erreur lors de la suppression du client.");
    }
  };

  return (
    <>
      <RemoveConfirmation />
      <UpdateClientDialog
        open={updateclientDialogOpen}
        onOpenChange={setUpdateclientDialogOpen}
        initialValues={{
          id: client.ID_Client.toString(),
          nomClient: client.Nom_Client
        }}
      />
      <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-6">
        <ClientIdViewHeader
          clientId={clientId}
          clientName={client.Nom_Client}
          onEdit={() => setUpdateclientDialogOpen(true)}
          onRemove={handleRemoveClient}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations principales */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-2xl">{client.Nom_Client}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Informations */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Informations du client</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date de création</p>
                      <p className="font-medium">
                        {format(new Date(client.Date_Creation), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
                      </p>
                    </div>
                  </div>
                  {client.Nom_Creation && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Créé par</p>
                        <p className="font-medium">{client.Nom_Creation}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations secondaires */}
          <Card>
            <CardHeader>
              <CardTitle>Détails</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date de création
                </p>
                <p className="text-sm mt-1">
                  {format(new Date(client.Date_Creation), "d MMMM yyyy à HH:mm", { locale: fr })}
                </p>
              </div>

              {client.Nom_Creation && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Créé par</p>
                    <p className="text-sm mt-1 font-medium">{client.Nom_Creation}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dossiers associés */}
        <ClientDossiers dossiers={dossiers} />
      </div>
    </>
  );
};

export const ClientIdLoadingView = () => {
  return (
    <LoadingState
      title="Chargement du client"
      description="Ceci peut prendre quelques secondes."
    />
  );
};

export const ClientIdErrorView = () => {
  return (
    <ErrorState
      title="Erreur lors du chargement du client"
      description="Une erreur est survenue."
    />
  );
};
