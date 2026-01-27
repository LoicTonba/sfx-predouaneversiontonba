import { ResponsiveDialog } from "@/components/responsive-dialog";
import { ColisageFormForDossier } from "./colisage-form-for-dossier";
import { useEffect, useState } from "react";
import { getColisageForEdit } from "../../server/colisage-actions";

interface Colisage {
    ID_Colisage_Dossier: number;
    Description_Colis?: string;
    HS_Code?: string; // Code HS sous forme de string dans la vue
    ID_HS_Code?: number; // ID résolu du HS Code
    No_Commande?: string;
    Nom_Fournisseur?: string;
    No_Facture?: string;
    ID_Devise?: number; // ID résolu de la devise
    Code_Devise?: string; // Code devise dans la vue
    Qte_Colis?: number;
    Prix_Unitaire_Colis?: number;
    Poids_Brut?: number;
    Poids_Net?: number;
    Volume?: number;
    ID_Pays_Origine?: number; // ID résolu du pays
    Pays_Origine?: string; // Libellé pays dans la vue
    ID_Regime_Declaration?: number;
    Regroupement_Client?: string;
}

interface EditColisageDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    colisage: Colisage;
    dossierId: number;
    onSuccess?: () => void;
}

export const EditColisageDialog = ({
    open,
    onOpenChange,
    colisage,
    dossierId,
    onSuccess,
}: EditColisageDialogProps) => {
    const [initialValues, setInitialValues] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Charger les données avec IDs résolus quand le dialog s'ouvre
    useEffect(() => {
        if (open && colisage) {
            setIsLoading(true);
            getColisageForEdit(colisage.ID_Colisage_Dossier)
                .then((result) => {
                    if (result.success) {
                        console.log("Données chargées pour édition:", result.data);
                        setInitialValues(result.data);
                    } else {
                        console.error("Erreur chargement colisage:", result.error);
                    }
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [open, colisage]);

    const handleSuccess = () => {
        onOpenChange(false);
        onSuccess?.();
    };

    const handleCancel = () => {
        onOpenChange(false);
    };

    return (
        <ResponsiveDialog
            title="Modifier Colisage"
            description="Modifier les informations du colisage"
            open={open}
            onOpenChange={onOpenChange}
        >
            {isLoading ? (
                <div className="text-center py-4">Chargement des données...</div>
            ) : (
                <ColisageFormForDossier
                    dossierId={dossierId}
                    initialValues={initialValues}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            )}
        </ResponsiveDialog>
    );
};