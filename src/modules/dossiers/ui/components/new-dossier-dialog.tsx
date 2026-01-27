"use client";

import { useRouter } from "next/navigation";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { DossierForm } from "./dossier-form";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const NewDossierDialog = ({ open, onOpenChange }: Props) => {
    const router = useRouter();

    return (
        <ResponsiveDialog
            title="Nouveau Dossier"
            description="Créer un nouveau dossier de transit"
            open={open}
            onOpenChange={onOpenChange}
        >
            <DossierForm
                onSuccess={(id) => {
                    onOpenChange(false);
                    if (id) {
                        router.push(`/dossiers/${id}`);
                    } else {
                        router.refresh();
                    }
                }}
                onCancel={() => onOpenChange(false)}
            />
        </ResponsiveDialog>
    );
};