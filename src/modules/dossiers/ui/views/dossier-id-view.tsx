"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Calendar, Package, Truck, User, Building2, MapPin, FileText } from "lucide-react";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useConfirm } from "@/hooks/use-confirm";
import { deleteDossier } from "../../server/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { DossierIdHeader } from "../components/dossier-id-header";
import { UpdateDossierDialog } from "../components/update-dossier-dialog";
import { ColisageImportForDossier } from "../components/colisage-import-for-dossier";
import { ColisageListForDossier } from "../components/colisage-list-for-dossier";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NoteDetailView } from "./note-detail-view";

interface Props {
    dossierId: string;
    dossier: any;
}

export const DossierIdView = ({ dossierId, dossier }: Props) => {
    const router = useRouter();
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

    const [RemoveConfirmation, confirmRemove] = useConfirm(
        "Êtes-vous sûr?",
        `Voulez-vous vraiment supprimer le dossier "${dossier.No_Dossier || dossier.No_OT}" ? Cette action est irréversible.`
    );

    const handleRemoveDossier = async () => {
        const ok = await confirmRemove();

        if (!ok) return;

        try {
            const res = await deleteDossier(dossierId);

        
            if (!res.success) {
                toast.error("Ce dossier ne peut pas être supprimé car il est lié à d'autres enregistrements.");
                return;
            }
            toast.success("Dossier supprimé avec succès.");
            router.push("/dossiers");
        } catch (error) {
            toast.error("Erreur lors de la suppression du dossier.");
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            "Ouvert": "bg-blue-100 text-blue-800",
            "En cours": "bg-yellow-100 text-yellow-800",
            "Clôturé": "bg-green-100 text-green-800",
            "Annulé": "bg-red-100 text-red-800",
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    return (
        <>
            <RemoveConfirmation />
            <UpdateDossierDialog
                open={updateDialogOpen}
                onOpenChange={setUpdateDialogOpen}
                initialValues={dossier}
            />
            <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-6">
                <DossierIdHeader
                    dossierId={dossierId}
                    dossierReference={dossier.No_Dossier || dossier.No_OT || `Dossier #${dossierId}`}
                    onEdit={() => setUpdateDialogOpen(true)}
                    onRemove={handleRemoveDossier}
                />

                {/* Carte principale avec statut */}
                <Card className="border-2">
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-3xl font-bold">
                                    {dossier.No_Dossier || "N/A"}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    N° OT: {dossier.No_OT || "N/A"}
                                </p>
                            </div>
                            <Badge className={`${getStatusColor(dossier.Libelle_Statut_Dossier)} text-sm px-3 py-1`}>
                                {dossier.Libelle_Statut_Dossier}
                            </Badge>
                        </div>
                    </CardHeader>
                    <Separator />
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Colonne gauche - Informations principales */}
                            <div className="space-y-6">
                                {/* Client */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                        <p className="text-sm font-semibold text-muted-foreground">CLIENT</p>
                                    </div>
                                    <p className="text-lg font-semibold">{dossier.Nom_Client || "N/A"}</p>
                                </div>

                                {/* Type et Sens */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Truck className="w-4 h-4 text-muted-foreground" />
                                        <p className="text-sm font-semibold text-muted-foreground">TYPE / SENS</p>
                                    </div>
                                    <p className="text-base font-medium">{dossier.Libelle_Type_Dossier}</p>
                                    <p className="text-sm text-muted-foreground">{dossier.Libelle_Sens_Trafic}</p>
                                </div>

                                {/* Mode de transport */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <MapPin className="w-4 h-4 text-muted-foreground" />
                                        <p className="text-sm font-semibold text-muted-foreground">MODE DE TRANSPORT</p>
                                    </div>
                                    <Badge variant="outline" className="text-base">
                                        {dossier.Libelle_Mode_Transport}
                                    </Badge>
                                </div>
                            </div>

                            {/* Colonne droite - Dates et infos */}
                            <div className="space-y-6">
                                {/* Responsable */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                        <p className="text-sm font-semibold text-muted-foreground">RESPONSABLE</p>
                                    </div>
                                    <Badge variant="outline" className="text-base">
                                        {dossier.Nom_Responsable}
                                    </Badge>
                                </div>

                                {/* Étape actuelle */}
                                {dossier.Libelle_Etape_Actuelle && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <FileText className="w-4 h-4 text-muted-foreground" />
                                            <p className="text-sm font-semibold text-muted-foreground">ÉTAPE ACTUELLE</p>
                                        </div>
                                        <Badge variant="secondary" className="text-base">
                                            {dossier.Libelle_Etape_Actuelle}
                                        </Badge>
                                    </div>
                                )}

                                {/* Date de création */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                        <p className="text-sm font-semibold text-muted-foreground">CRÉÉ LE</p>
                                    </div>
                                    <p className="text-base font-medium">
                                        {dossier.Date_Creation ? format(new Date(dossier.Date_Creation), "d MMMM yyyy", { locale: fr }) : "Date non disponible"}
                                    </p>
                                </div>

                                {/* Date d'ouverture */}
                                {dossier.Date_Ouverture_Dossier && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            <p className="text-sm font-semibold text-muted-foreground">OUVERT LE</p>
                                        </div>
                                        <p className="text-base font-medium">
                                            {format(new Date(dossier.Date_Ouverture_Dossier!), "d MMMM yyyy", { locale: fr })}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Poids et Volume */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Poids et Volume</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Nombre Paquetage Pesee</p>
                                <p className="text-base font-medium">{Number(dossier.Nbre_Paquetage_Pesee)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Poids Brut Pesee</p>
                                <p className="text-base font-medium">{Number(dossier.Poids_Brut_Pesee)} kg</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Poids Net Pesee</p>
                                <p className="text-base font-medium">{Number(dossier.Poids_Net_Pesee)} kg</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Volume Pesee</p>
                                <p className="text-base font-medium">{Number(dossier.Volume_Pesee)} m³</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Description */}
                {dossier.Description_Dossier && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-base text-muted-foreground leading-relaxed">
                                {dossier.Description_Dossier}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Onglets Colisages et Note de Détails */}
                <Card>
                    <Tabs defaultValue="colisages" className="w-full">
                        <CardHeader className="pb-3">
                            <TabsList className="grid w-full max-w-md grid-cols-2">
                                <TabsTrigger value="colisages" className="flex items-center gap-2">
                                    <Package className="w-4 h-4" />
                                    Colisages
                                </TabsTrigger>
                                <TabsTrigger value="note-details" className="flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Note de Détails
                                </TabsTrigger>
                            </TabsList>
                        </CardHeader>

                        <CardContent>
                            <TabsContent value="colisages" className="mt-0">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground">
                                            Gérez les colisages de ce dossier
                                        </p>
                                        <ColisageImportForDossier dossierId={dossier.ID_Dossier} />
                                    </div>
                                    <ColisageListForDossier dossierId={dossier.ID_Dossier} />
                                </div>
                            </TabsContent>

                            <TabsContent value="note-details" className="mt-0">
                                <NoteDetailView 
                                    dossierId={dossier.ID_Dossier} 
                                    entiteId={dossier.ID_Entite}
                                />
                            </TabsContent>
                        </CardContent>
                    </Tabs>
                </Card>
            </div>
        </>
    );
};

export const DossierIdLoadingView = () => {
    return (
        <LoadingState
            title="Chargement du dossier"
            description="Ceci peut prendre quelques secondes."
        />
    );
};

export const DossierIdErrorView = () => {
    return (
        <ErrorState
            title="Erreur lors du chargement du dossier"
            description="Une erreur est survenue."
        />
    );
};