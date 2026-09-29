type LegalDocumentPageProps = {
  title: string;
  file: string;
};

export function LegalDocumentPage({ title, file }: LegalDocumentPageProps) {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-2xl font-bold font-satoshi text-[#2F2F2F]">{title}</h1>
        <a
          href={file}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-bold font-satoshi text-[#135391] underline"
        >
          Open document
        </a>
      </div>
      <iframe
        title={title}
        src={file}
        className="mt-6 h-[80vh] w-full rounded-xl border border-[#E5E5E5] bg-white"
      />
    </section>
  );
}
