import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ColisageDetailView } from "@/modules/colisages/ui/views/colisage-detail-view";
import { ColisageDetailHeader } from "@/modules/colisages/ui/components/colisage-detail-header";
import { LoadingState } from "@/components/loading-state";
import { getColisageById } from "@/modules/colisages/server/colisage-actions";
import { getDossierById } from "@/modules/dossiers/server/actions";

// Désactiver le cache pour cette page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ColisageDetailPageProps {
    params: Promise<{
        dossierId: string;
        colisageId: string;
    }>;
}

async function ColisageDetailContent({ dossierId, colisageId }: { dossierId: number; colisageId: number }) {
    const [dossierResult, colisageResult] = await Promise.all([
        getDossierById(dossierId.toString()),
        getColisageById(colisageId)
    ]);

    if (!dossierResult.success || !colisageResult.success) {
        notFound();
    }

    return (
        <>
            <ColisageDetailHeader 
                dossier={dossierResult.data} 
                colisage={colisageResult.data}
            />
            <ColisageDetailView 
                dossierId={dossierId}
                colisage={colisageResult.data}
            />
        </>
    );
}

export default async function ColisageDetailPage({ params }: ColisageDetailPageProps) {
    const resolvedParams = await params;
    const dossierId = parseInt(resolvedParams.dossierId);
    const colisageId = parseInt(resolvedParams.colisageId);

    if (isNaN(dossierId) || isNaN(colisageId)) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-y-4">
            <Suspense fallback={
                <LoadingState 
                    title="Chargement du colisage..." 
                    description="Veuillez patienter..." 
                />
            }>
                <ColisageDetailContent 
                    dossierId={dossierId} 
                    colisageId={colisageId} 
                />
            </Suspense>
        </div>
    );
}