import { FileText, FileUp } from "lucide-react";
import { deleteAttachment, uploadAttachment } from "@/features/admin/actions";
import { Button } from "@/components/ui/Button";

type Attachment = {
  id: string;
  file_name: string;
  mime_type: string;
  is_primary_image: boolean;
  signedUrl?: string;
};

export function AttachmentManager({
  attachments,
  communitySlug,
  topicId,
  topicSlug,
}: {
  attachments: Attachment[];
  communitySlug: string;
  topicId: string;
  topicSlug: string;
}) {
  return <section className="mt-10 border-t border-[var(--line)] pt-8">
    <div className="flex items-center gap-2">
      <FileUp className="h-5 w-5 text-[var(--brand)]" />
      <h2 className="text-xl font-bold">Anhänge</h2>
    </div>
    <p className="mt-2 text-sm text-[var(--muted)]">JPG, PNG, WebP oder PDF · maximal 10 MB · höchstens 5 Dateien.</p>
    <ul className="mt-4 grid gap-3 sm:grid-cols-2">
      {attachments.map((attachment) => <li key={attachment.id} className="flex min-w-0 items-center gap-3 border border-[var(--line)] bg-white p-3">
        {attachment.mime_type.startsWith("image/") && attachment.signedUrl
          ? <div role="img" aria-label={attachment.file_name} className="h-20 w-20 shrink-0 bg-stone-100 bg-cover bg-center" style={{ backgroundImage: `url(${attachment.signedUrl})` }} />
          : <div className="flex h-20 w-20 shrink-0 items-center justify-center bg-stone-100 text-[var(--muted)]"><FileText className="h-7 w-7" aria-hidden="true" /></div>}
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm font-medium">{attachment.file_name}</p>
          {attachment.is_primary_image && <p className="mt-1 text-xs text-[var(--muted)]">Primärbild</p>}
        </div>
        <form action={deleteAttachment}>
          <input type="hidden" name="communitySlug" value={communitySlug} />
          <input type="hidden" name="topicId" value={topicId} />
          <input type="hidden" name="topicSlug" value={topicSlug} />
          <input type="hidden" name="attachmentId" value={attachment.id} />
          <Button variant="danger" className="px-3">Entfernen</Button>
        </form>
      </li>)}
    </ul>
    <form action={uploadAttachment} className="mt-4 flex flex-wrap items-end gap-4">
      <input type="hidden" name="communitySlug" value={communitySlug} />
      <input type="hidden" name="topicId" value={topicId} />
      <input type="hidden" name="topicSlug" value={topicSlug} />
      <label className="text-sm font-semibold">Datei
        <input type="file" name="file" required accept="image/jpeg,image/png,image/webp,application/pdf" className="mt-2 block text-sm" />
      </label>
      <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name="primary" />Primäres Bild</label>
      <Button>Datei hochladen</Button>
    </form>
  </section>;
}
