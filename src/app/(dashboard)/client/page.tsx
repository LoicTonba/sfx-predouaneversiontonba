import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import auth from "@/lib/auth";
import { ClientsWithRegimesView } from "@/modules/clients/ui/views/clients-with-regimes-view";
import { LoadingState } from "@/components/loading-state";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const Page = async ({ searchParams }: Props) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const currentPage = parseInt(params.page as string) || 1;

  return (
    <div className="flex flex-col gap-y-4">
      <Suspense fallback={
        <LoadingState 
          title="Chargement des clients..." 
          description="Veuillez patienter..." 
        />
      }>
        <ClientsWithRegimesView currentPage={currentPage} />
      </Suspense>
    </div>
  );
};

export default Page;
