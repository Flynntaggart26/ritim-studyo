"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createLessonType, updateLessonType, toggleLessonType, deleteLessonType } from "@/actions/teacher";
import { Button } from "@/components/ui/button";
import { Card, Badge } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";

type LessonTypeItem = {
  id: string;
  title: string;
  description: string;
  durationMin: number;
  materials: string;
  price: number | null;
  isActive: boolean;
  _count: { bookings: number };
};

type LessonForm = { title: string; description: string; durationMin: number; materials: string; price: string };
const EMPTY: LessonForm = { title: "", description: "", durationMin: 60, materials: "", price: "" };

export function LessonTypesManager({ lessons }: { lessons: LessonTypeItem[] }) {
  const router = useRouter();
  const [form, setForm] = useState<LessonForm>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<LessonForm>(EMPTY);
  const [showCreate, setShowCreate] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function payload(value: LessonForm) {
    return {
      title: value.title,
      description: value.description,
      durationMin: Number(value.durationMin),
      materials: value.materials,
      price: value.price.trim() === "" ? null : Number(value.price),
    };
  }

  async function finish(res: { ok: boolean; error?: string }, success: string) {
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "İşlem tamamlanamadı.");
      return false;
    }
    setError(null);
    setMessage(success);
    router.refresh();
    return true;
  }

  async function create() {
    setBusy(true);
    setError(null);
    if (form.price !== "" && (!Number.isInteger(Number(form.price)) || Number(form.price) < 0)) {
      setBusy(false);
      setError("Ücret tam sayı ve sıfırdan büyük olmalı.");
      return;
    }
    const ok = await finish(await createLessonType(payload(form)), "Ders tipi eklendi.");
    if (ok) {
      setForm(EMPTY);
      setShowCreate(false);
    }
  }

  async function saveEdit(id: string) {
    setBusy(true);
    setError(null);
    if (editForm.price !== "" && (!Number.isInteger(Number(editForm.price)) || Number(editForm.price) < 0)) {
      setBusy(false);
      setError("Ücret tam sayı ve sıfırdan büyük olmalı.");
      return;
    }
    const ok = await finish(await updateLessonType(id, payload(editForm)), "Ders tipi güncellendi.");
    if (ok) setEditingId(null);
  }

  function startEdit(lesson: LessonTypeItem) {
    setEditingId(lesson.id);
    setEditForm({
      title: lesson.title,
      description: lesson.description,
      durationMin: lesson.durationMin,
      materials: lesson.materials,
      price: lesson.price == null ? "" : String(lesson.price),
    });
    setError(null);
  }

  async function toggle(lesson: LessonTypeItem) {
    setBusy(true);
    await finish(await toggleLessonType(lesson.id), lesson.isActive ? "Ders pasife alındı." : "Ders aktifleştirildi.");
  }

  async function remove(lesson: LessonTypeItem) {
    if (!window.confirm(`“${lesson.title}” ders tipini silmek istiyor musunuz?`)) return;
    setBusy(true);
    await finish(await deleteLessonType(lesson.id), "Ders tipi silindi.");
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-white">Ders Tipleri</h2>
          <p className="mt-1 text-sm text-zinc-500">Süre, ücret ve öğrencinin getirmesi gerekenleri yönetin.</p>
        </div>
        <Button onClick={() => { setShowCreate(!showCreate); setError(null); }}>
          {showCreate ? "Kapat" : "+ Yeni Ders Tipi"}
        </Button>
      </div>

      {showCreate && (
        <Card className="mt-5 p-5">
          <h3 className="font-display font-bold text-white">Yeni Ders Tipi</h3>
          <LessonFormFields value={form} onChange={setForm} prefix="new" />
          <Button className="mt-4" disabled={busy} onClick={create}>{busy ? "Kaydediliyor…" : "Dersi Oluştur"}</Button>
        </Card>
      )}

      <div className="mt-5 space-y-3">
        {lessons.length === 0 ? (
          <Card className="p-8 text-center text-sm text-zinc-500">Henüz ders tipi eklenmemiş.</Card>
        ) : lessons.map((lesson) => (
          <Card key={lesson.id} className="p-5">
            {editingId === lesson.id ? (
              <>
                <LessonFormFields value={editForm} onChange={setEditForm} prefix={`edit-${lesson.id}`} />
                <div className="mt-4 flex gap-2">
                  <Button disabled={busy} onClick={() => saveEdit(lesson.id)}>Kaydet</Button>
                  <Button variant="outline" onClick={() => setEditingId(null)}>Vazgeç</Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg font-bold text-white">{lesson.title}</h3>
                      <Badge className={lesson.isActive ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-zinc-700 bg-zinc-800 text-zinc-400"}>
                        {lesson.isActive ? "Aktif" : "Pasif"}
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge className="border-zinc-700 bg-zinc-800/60 text-zinc-300">⏱ {lesson.durationMin} dk</Badge>
                      {lesson.price != null && <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-400">{formatPrice(lesson.price)}</Badge>}
                      <Badge className="border-zinc-700 bg-zinc-800/60 text-zinc-400">{lesson._count.bookings} randevu</Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => startEdit(lesson)}>Düzenle</Button>
                    <Button size="sm" variant={lesson.isActive ? "ghost" : "success"} disabled={busy} onClick={() => toggle(lesson)}>
                      {lesson.isActive ? "Pasife Al" : "Aktifleştir"}
                    </Button>
                    {lesson._count.bookings === 0 && <Button size="sm" variant="danger" disabled={busy} onClick={() => remove(lesson)}>Sil</Button>}
                  </div>
                </div>
                {lesson.description && <p className="mt-3 text-sm text-zinc-400">{lesson.description}</p>}
                {lesson.materials && <p className="mt-2 text-xs text-zinc-500">Gerekli ekipman: {lesson.materials}</p>}
              </>
            )}
          </Card>
        ))}
      </div>

      {(error || message) && (
        <div className={`mt-4 rounded-xl border p-3 text-sm ${error ? "border-red-500/30 bg-red-500/10 text-red-400" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"}`}>
          {error ?? message}
        </div>
      )}
    </div>
  );
}

function LessonFormFields({
  value,
  onChange,
  prefix,
}: {
  value: LessonForm;
  onChange: (next: LessonForm) => void;
  prefix: string;
}) {
  const set = (key: keyof LessonForm, field: string | number) => onChange({ ...value, [key]: field });
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <div>
        <Label htmlFor={`${prefix}-title`}>Ders adı</Label>
        <Input id={`${prefix}-title`} value={value.title} onChange={(e) => set("title", e.target.value)} placeholder="Örn. Birebir Ders" />
      </div>
      <div>
        <Label htmlFor={`${prefix}-duration`}>Süre</Label>
        <Select id={`${prefix}-duration`} value={value.durationMin} onChange={(e) => set("durationMin", Number(e.target.value))}>
          {[30, 45, 60, 90, 120].map((m) => <option key={m} value={m}>{m} dakika</option>)}
        </Select>
      </div>
      <div>
        <Label htmlFor={`${prefix}-price`}>Ücret (₺, isteğe bağlı)</Label>
        <Input id={`${prefix}-price`} type="number" min="0" step="1" value={value.price} onChange={(e) => set("price", e.target.value)} placeholder="Örn. 900" />
      </div>
      <div>
        <Label htmlFor={`${prefix}-materials`}>Öğrencinin getirecekleri</Label>
        <Input id={`${prefix}-materials`} value={value.materials} onChange={(e) => set("materials", e.target.value)} placeholder="Örn. Baget ve ders defteri" />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor={`${prefix}-description`}>Açıklama</Label>
        <Textarea id={`${prefix}-description`} value={value.description} onChange={(e) => set("description", e.target.value)} placeholder="Dersin içeriğini kısaca açıklayın" />
      </div>
    </div>
  );
}
