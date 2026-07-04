import { ClassificationWizard } from "@/components/classification/wizard";
import { DisclaimerBanner } from "@/components/disclaimer";
import { getI18n } from "@/lib/i18n/server";

export const metadata = { title: "New classification — TariffOS" };

export default function NewClassificationPage() {
  const { t } = getI18n();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t.app.wizard.newTitle}</h1>
        <p className="text-sm text-muted-foreground">{t.app.wizard.newSubtitle}</p>
      </div>
      <ClassificationWizard t={t.app.wizard} />
      <DisclaimerBanner />
    </div>
  );
}
