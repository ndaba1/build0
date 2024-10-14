export function DashboardPage({
  title,
  children,
  description,
  header,
}: {
  title: string;
  description: string;
  header?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="w-full h-full">
      <div className="bg-white w-full border-b">
        <section className="flex items-center justify-between max-w-6xl mx-auto p-4 py-8 sm:py-16">
          <div>
            <h2 className="text-2xl mb-3 font-bold leading-7 text-gray-900 sm:truncate sm:text-4xl sm:tracking-tight">
              {title}
            </h2>
            <p className="text-muted-foreground leading-tight">{description}</p>
          </div>

          {header}
        </section>
      </div>

      <section className="max-w-6xl mx-auto p-4">{children}</section>
    </main>
  );
}
