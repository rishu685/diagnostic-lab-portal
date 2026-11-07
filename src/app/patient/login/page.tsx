import { OtpVerificationCard } from "@/components/OtpVerificationCard";

export default function PatientLoginPage() {
  return (
    <div className="max-w-md mx-auto px-4 pt-10 sm:pt-16">
      <OtpVerificationCard showPresets={true} />
    </div>
  );
}
