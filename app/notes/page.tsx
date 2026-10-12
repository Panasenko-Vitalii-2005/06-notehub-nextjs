import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { fetchNotes } from "@/lib/api";
import NotesClient from "./Notes.client";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const queryClient = new QueryClient();
  const queryKey = ["notes", 1, ""];

  await queryClient.prefetchQuery({
    queryKey,
    queryFn: () => fetchNotes({ page: 1, perPage: 12, search: undefined }),
  });

  const error = queryClient.getQueryState(queryKey)?.error;
  if (error) throw error;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient />
    </HydrationBoundary>
  );
}
