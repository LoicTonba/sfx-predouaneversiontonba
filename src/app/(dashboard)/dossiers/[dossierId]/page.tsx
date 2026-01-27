import { headers } from "next/headers";
import { redirect } from "next/navigation";

import auth from "@/lib/auth";
import { Suspense } from "react";
import { getDossierById } from "@/modules/dossiers/server/actions";
import {
    DossierIdErrorView,
    DossierIdLoadingView,
    DossierIdView,
} from "@/modules/dossiers/ui/views/dossier-id-view";

interface Props {
    params: Promise<{
        dossierId: string;
    }>;
}

const Page = async ({ params }: Props) => {
    const { dossierId } = await params;
    console.log("dossierId", dossierId);
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

    const res = await getDossierById(dossierId);

    if (!res.success) {
        return <DossierIdErrorView />;
    }
    const { data } = res;

    if (!data) {
        return <DossierIdErrorView />;
    }

    // Les données Prisma arrivent déjà avec les bons noms de champs
    return (
        <>
            <Suspense fallback={<DossierIdLoadingView />}>
                <DossierIdView dossier={data} dossierId={dossierId} />
            </Suspense>
        </>
    );
};

export default Page;