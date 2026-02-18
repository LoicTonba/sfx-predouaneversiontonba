"use client";

import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Percent } from "lucide-react";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useConfirm } from "@/hooks/use-confirm";
import { deleteRegimeDeclaration } from "../../server/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { UpdateRegimeDeclarationDialog } from "../components/update-regime-declaration-dialog";
import { RegimeDeclarationIdHeader } from "../components/regime-declaration-id-header";

interface RegimeDeclarationData {
    id: number;
    libelleRegimeDeclaration: string;
    tauxRegime: number;
    regimeDouanier: number;
    session: number;
    dateCreation: string | null;
    rowVer: any;
    tRegimesDouaniers?: {
        id: number;
        codeRegimeDouanier: string;
        libelleRegimeDouanier: string;
    } | null;
    tUtilisateurs?: {
        id: number;
        nomUtilisateur: string;
    } | null;
}

interface Props {
    regimeDeclarationId: string;
    regimeDeclaration: RegimeDeclarationData;
}

export const RegimeDeclarationIdView = ({
    regimeDeclarationId,
    regimeDeclaration,
}: Props) => {
    const router = useRouter();
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

    const [RemoveConfirmation, confirmRemove] = useConfirm(
        "Êtes-vous sûr?",
        `Voulez-vous vraiment supprimer le régime "${regimeDeclaration.libelleRegimeDeclaration}" ? Cette action est irréversible.`
    );

    const handleRemove = async () => {
        const ok = await confirmRemove();

        if (!ok) return;

        try {
            const res = await deleteRegimeDeclaration(regimeDeclarationId);

            if (!res.success) {
                toast.error("Erreur lors de la suppression du régime de déclaration.");
                return;
            }
            toast.success("Régime de déclaration supprimé avec succès.");
            router.push("/regime-declaration");
        } catch (error) {
            toast.error("Erreur lors de la suppression du régime de déclaration.");
        }
    };

// Calcul des pourcentages TR et DC (convertir de décimal en pourcentage si nécessaire)
    const tauxRegimeValue = Number(regimeDeclaration.tauxRegime);
    const tauxRegimePourcentage = tauxRegimeValue >= -2 && tauxRegimeValue <= 1 
        ? (tauxRegimeValue > 0 && tauxRegimeValue < 1 ? tauxRegimeValue * 100 : tauxRegimeValue)
        : tauxRegimeValue;
    const tauxTRPourcentage = tauxRegimePourcentage > 0 && tauxRegimePourcentage < 100 
        ? 100 - tauxRegimePourcentage 
        : 0;
    const isExoneration = tauxRegimePourcentage === 0;

    return (
        <>
            <RemoveConfirmation />
            <UpdateRegimeDeclarationDialog
    open={updateDialogOpen}
    onOpenChange={setUpdateDialogOpen}
    initialValues={{
        id: regimeDeclaration.id.toString(),
        libelle: regimeDeclaration.libelleRegimeDeclaration,
        tauxRegime: regimeDeclaration.tauxRegime,
        regimeDouanierId: regimeDeclaration.regimeDouanier.toString(),
    }}
/>

            <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-6">
                <RegimeDeclarationIdHeader
                    regimeDeclarationId={regimeDeclarationId}
                    libelle={regimeDeclaration.libelleRegimeDeclaration}
                    onEdit={() => setUpdateDialogOpen(true)}
                    onRemove={handleRemove}
                />

                {/* Carte principale avec informations */}
                <Card className="border-2">
                    <CardHeader className="pb-3">
                        <CardTitle>Informations</CardTitle>
                    </CardHeader>
                    <Separator />
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Colonne gauche */}
                            <div className="space-y-6">
                                {/* Régime Douanier */}
                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground">RÉGIME DOUANIER</p>
                                    <p className="text-base font-medium mt-1">
                                        {regimeDeclaration.tRegimesDouaniers?.libelleRegimeDouanier || "N/A"}
                                    </p>
                                </div>

                                {/* Taux Régime */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Percent className="w-4 h-4 text-muted-foreground" />
                                        <p className="text-sm font-semibold text-muted-foreground">TAUX RÉGIME</p>
                                    </div>
                                      <p className="text-base font-medium">
                                        {tauxRegimePourcentage === -2 ? "TTC" :
                                         tauxRegimePourcentage === -1 ? "100% TR" :
                                         tauxRegimePourcentage === 0 ? "EXO" :
                                         tauxRegimePourcentage === 1 ? "100% DC" :
                                         `${tauxRegimePourcentage.toFixed(2)}%`}
                                    </p>
                                </div>
                            </div>

                            {/* Colonne droite */}
                            <div className="space-y-6">
                                {/* Taux TR */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Percent className="w-4 h-4 text-muted-foreground" />
                                        <p className="text-sm font-semibold text-muted-foreground">TAUX TR</p>
                                    </div>
                                    <p className="text-base font-medium">{tauxTRPourcentage.toFixed(2)}%</p>
                                </div>

                                {/* Date de création */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                        <p className="text-sm font-semibold text-muted-foreground">CRÉÉ LE</p>
                                    </div>
                                    <p className="text-base font-medium">
                                        {regimeDeclaration.dateCreation 
                                            ? format(new Date(regimeDeclaration.dateCreation), "d MMMM yyyy", { locale: fr })
                                            : "N/A"
                                        }
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {regimeDeclaration.dateCreation 
                                            ? format(new Date(regimeDeclaration.dateCreation), "HH:mm", { locale: fr })
                                            : "N/A"
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Deux cartes sur la même ligne */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Statut du régime */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Statut</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">
                                  {isExoneration ? (
                                    <span className="text-amber-600 font-semibold">Exonération (DC = 0%)</span>
                                ) : tauxTRPourcentage === 0 ? (
                                    <span className="text-blue-600 font-semibold">100% Déclaration</span>
                                ) : tauxRegimePourcentage === -2 ? (
                                    <span className="text-purple-600 font-semibold">TTC</span>
                                ) : tauxRegimePourcentage === -1 ? (
                                    <span className="text-blue-600 font-semibold">100% TR</span>
                                ) : tauxRegimePourcentage === 100 ? (
                                    <span className="text-orange-600 font-semibold">100% DC</span>
                                ) : (
                                    <span className="text-green-600 font-semibold">
                                        {tauxTRPourcentage.toFixed(1)}% TR + {tauxRegimePourcentage.toFixed(1)}% DC
                                    </span>
                                )}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Date de modification */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Dernière modification</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-base font-medium">
                                {regimeDeclaration.dateCreation 
                                    ? format(new Date(regimeDeclaration.dateCreation), "d MMMM yyyy", { locale: fr })
                                    : "N/A"
                                }
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {regimeDeclaration.dateCreation 
                                    ? format(new Date(regimeDeclaration.dateCreation), "HH:mm", { locale: fr })
                                    : "N/A"
                                }
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
};

export const RegimeDeclarationIdLoadingView = () => {
    return (
        <LoadingState
            title="Chargement du régime de déclaration"
            description="Ceci peut prendre quelques secondes."
        />
    );
};

export const RegimeDeclarationIdErrorView = () => {
    return (
        <ErrorState
            title="Erreur lors du chargement du régime de déclaration"
            description="Une erreur est survenue."
        />
    );
};