import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useDialog } from "@/context/DialogContext";
import { NoteForm } from "@/components/forms/NoteForm";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Gradient } from "@/components/ui/Gradient";
import { Icon } from "@/components/ui/Icon";
import { colors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { useNotes } from "@/hooks/useNotes";
import type { NewNote } from "@/lib/repository";
import type { DailyNote } from "@/types/note";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { confirm } = useDialog();
  const { profile, signOut } = useAuth();
  const { notes, add, update, remove } = useNotes();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DailyNote | null>(null);

  const confirmLogout = async () => {
    const ok = await confirm({
      title: "Log out?",
      message: "You can log back in anytime.",
      confirmLabel: "Log out",
      destructive: true,
      icon: "logout",
    });
    if (ok) signOut();
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (note: DailyNote) => {
    setEditing(note);
    setFormOpen(true);
  };

  const confirmDelete = async (note: DailyNote) => {
    const ok = await confirm({
      title: "Delete note?",
      message: note.content,
      confirmLabel: "Delete",
      destructive: true,
      icon: "trash",
    });
    if (ok) remove(note.id);
  };

  const handleSubmit = async (input: NewNote) => {
    if (editing) await update(editing.id, input);
    else await add(input);
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 16,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile header */}
        <View className="flex-row items-center">
          <Gradient radius={99} style={{ width: 56, height: 56 }}>
            <View className="flex-1 items-center justify-center">
              <Text className="text-lg font-medium text-white">
                {profile?.initials ?? "?"}
              </Text>
            </View>
          </Gradient>
          <View className="ml-3 flex-1">
            <Text className="text-2xl font-medium text-ink">
              {profile?.name ?? "FitNotes member"}
            </Text>
            <Text className="text-sm text-muted">
              {profile?.email ?? "Local account"}
            </Text>
          </View>
        </View>

        {/* Journal */}
        <Text className="mb-2 mt-6 text-lg font-medium text-ink">Journal</Text>
        <View className="gap-2">
          {notes.length === 0 ? (
            <Card>
              <Text className="py-3 text-sm text-muted">
                No notes yet. Jot down how you feel, energy, or sleep.
              </Text>
            </Card>
          ) : (
            notes.map((note) => (
              <Card key={note.id}>
                <View className="flex-row items-start">
                  <Pressable
                    className="flex-1 active:opacity-70"
                    accessibilityRole="button"
                    accessibilityLabel="Edit note"
                    onPress={() => openEdit(note)}
                  >
                    <Text className="text-xs text-muted">
                      {formatDate(note.notedAt)}
                    </Text>
                    <Text className="mt-1 text-base text-ink">
                      {note.content}
                    </Text>
                    <View className="mt-1.5 flex-row gap-4">
                      {note.energyLevel ? (
                        <View className="flex-row items-center">
                          <Icon name="energy" size={13} color={colors.accent.amber.icon} />
                          <Text className="ml-1 text-xs text-muted">
                            Energy {note.energyLevel}/5
                          </Text>
                        </View>
                      ) : null}
                      {note.sleepHours != null ? (
                        <View className="flex-row items-center">
                          <Icon name="sleep" size={13} color={colors.accent.violet.icon} />
                          <Text className="ml-1 text-xs text-muted">
                            {note.sleepHours} hrs
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Delete note"
                    onPress={() => confirmDelete(note)}
                    hitSlop={8}
                    className="ml-2 h-9 w-9 items-center justify-center rounded-pill active:opacity-60"
                  >
                    <Icon name="trash" size={18} color={colors.faint} />
                  </Pressable>
                </View>
              </Card>
            ))
          )}
        </View>

        <View className="mt-4">
          <Button label="Add note" icon="add" fullWidth onPress={openCreate} />
        </View>

        <View className="mt-8 items-center">
          <Text
            className="text-base font-medium text-muted"
            onPress={confirmLogout}
          >
            Log out
          </Text>
        </View>
      </ScrollView>

      <NoteForm
        visible={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
      />
    </View>
  );
}
