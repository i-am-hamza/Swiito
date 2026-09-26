"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { updateSettingsAction, upsertAmenityAction, deleteAmenityAction } from "@/lib/actions/admin";

const SETTINGS_FIELDS: { key: string; label: string; type?: string }[] = [
  { key: "broker_phone", label: "Broker phone number" },
  { key: "broker_whatsapp", label: "Broker WhatsApp number" },
  { key: "broker_display", label: "Broker display name" },
  { key: "instagram_url", label: "Instagram URL" },
];

interface Amenity {
  id: string;
  name: string;
  icon: string | null;
  sortOrder: number;
}

interface Props {
  settings: Record<string, string>;
  amenities: Amenity[];
}

export function SettingsClient({ settings: initialSettings, amenities: initialAmenities }: Props) {
  const router = useRouter();
  const { addToast } = useToast();
  const [, startTransition] = useTransition();
  const [values, setValues] = useState(initialSettings);
  const [savingSettings, setSavingSettings] = useState(false);

  const [amenities, setAmenities] = useState(initialAmenities);
  const [amenityModal, setAmenityModal] = useState<Partial<Amenity> | null>(null);
  const [deleteAmenityId, setDeleteAmenityId] = useState<string | null>(null);
  const [savingAmenity, setSavingAmenity] = useState(false);

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSavingSettings(true);
    const settingsToSave: Record<string, string> = {};
    for (const field of SETTINGS_FIELDS) {
      if (values[field.key] !== undefined) settingsToSave[field.key] = values[field.key];
    }
    const res = await updateSettingsAction(settingsToSave);
    setSavingSettings(false);
    if (res.ok) {
      addToast({ type: "success", message: "Settings saved." });
      startTransition(() => router.refresh());
    } else {
      addToast({ type: "error", message: res.error ?? "Failed." });
    }
  }

  async function handleSaveAmenity() {
    if (!amenityModal) return;
    setSavingAmenity(true);
    const res = await upsertAmenityAction({
      id: amenityModal.id,
      name: amenityModal.name ?? "",
      icon: amenityModal.icon ?? null,
      sort_order: amenityModal.sortOrder ?? null,
    });
    setSavingAmenity(false);
    if (res.ok) {
      addToast({ type: "success", message: "Amenity saved." });
      setAmenityModal(null);
      startTransition(() => router.refresh());
    } else {
      addToast({ type: "error", message: res.error ?? "Failed." });
    }
  }

  async function handleDeleteAmenity() {
    if (!deleteAmenityId) return;
    setSavingAmenity(true);
    const res = await deleteAmenityAction(deleteAmenityId);
    setSavingAmenity(false);
    if (res.ok) {
      addToast({ type: "success", message: "Amenity deleted." });
      setDeleteAmenityId(null);
      setAmenities((prev) => prev.filter((a) => a.id !== deleteAmenityId));
    } else {
      addToast({ type: "error", message: res.error ?? "Failed." });
    }
  }

  return (
    <div className="space-y-8">
      {/* Broker / contact settings */}
      <div className="bg-surface rounded-lg border border-[var(--border)] p-5">
        <h2 className="text-xs font-medium text-fg-muted uppercase tracking-wide mb-4">
          Broker &amp; contact details
        </h2>
        <form onSubmit={handleSaveSettings} className="space-y-4">
          {SETTINGS_FIELDS.map((f) => (
            <Input
              key={f.key}
              label={f.label}
              type={f.type}
              value={values[f.key] ?? ""}
              onChange={(e) => setValues((p) => ({ ...p, [f.key]: e.target.value }))}
            />
          ))}
          <div className="flex justify-end">
            <Button type="submit" disabled={savingSettings}>
              {savingSettings ? "Saving…" : "Save settings"}
            </Button>
          </div>
        </form>
      </div>

      {/* Amenities */}
      <div className="bg-surface rounded-lg border border-[var(--border)] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-medium text-fg-muted uppercase tracking-wide">Amenities</h2>
          <Button size="sm" onClick={() => setAmenityModal({})}>
            <Plus size={13} className="mr-1" /> Add
          </Button>
        </div>

        {amenities.length === 0 ? (
          <p className="text-sm text-fg-muted">No amenities yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {amenities.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-2 border border-[var(--border)]"
              >
                {a.icon && <span className="text-base">{a.icon}</span>}
                <span className="text-sm text-fg flex-1">{a.name}</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setAmenityModal({ id: a.id, name: a.name, icon: a.icon, sortOrder: a.sortOrder })}
                    className="p-1 rounded text-fg-muted hover:text-fg hover:bg-surface transition-brand"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteAmenityId(a.id)}
                    className="p-1 rounded text-fg-muted hover:text-danger hover:bg-danger/10 transition-brand"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Amenity modal */}
      <Modal
        isOpen={amenityModal !== null}
        onClose={() => setAmenityModal(null)}
        title={amenityModal?.id ? "Edit amenity" : "Add amenity"}
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setAmenityModal(null)}>Cancel</Button>
            <Button onClick={handleSaveAmenity} disabled={savingAmenity}>
              {savingAmenity ? "Saving…" : "Save"}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <Input
            label="Name"
            value={amenityModal?.name ?? ""}
            onChange={(e) => setAmenityModal((p) => ({ ...p, name: e.target.value }))}
          />
          <Input
            label="Icon (emoji, optional)"
            value={amenityModal?.icon ?? ""}
            onChange={(e) => setAmenityModal((p) => ({ ...p, icon: e.target.value || null }))}
          />
          <Input
            label="Sort order"
            type="number"
            value={amenityModal?.sortOrder ?? ""}
            onChange={(e) => setAmenityModal((p) => ({ ...p, sortOrder: Number(e.target.value) }))}
          />
        </div>
      </Modal>

      {/* Delete amenity confirm */}
      <Modal
        isOpen={!!deleteAmenityId}
        onClose={() => setDeleteAmenityId(null)}
        title="Delete amenity"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeleteAmenityId(null)}>Cancel</Button>
            <Button className="bg-danger text-white" onClick={handleDeleteAmenity} disabled={savingAmenity}>
              {savingAmenity ? "Deleting…" : "Delete"}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-fg-muted">This will remove the amenity from all listings. This cannot be undone.</p>
      </Modal>
    </div>
  );
}
