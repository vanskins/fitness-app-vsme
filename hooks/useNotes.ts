import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";

import {
  addNote,
  deleteNote,
  getNotes,
  type NewNote,
  updateNote,
} from "@/lib/repository";
import type { DailyNote } from "@/types/note";

/** Journal notes, with create/update/delete mutators. */
export function useNotes() {
  const db = useSQLiteContext();
  const [notes, setNotes] = useState<DailyNote[]>([]);

  const reload = useCallback(async () => {
    setNotes(await getNotes(db));
  }, [db]);

  const add = useCallback(
    async (input: NewNote) => {
      await addNote(db, input);
      await reload();
    },
    [db, reload],
  );

  const update = useCallback(
    async (id: string, input: NewNote) => {
      await updateNote(db, id, input);
      await reload();
    },
    [db, reload],
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteNote(db, id);
      await reload();
    },
    [db, reload],
  );

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return { notes, add, update, remove, reload };
}
