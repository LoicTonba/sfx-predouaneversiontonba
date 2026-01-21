import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import {
    RegimeDeclarationErrorView,
    RegimeDeclarationLoadingView,
    RegimeDeclarationView,
} from "@/modules/regime-declaration/ui/views/regime-declaration-view";
import { Suspense } from "react";
import { RegimeDeclarationListHeader } from "@/modules/regime-declaration/ui/components/regime-declaration-list-header";
import { getAllRegimeDeclarations } from "@/modules/regime-declaration/server/actions";
import { DEFAULT_PAGE } from "@/constants";

interface Props {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function RegimeDeclarationContent({
    currentPage,
    search,
}: {
    currentPage: number;
    search: string;
}) {
    const res = await getAllRegimeDeclarations(currentPage, 10, search);

    if (!res.success) {
        return <RegimeDeclarationErrorView />;
    }

    const { data, total } = res;

    if (!data) {
        return <RegimeDeclarationErrorView />;
    }

    return (
        <RegimeDeclarationView
            regimeDeclarations={data}
            total={total}
            currentPage={currentPage}
        />
    );
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
    const search = (params.search as string) || "";

    return (
        <>
            <RegimeDeclarationListHeader />
            <Suspense fallback={<RegimeDeclarationLoadingView />}>
                <RegimeDeclarationContent currentPage={currentPage} search={search} />
            </Suspense>
        </>
    );
};

export default Page;