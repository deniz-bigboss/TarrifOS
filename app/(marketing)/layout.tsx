import { SiteFooter } from "@/components/marketing/site-footer";

/* Every marketing page opens with a dark band and floats the shared
   OverlayHeader over it, so pages own their headers; the footer is shared. */
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
