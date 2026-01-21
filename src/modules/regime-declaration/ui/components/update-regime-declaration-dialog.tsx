import { ResponsiveDialog } from "@/components/responsive-dialog";
import { RegimeDeclarationForm } from "./regime-declaration-form";

interface UpdateRegimeDeclarationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialValues: {
        id: string;
        libelle: string;
        tauxDC: number;
        regimeDouanierId: string;
    };
}

export const UpdateRegimeDeclarationDialog = ({
    open,
    onOpenChange,
    initialValues,
}: UpdateRegimeDeclarationDialogProps) => {
    return (
        <ResponsiveDialog
            title="Modifier Régime de Déclaration"
            description="Modifier les informations du régime de déclaration"
            open={open}
            onOpenChange={onOpenChange}
        >
            <RegimeDeclarationForm
                initialValues={initialValues}
                onSuccess={() => onOpenChange(false)}
                onCancel={() => onOpenChange(false)}
            />
        </ResponsiveDialog>
    );
};