export function AdminNotAvailable({
  title,
  note,
}: {
  title: string;
  note: string;
}) {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-satoshi text-[#2F2F2F]">
          {title}
        </h1>
      </div>
      <div className="rounded-xl border border-[#EEEEEE] bg-[#FAFAFA] px-6 py-12 text-center">
        <p className="text-sm font-medium font-satoshi text-[#676565]">
          {note}
        </p>
      </div>
    </section>
  );
}
