"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTeacher, toggleTeacherActive, updateTeacherProfile } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { TeacherAvatar } from "@/components/teacher-avatar";

type TeacherItem = {
  id: string;
  title: string;
  specialties: string;
  bio: string;
  photoUrl: string | null;
  isActive: boolean;
  user: { name: string; email: string; phone: string | null };
  _count: { bookings: number; lessonTypes: number };
};

const CREATE_DEFAULT = { name: "", email: "", phone: "", password: "", title: "Bateri Eğitmeni", specialties: "", bio: "" };
type CreateForm = typeof CREATE_DEFAULT;
type EditForm = { title: string; specialties: string; bio: string; photoUrl: string };

export function AdminTeachersManager({ teachers }: { teachers: TeacherItem[] }) {
  const router = useRouter();
  const [form, setForm] = useState<CreateForm>(CREATE_DEFAULT);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ title: "", specialties: "", bio: "", photoUrl: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function create() {
    setBusy(true); setError(null); setMessage(null);
    const res = await createTeacher(form);
    setBusy(false);
    if (!res.ok) { setError(res.error); return; }
    setForm(CREATE_DEFAULT); setShowCreate(false); setMessage("Hoca hesabı oluşturuldu."); router.refresh();
  }

  async function toggle(id: string) {
    setBusy(true); setError(null); setMessage(null);
    const res = await toggleTeacherActive(id);
    setBusy(false);
    if (!res.ok) { setError(res.error); return; }
    setMessage("Hoca durumu güncellendi."); router.refresh();
  }

  function startEdit(t: TeacherItem) {
    setEditing(t.id);
    setEditForm({ title: t.title, specialties: t.specialties, bio: t.bio, photoUrl: t.photoUrl ?? "" });
    setError(null);
  }

  async function saveEdit(id: string) {
    setBusy(true); setError(null); setMessage(null);
    const res = await updateTeacherProfile(id, editForm);
    setBusy(false);
    if (!res.ok) { setError(res.error); return; }
    setEditing(null); setMessage("Hoca profili güncellendi."); router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-white">Hoca Yönetimi</h2>
          <p className="mt-1 text-sm text-zinc-500">Hoca hesabı oluşturun, profilini düzenleyin veya erişimini kapatın.</p>
        </div>
        <Button onClick={() => { setShowCreate(!showCreate); setError(null); }}>{showCreate ? "Kapat" : "+ Yeni Hoca Ekle"}</Button>
      </div>

      {showCreate && (
        <Card className="mt-5 p-5">
          <h3 className="font-display text-lg font-bold text-white">Yeni Hoca Hesabı</h3>
          <p className="mt-1 text-xs text-zinc-500">Giriş bilgilerini hocayla güvenli şekilde paylaşın.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Ad Soyad *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Ad Soyad" />
            <Field label="E-posta *" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="hoca@ornek.com" type="email" />
            <Field label="Telefon" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="05xx xxx xx xx" />
            <Field label="İlk şifre * (en az 8 karakter)" value={form.password} onChange={(v) => setForm({ ...form, password: v })} placeholder="Güçlü bir şifre belirleyin" type="password" />
            <Field label="Unvan" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="Bateri Eğitmeni" />
            <Field label="Uzmanlık alanları" value={form.specialties} onChange={(v) => setForm({ ...form, specialties: v })} placeholder="Rock, Jazz, Funk" />
            <div className="sm:col-span-2"><Label htmlFor="new-teacher-bio">Kısa biyografi</Label><Textarea id="new-teacher-bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Eğitmenin deneyimi ve ders yaklaşımı" /></div>
          </div>
          <Button className="mt-4" disabled={busy} onClick={create}>{busy ? "Oluşturuluyor…" : "Hoca Hesabını Oluştur"}</Button>
        </Card>
      )}

      <div className="mt-5 space-y-3">
        {teachers.map((t) => (
          <Card key={t.id} className="p-5">
            {editing === t.id ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Unvan" value={editForm.title} onChange={(v) => setEditForm({ ...editForm, title: v })} />
                  <Field label="Uzmanlık alanları" value={editForm.specialties} onChange={(v) => setEditForm({ ...editForm, specialties: v })} />
                  <Field label="Fotoğraf URL (isteğe bağlı)" value={editForm.photoUrl} onChange={(v) => setEditForm({ ...editForm, photoUrl: v })} placeholder="https://..." />
                  <div className="sm:col-span-2"><Label htmlFor={`bio-${t.id}`}>Biyografi</Label><Textarea id={`bio-${t.id}`} value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} /></div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button disabled={busy} onClick={() => saveEdit(t.id)}>Kaydet</Button>
                  <Button variant="outline" onClick={() => setEditing(null)}>Vazgeç</Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <TeacherAvatar name={t.user.name} photoUrl={t.photoUrl} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display font-bold text-white">{t.user.name}</h3>
                    <Badge className={t.isActive ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-zinc-700 bg-zinc-800 text-zinc-400"}>
                      {t.isActive ? "Aktif" : "Pasif"}
                    </Badge>
                  </div>
                  <div className="mt-0.5 text-sm text-zinc-500">{t.title} · {t.user.email}</div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-500">
                    <span>{t._count.lessonTypes} ders tipi</span><span>•</span><span>{t._count.bookings} randevu</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => startEdit(t)}>Profili Düzenle</Button>
                  <Button size="sm" variant={t.isActive ? "danger" : "success"} disabled={busy} onClick={() => toggle(t.id)}>
                    {t.isActive ? "Pasife Al" : "Aktifleştir"}
                  </Button>
                </div>
              </div>
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

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  const id = label.toLocaleLowerCase("tr").replace(/[^a-z0-9]+/g, "-");
  return <div><Label htmlFor={id}>{label}</Label><Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /></div>;
}
