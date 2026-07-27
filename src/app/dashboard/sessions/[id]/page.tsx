import { SessionDetailView } from "@/features/dashboard/components/SessionDetailView";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SessionDetailView id={id} />;
}
