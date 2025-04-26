import { AlertTriangle } from "lucide-react";
import { useI18n } from "./i18n-provider";

export function UnauthorizedAccess() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
      <h2 className="text-2xl font-semibold mb-2">
        {t("common.unauthorizedAccess")}
      </h2>
      <p className="text-muted-foreground">
        {t("common.noPermission")}
      </p>
    </div>
  );
}