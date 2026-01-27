import { getRegimeDeclarationById } from "@/modules/regime-declaration/server/actions";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import  auth  from "@/lib/auth";
import {
    RegimeDeclarationIdErrorView,
    RegimeDeclarationIdLoadingView,
    RegimeDeclarationIdView,
} from "@/modules/regime-declaration/ui/views/regime-declaration-id-view";
import { Suspense } from "react";

interface Props {
    params: Promise<{
        regimeDeclarationId: string;
    }>;
}

const Page = async ({ params }: Props) => {
    const { regimeDeclarationId } = await params;
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

    const res = await getRegimeDeclarationById(regimeDeclarationId);

    if (!res.success) {
        return <RegimeDeclarationIdErrorView />;
    }

    const { data } = res;

    if (!data) {
        return <RegimeDeclarationIdErrorView />;
    }

    return (
        <>
            <Suspense fallback={<RegimeDeclarationIdLoadingView />}>
                <RegimeDeclarationIdView
                    regimeDeclaration={data}
                    regimeDeclarationId={regimeDeclarationId}
                />
            </Suspense>
        </>
    );
};

export default Page;