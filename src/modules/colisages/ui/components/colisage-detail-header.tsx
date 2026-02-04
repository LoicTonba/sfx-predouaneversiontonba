"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRightIcon, TrashIcon, PencilIcon, MoreVerticalIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";
import { deleteColisage } from "../../../colisages/server/colisage-actions";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenuContent
} from "@/components/ui/dropdown-menu";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { EditColisageDialog } from "./edit-colisage-dialog";

interface Dossier {
    idDossier: number;
    noDossier?: string;
    No_Dossier?: string;
}

interface Colisage {
    ID_Colisage_Dossier: number;
    Description_Colis?: string;
}

interface ColisageDetailHeaderProps {
    dossier: Dossier;
    colisage: Colisage;
}

export const ColisageDetailHeader = ({ dossier, colisage }: ColisageDetailHeaderProps) => {
    const router = useRouter();
    const [showEditDialog, setShowEditDialog] = useState(false);

    const [DeleteConfirmation, confirmDelete] = useConfirm(
        "Supprimer le colisage?",
        "Voulez-vous vraiment supprimer ce colisage ? Cette action est irréversible."
    );

    const handleDelete = async () => {
        const ok = await confirmDelete();
        if (!ok) return;

        try {
            const result = await deleteColisage(colisage.ID_Colisage_Dossier);

            if (result.success) {
                toast.success("Colisage supprimé avec succès");
                router.push(`/dossiers/${dossier.idDossier}`);
            } else {
                toast.error(result.error || "Erreur lors de la suppression");
            }
        } catch (error) {
            toast.error("Erreur lors de la suppression du colisage");
            console.error(error);
        }
    };

    const handleEdit = () => {
        setShowEditDialog(true);
    };

    const handleEditSuccess = () => {
        setShowEditDialog(false);
        toast.success("Colisage modifié avec succès");
        // Attendre que le dialog se ferme avant de rafraîchir
        setTimeout(() => {
            router.refresh();
        }, 100);
    };

    return (
        <>
            <DeleteConfirmation />
            <EditColisageDialog
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                colisage={colisage}
                dossierId={dossier.idDossier}
                onSuccess={handleEditSuccess}
            />
            <div className="flex items-center justify-between px-4 md:px-8 py-4">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild className="font-medium text-xl">
                                <Link href="/dossiers">
                                    Dossiers
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="text-foreground text-xl font-medium [&>svg]:size-4">
                            <ChevronRightIcon />
                        </BreadcrumbSeparator>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild className="font-medium text-xl">
                                <Link href={`/dossiers/${dossier.idDossier}`}>
                                    {dossier.No_Dossier || `Dossier #${dossier.noDossier}`}
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="text-foreground text-xl font-medium [&>svg]:size-4">
                            <ChevronRightIcon />
                        </BreadcrumbSeparator>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild className="font-medium text-xl text-foreground">
                                <Link href={`/dossiers/${dossier.idDossier}/colisages/${colisage.ID_Colisage_Dossier}`}>
                                    {colisage.Description_Colis || `Colisage #${colisage.ID_Colisage_Dossier}`}
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost">
                            <MoreVerticalIcon />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleEdit}>
                            <PencilIcon className="size-4 text-black" />
                            Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete}>
                            <TrashIcon className="size-4 text-black" />
                            Supprimer
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>
    );
};