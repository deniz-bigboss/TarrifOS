import { SiteFooter } from "@/components/marketing/site-footer";

/* Each marketing page brings its own header: the landing page floats a
   transparent header over its dark hero, while inner pages (pricing)
   render the standard sticky SiteHeader. The footer is shared. */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
