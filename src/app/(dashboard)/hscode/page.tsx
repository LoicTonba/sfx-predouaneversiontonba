import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import auth from "@/lib/auth";
import { getAllHSCodes } from "@/modules/hscode/server/actions";
import { HscodeErrorView, HscodeLoadingView, HscodeView } from "@/modules/hscode/ui/views/hscode-view";
import { HscodeListHeader } from "@/modules/hscode/ui/components/hscode-list-header";
import { DEFAULT_PAGE } from "@/constants";

/* ============================================================================
   TYPES
============================================================================ */

interface Props {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

/* ============================================================================
   DATA
============================================================================ */

async function HscodeContent({ search }: { search: string }) {
  const res = await getAllHSCodes(search);

  if (!res.success || !res.data) {
    return <HscodeErrorView />;
  }

  return <HscodeView hscode={res.data} />;
}

/* ============================================================================
   PAGE
============================================================================ */


const Page = async ({ searchParams }: Props) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

// ✅ Next.js 15 : unwrap Promise
  const params = await searchParams;

  const search = typeof params.search === "string" ? params.search : "";

  return (
    <>
      <HscodeListHeader />
      <Suspense fallback={<HscodeLoadingView />}>
        <HscodeContent search={search} />
      </Suspense>
    </>
  );
};

export default Page;
