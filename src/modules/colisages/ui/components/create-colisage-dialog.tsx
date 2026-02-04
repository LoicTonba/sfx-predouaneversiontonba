"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ColisageFormForDossier } from "../../../colisages/ui/components/colisage-form-for-dossier";

interface CreateColisageDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    dossierId: number;
    onSuccess?: () => void;
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

export const CreateColisageDialog = ({
    open,
    onOpenChange,
    dossierId,
    onSuccess,
    initialValues,
}: CreateColisageDialogProps) => {
    const handleSuccess = () => {
        onOpenChange(false);
        onSuccess?.();
    };

    const handleCancel = () => {
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {initialValues ? "Modifier le colisage" : "Nouveau colisage"}
                    </DialogTitle>
                </DialogHeader>
                
                <ColisageFormForDossier
                    dossierId={dossierId}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                    initialValues={initialValues}
                />
            </DialogContent>
        </Dialog>
    );
};