"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import {
  upsertFaqAction,
  deleteFaqAction,
  upsertValuePropAction,
  deleteValuePropAction,
  upsertTestimonialAction,
  deleteTestimonialAction,
} from "@/lib/actions/admin";
import type { AdminContent, Faq, ValueProp, AdminTestimonial } from "@/types";

type Tab = "faqs" | "value_props" | "testimonials";

interface Props {
  content: AdminContent;
}

export function ContentClient({ content }: Props) {
  const [tab, setTab] = useState<Tab>("faqs");
  const router = useRouter();
  const { addToast } = useToast();
  const [, startTransition] = useTransition();

  const [faqModal, setFaqModal] = useState<Partial<Faq> | null>(null);
  const [vpModal, setVpModal] = useState<Partial<ValueProp> | null>(null);
  const [tModal, setTModal] = useState<Partial<AdminTestimonial> | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ type: "faq" | "vp" | "t"; id: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleFaqSave() {
    if (!faqModal) return;
    setSaving(true);
    const res = await upsertFaqAction({
      id: faqModal.id,
      category: faqModal.category ?? "general",
      question: faqModal.question ?? "",
      answer: faqModal.answer ?? "",
      sort_order: faqModal.sortOrder ?? null,
    });
    setSaving(false);
    if (res.ok) {
      addToast({ type: "success", message: "FAQ saved." });
      setFaqModal(null);
      startTransition(() => router.refresh());
    } else {
      addToast({ type: "error", message: res.error ?? "Failed." });
    }
  }

  async function handleVpSave() {
    if (!vpModal) return;
    setSaving(true);
    const res = await upsertValuePropAction({
      id: vpModal.id,
      icon: vpModal.icon ?? "",
      title: vpModal.title ?? "",
      body: vpModal.body ?? "",
      sort_order: vpModal.sortOrder ?? null,
    });
    setSaving(false);
    if (res.ok) {
      addToast({ type: "success", message: "Value prop saved." });
      setVpModal(null);
      startTransition(() => router.refresh());
    } else {
      addToast({ type: "error", message: res.error ?? "Failed." });
    }
  }

  async function handleTestimonialSave() {
    if (!tModal) return;
    setSaving(true);
    const res = await upsertTestimonialAction({
      id: tModal.id,
      author_name: tModal.authorName ?? "",
      locality: tModal.locality ?? null,
      rating: tModal.rating ?? null,
      body: tModal.body ?? "",
      avatar_url: tModal.avatarUrl ?? null,
      is_active: tModal.isActive ?? false,
      sort_order: tModal.sortOrder ?? null,
    });
    setSaving(false);
    if (res.ok) {
      addToast({ type: "success", message: "Testimonial saved." });
      setTModal(null);
      startTransition(() => router.refresh());
    } else {
      addToast({ type: "error", message: res.error ?? "Failed." });
    }
  }

  async function handleDelete() {
    if (!deleteModal) return;
    setSaving(true);
    let res: { ok: boolean; error?: string } = { ok: false };
    if (deleteModal.type === "faq") res = await deleteFaqAction(deleteModal.id);
    if (deleteModal.type === "vp") res = await deleteValuePropAction(deleteModal.id);
    if (deleteModal.type === "t") res = await deleteTestimonialAction(deleteModal.id);
    setSaving(false);
    if (res.ok) {
      addToast({ type: "success", message: "Deleted." });
      setDeleteModal(null);
      startTransition(() => router.refresh());
    } else {
      addToast({ type: "error", message: res.error ?? "Failed." });
    }
  }

  async function toggleTestimonialActive(t: AdminTestimonial) {
    setSaving(true);
    const res = await upsertTestimonialAction({
      id: t.id,
      author_name: t.authorName,
      locality: t.locality,
      rating: t.rating,
      body: t.body,
      avatar_url: t.avatarUrl,
      is_active: !t.isActive,
      sort_order: t.sortOrder,
    });
    setSaving(false);
    if (res.ok) {
      addToast({ type: "success", message: t.isActive ? "Hidden." : "Published." });
      startTransition(() => router.refresh());
    } else {
      addToast({ type: "error", message: res.error ?? "Failed." });
    }
  }

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: "faqs", label: "FAQs", count: content.faqs.length },
    { key: "value_props", label: "Value props", count: content.valueProps.length },
    { key: "testimonials", label: "Testimonials", count: content.testimonials.length },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-surface-2 rounded-lg p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm font-medium transition-brand",
              tab === t.key ? "bg-surface text-fg shadow-sm" : "text-fg-muted hover:text-fg"
            )}
          >
            {t.label}
            <span className="ml-1.5 text-xs text-fg-muted">({t.count})</span>
          </button>
        ))}
      </div>

      {/* FAQs */}
      {tab === "faqs" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setFaqModal({})}>
              <Plus size={14} className="mr-1" /> Add FAQ
            </Button>
          </div>
          {content.faqs.length === 0 ? (
            <p className="text-fg-muted text-sm">No FAQs yet.</p>
          ) : (
            <div className="bg-surface rounded-lg border border-[var(--border)] divide-y divide-[var(--border)]">
              {content.faqs.map((f) => (
                <div key={f.id} className="px-4 py-3 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-fg">{f.question}</p>
                    <p className="text-xs text-fg-muted mt-0.5 line-clamp-2">{f.answer}</p>
                    <span className="text-xs text-fg-muted">{f.category}</span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setFaqModal({ id: f.id, category: f.category, question: f.question, answer: f.answer, sortOrder: f.sortOrder })}
                      className="p-1.5 rounded hover:bg-surface-2 text-fg-muted hover:text-fg transition-brand"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteModal({ type: "faq", id: f.id })}
                      className="p-1.5 rounded hover:bg-danger/10 text-fg-muted hover:text-danger transition-brand"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Value props */}
      {tab === "value_props" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setVpModal({})}>
              <Plus size={14} className="mr-1" /> Add value prop
            </Button>
          </div>
          {content.valueProps.length === 0 ? (
            <p className="text-fg-muted text-sm">No value props yet.</p>
          ) : (
            <div className="bg-surface rounded-lg border border-[var(--border)] divide-y divide-[var(--border)]">
              {content.valueProps.map((v) => (
                <div key={v.id} className="px-4 py-3 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-fg">
                      {v.icon} {v.title}
                    </p>
                    <p className="text-xs text-fg-muted mt-0.5 line-clamp-2">{v.body}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setVpModal({ id: v.id, icon: v.icon, title: v.title, body: v.body, sortOrder: v.sortOrder })}
                      className="p-1.5 rounded hover:bg-surface-2 text-fg-muted hover:text-fg transition-brand"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteModal({ type: "vp", id: v.id })}
                      className="p-1.5 rounded hover:bg-danger/10 text-fg-muted hover:text-danger transition-brand"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Testimonials */}
      {tab === "testimonials" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setTModal({ isActive: false })}>
              <Plus size={14} className="mr-1" /> Add testimonial
            </Button>
          </div>
          {content.testimonials.length === 0 ? (
            <p className="text-fg-muted text-sm">No testimonials yet.</p>
          ) : (
            <div className="bg-surface rounded-lg border border-[var(--border)] divide-y divide-[var(--border)]">
              {content.testimonials.map((t) => (
                <div key={t.id} className={cn("px-4 py-3 flex items-start gap-3", !t.isActive && "opacity-60")}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-fg">{t.authorName}</p>
                      {t.locality && <span className="text-xs text-fg-muted">{t.locality}</span>}
                      {t.isActive ? (
                        <span className="text-xs text-accent font-medium">Published</span>
                      ) : (
                        <span className="text-xs text-fg-muted">Hidden</span>
                      )}
                    </div>
                    <p className="text-xs text-fg-muted mt-0.5 line-clamp-2">{t.body}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleTestimonialActive(t)}
                      disabled={saving}
                      className="p-1.5 rounded hover:bg-surface-2 text-fg-muted hover:text-fg transition-brand"
                      title={t.isActive ? "Hide" : "Publish"}
                    >
                      {t.isActive ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTModal({ id: t.id, authorName: t.authorName, locality: t.locality, rating: t.rating, body: t.body, avatarUrl: t.avatarUrl, isActive: t.isActive, sortOrder: t.sortOrder })}
                      className="p-1.5 rounded hover:bg-surface-2 text-fg-muted hover:text-fg transition-brand"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteModal({ type: "t", id: t.id })}
                      className="p-1.5 rounded hover:bg-danger/10 text-fg-muted hover:text-danger transition-brand"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FAQ modal */}
      <Modal
        isOpen={faqModal !== null}
        onClose={() => setFaqModal(null)}
        title={faqModal?.id ? "Edit FAQ" : "Add FAQ"}
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setFaqModal(null)}>Cancel</Button>
            <Button onClick={handleFaqSave} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        }
      >
        <div className="space-y-3">
          <Input
            label="Category"
            value={faqModal?.category ?? "general"}
            onChange={(e) => setFaqModal((p) => ({ ...p, category: e.target.value }))}
          />
          <Input
            label="Question"
            value={faqModal?.question ?? ""}
            onChange={(e) => setFaqModal((p) => ({ ...p, question: e.target.value }))}
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-fg-muted uppercase tracking-wide">Answer</label>
            <textarea
              value={faqModal?.answer ?? ""}
              onChange={(e) => setFaqModal((p) => ({ ...p, answer: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 rounded-sm bg-surface border border-[var(--border)] text-sm text-fg placeholder:text-fg-muted outline-none focus:ring-2 focus:ring-accent/40 resize-y"
            />
          </div>
          <Input
            label="Sort order"
            type="number"
            value={faqModal?.sortOrder ?? ""}
            onChange={(e) => setFaqModal((p) => ({ ...p, sortOrder: Number(e.target.value) }))}
          />
        </div>
      </Modal>

      {/* Value prop modal */}
      <Modal
        isOpen={vpModal !== null}
        onClose={() => setVpModal(null)}
        title={vpModal?.id ? "Edit value prop" : "Add value prop"}
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setVpModal(null)}>Cancel</Button>
            <Button onClick={handleVpSave} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        }
      >
        <div className="space-y-3">
          <Input
            label="Icon (emoji or text)"
            value={vpModal?.icon ?? ""}
            onChange={(e) => setVpModal((p) => ({ ...p, icon: e.target.value }))}
          />
          <Input
            label="Title"
            value={vpModal?.title ?? ""}
            onChange={(e) => setVpModal((p) => ({ ...p, title: e.target.value }))}
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-fg-muted uppercase tracking-wide">Body</label>
            <textarea
              value={vpModal?.body ?? ""}
              onChange={(e) => setVpModal((p) => ({ ...p, body: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 rounded-sm bg-surface border border-[var(--border)] text-sm text-fg outline-none focus:ring-2 focus:ring-accent/40 resize-y"
            />
          </div>
        </div>
      </Modal>

      {/* Testimonial modal */}
      <Modal
        isOpen={tModal !== null}
        onClose={() => setTModal(null)}
        title={tModal?.id ? "Edit testimonial" : "Add testimonial"}
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setTModal(null)}>Cancel</Button>
            <Button onClick={handleTestimonialSave} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        }
      >
        <div className="space-y-3">
          <Input
            label="Author name"
            value={tModal?.authorName ?? ""}
            onChange={(e) => setTModal((p) => ({ ...p, authorName: e.target.value }))}
          />
          <Input
            label="Locality (optional)"
            value={tModal?.locality ?? ""}
            onChange={(e) => setTModal((p) => ({ ...p, locality: e.target.value || null }))}
          />
          <Input
            label="Rating (1-5, optional)"
            type="number"
            min={1}
            max={5}
            value={tModal?.rating ?? ""}
            onChange={(e) => setTModal((p) => ({ ...p, rating: e.target.value ? Number(e.target.value) : null }))}
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-fg-muted uppercase tracking-wide">Body</label>
            <textarea
              value={tModal?.body ?? ""}
              onChange={(e) => setTModal((p) => ({ ...p, body: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 rounded-sm bg-surface border border-[var(--border)] text-sm text-fg outline-none focus:ring-2 focus:ring-accent/40 resize-y"
            />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={tModal?.isActive ?? false}
              onChange={(e) => setTModal((p) => ({ ...p, isActive: e.target.checked }))}
              className="w-4 h-4 accent-accent"
            />
            <span className="text-fg">Published (visible on landing page)</span>
          </label>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Confirm delete"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeleteModal(null)}>Cancel</Button>
            <Button className="bg-danger text-white" onClick={handleDelete} disabled={saving}>
              {saving ? "Deleting…" : "Delete"}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-fg-muted">This cannot be undone.</p>
      </Modal>
    </div>
  );
}
