"use client";

import { useRouter } from "next/navigation";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { ConversionForm } from "./conversion-form";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const NewConversionDialog = ({ open, onOpenChange }: Props) => {
    const router = useRouter();

    return (
        <ResponsiveDialog
            title="Nouvelle Conversion"
            description="Créer une nouvelle date de conversion pour gérer les taux de change"
            open={open}
            onOpenChange={onOpenChange}
        >
            <ConversionForm
                onSuccess={() => {
                    onOpenChange(false);
                    router.refresh();
                }}
                onCancel={() => onOpenChange(false)}
            />
        </ResponsiveDialog>
    );
};