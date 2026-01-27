import { ResponsiveDialog } from "@/components/responsive-dialog";
import { DossierForm } from "./dossier-form";

interface UpdateDossierDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialValues?: any;
}

export const UpdateDossierDialog = ({ open, onOpenChange, initialValues }: UpdateDossierDialogProps) => {
    return (
        <ResponsiveDialog
            title="Modifier le dossier"
            description="Modifiez les informations du dossier ci-dessous."
            open={open}
            onOpenChange={onOpenChange}
        >
            <DossierForm
                onSuccess={() => onOpenChange(false)}
                onCancel={() => onOpenChange(false)}
                initialValues={initialValues}
            />
        </ResponsiveDialog>
    )
}