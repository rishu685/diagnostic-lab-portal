import { use } from "react";
import { OtpVerificationCard } from "@/components/OtpVerificationCard";

export default function ExpiringLinkEntryPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);

  return (
    <div className="max-w-md mx-auto px-4 pt-10 sm:pt-16">
      <OtpVerificationCard initialToken={token} showPresets={false} />
    </div>
  );
}
