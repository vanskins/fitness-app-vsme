import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { ConfirmDialog, type DialogOptions } from "@/components/ui/ConfirmDialog";

interface DialogContextValue {
  /** Resolves true if confirmed, false if cancelled/dismissed. */
  confirm: (options: DialogOptions) => Promise<boolean>;
  /** Single-button info/validation dialog. */
  alert: (options: Omit<DialogOptions, "confirmOnly">) => Promise<void>;
}

const DialogContext = createContext<DialogContextValue | null>(null);

interface DialogState {
  options: DialogOptions;
  resolve: (confirmed: boolean) => void;
}

/** App-wide custom dialog. Replaces React Native's Alert with a styled popup. */
export function DialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DialogState | null>(null);

  const confirm = useCallback(
    (options: DialogOptions) =>
      new Promise<boolean>((resolve) => setState({ options, resolve })),
    [],
  );

  const alert = useCallback(
    (options: Omit<DialogOptions, "confirmOnly">) =>
      confirm({
        ...options,
        confirmOnly: true,
        confirmLabel: options.confirmLabel ?? "OK",
      }).then(() => undefined),
    [confirm],
  );

  const finish = useCallback(
    (result: boolean) => {
      setState((s) => {
        s?.resolve(result);
        return null;
      });
    },
    [],
  );

  const value = useMemo(() => ({ confirm, alert }), [confirm, alert]);

  return (
    <DialogContext.Provider value={value}>
      {children}
      <ConfirmDialog
        visible={state !== null}
        options={state?.options}
        onConfirm={() => finish(true)}
        onCancel={() => finish(false)}
      />
    </DialogContext.Provider>
  );
}

export function useDialog(): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog must be used within a DialogProvider");
  return ctx;
}
