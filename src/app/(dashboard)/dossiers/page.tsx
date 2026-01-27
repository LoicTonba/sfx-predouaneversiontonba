import { headers } from "next/headers";
import { redirect } from "next/navigation";

import auth from "@/lib/auth";
import {
    DossiersErrorView,
    DossiersLoadingView,
    DossiersView,
} from "@/modules/dossiers/ui/views/dossiers-view";
import { Suspense } from "react";
import DossiersHeader from "@/modules/dossiers/ui/components/dossiers-header";
import { getAllDossiers } from "@/modules/dossiers/server/actions";
import { DEFAULT_PAGE } from "@/constants";

interface Props {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function DossiersContent({ 
    currentPage, 
    search, 
    statutId, 
    etapeId 
}: { 
    currentPage: number;
    search?: string;
    statutId?: number | null;
    etapeId?: number | null;
}) {
    const res = await getAllDossiers(1, 10000, search || "", statutId, etapeId);

    if (!res.success) {
        return <DossiersErrorView />
    }
    const { data, total } = res;

    if (!data) {
        return <DossiersErrorView />
    }

    // Les données Prisma arrivent déjà avec les bons noms de champs
    return <DossiersView dossiers={data} total={total} currentPage={currentPage} />
}

const Page = async ({ searchParams }: Props) => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

    const params = await searchParams;
    const currentPage = parseInt(params.page as string) || DEFAULT_PAGE;
    const search = params.search as string;
    const statutId = params.statutId ? parseInt(params.statutId as string) : null;
    const etapeId = params.etapeId ? parseInt(params.etapeId as string) : null;

    return (
        <>
            <DossiersHeader />
            <Suspense fallback={<DossiersLoadingView />}>
                <DossiersContent 
                    currentPage={currentPage}
                    search={search}
                    statutId={statutId}
                    etapeId={etapeId}
                />
            </Suspense>
        </>
    );
};

export default Page;