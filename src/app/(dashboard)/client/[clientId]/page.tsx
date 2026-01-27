import { headers } from "next/headers";
import { redirect } from "next/navigation";

import auth from "@/lib/auth";
import { Suspense } from "react";
import { getClientById } from "@/modules/clients/server/actions";
import {
  ClientIdErrorView,
  ClientIdLoadingView,
  ClientIdView,
} from "@/modules/clients/ui/views/client-id-view";
import { getDossiersByClientId } from "@/modules/dossiers/server/actions";

interface Props {
  params: Promise<{
    clientId: string;
  }>;
}

const Page = async ({ params }: Props) => {
  const { clientId } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const res = await getClientById(clientId);

  if (!res.success) {
    return <ClientIdErrorView />;
  }
  const { data } = res;

  if (!data) {
    return <ClientIdErrorView />;
  }

  // Récupérer les dossiers du client
  const dossiersRes = await getDossiersByClientId(clientId);
  const dossiers = dossiersRes.success ? dossiersRes.data : [];

  return (
    <>
      <Suspense fallback={<ClientIdLoadingView />}>
        <ClientIdView client={data} clientId={clientId} dossiers={dossiers} />
      </Suspense>
    </>
  );
};

export default Page;
