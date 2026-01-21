import { useRouter } from "next/navigation";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { RegimeDeclarationForm } from "./regime-declaration-form";

interface NewRegimeDeclarationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const NewRegimeDeclarationDialog = ({
    open,
    onOpenChange,
}: NewRegimeDeclarationDialogProps) => {
    const router = useRouter();

    return (
        <ResponsiveDialog
            title="Nouveau Régime de Déclaration"
            description="Créer un nouveau régime de déclaration"
            open={open}
            onOpenChange={onOpenChange}
        >
            <RegimeDeclarationForm
                onSuccess={(id) => {
                    onOpenChange(false);
                    router.push(`/regime-declaration/${id}`);
                }}
                onCancel={() => onOpenChange(false)}
            />
        </ResponsiveDialog>
    );
};