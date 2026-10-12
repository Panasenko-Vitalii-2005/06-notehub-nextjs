"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { fetchNotes } from "@/lib/api";
import Modal from "@/components/Modal/Modal";
import NoteForm from "@/components/NoteForm/NoteForm";
import NoteList from "@/components/NoteList/NoteList";
import Pagination from "@/components/Pagination/Pagination";
import SearchBox from "@/components/SearchBox/SearchBox";
import css from "./Notes.module.css";

const NOTES_PER_PAGE = 12;
const SEARCH_DELAY = 300;

export default function NotesClient() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const updateSearch = useDebouncedCallback((value: string) => {
    setSearch(value.trim());
    setPage(1);
  }, SEARCH_DELAY);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    updateSearch(value);
  };

  const { data, isError, isFetching, isLoading } = useQuery({
    queryKey: ["notes", page, search],
    queryFn: () =>
      fetchNotes({
        page,
        perPage: NOTES_PER_PAGE,
        search: search || undefined,
      }),
    placeholderData: keepPreviousData,
  });

  return (
    <main className={css.app}>
      <header className={css.toolbar}>
        <SearchBox value={searchInput} onChange={handleSearchChange} />
        {data && data.totalPages > 1 && (
          <Pagination
            pageCount={data.totalPages}
            currentPage={page}
            onPageChange={setPage}
          />
        )}
        <button
          className={css.button}
          type="button"
          onClick={() => setIsModalOpen(true)}
        >
          Create note +
        </button>
      </header>
      {isLoading && <p role="status">Loading notes...</p>}
      {isError && <p role="alert">Failed to load notes. Please try again.</p>}
      {isFetching && !isLoading && <p role="status">Updating notes...</p>}
      {data && data.notes.length > 0 && (
        <NoteList
          notes={data.notes}
          onPageEmpty={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
        />
      )}
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <NoteForm onCancel={() => setIsModalOpen(false)} />
        </Modal>
      )}
    </main>
  );
}
