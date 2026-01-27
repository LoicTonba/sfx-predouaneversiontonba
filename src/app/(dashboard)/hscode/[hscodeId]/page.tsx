import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import auth from "@/lib/auth";
import { getHSCodeById } from "@/modules/hscode/server/actions";
import {
  HscodeIdErrorView,
  HscodeIdLoadingView,
  HscodeIdView,
} from "@/modules/hscode/ui/views/hscode-id-view";

/* ============================================================================
   TYPES
============================================================================ */
interface Props {
  params: Promise<{  // ✈️ Ajouter Promise
    hscodeId: string;
  }>;
}

/* ============================================================================
   PAGE
============================================================================ */

const Page = async ({ params }: Props) => {
  const { hscodeId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  // ✅ params est SYNCHRONE ici
  const res = await getHSCodeById(hscodeId);

  if (!res.success || !res.data) {
    return <HscodeIdErrorView />;
  }

  return (
   <Suspense fallback={<HscodeIdLoadingView />}>
      <HscodeIdView hscode={res.data} hscodeId={hscodeId} />
    </Suspense>
  );
};

export default Page;
