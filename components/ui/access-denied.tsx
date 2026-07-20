import { ShieldAlert } from "lucide-react";
import { useTranslation } from "@/lib/hooks/use-translation";

export function AccessDenied() {
  const { language } = useTranslation();
  
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-slate-200 bg-white shadow-sm min-h-[400px]">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500 mb-6 ring-8 ring-red-50/50">
        <ShieldAlert className="h-10 w-10" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
        {language === "km" ? "មិនមានសិទ្ធិចូលមើល" : "Access Denied"}
      </h2>
      <p className="text-slate-500 max-w-md mx-auto">
        {language === "km" 
          ? "គណនីរបស់អ្នកមិនមានសិទ្ធិគ្រប់គ្រាន់ក្នុងការចូលមើល ឬគ្រប់គ្រងទំព័រមួយនេះទេ។ សូមទាក់ទងអ្នកគ្រប់គ្រងប្រព័ន្ធ (System Admin) ប្រសិនបើអ្នកគិតថានេះគឺជាកំហុស។" 
          : "Your account does not have the required permissions to view or manage this page. Please contact a System Administrator if you believe this is an error."}
      </p>
    </div>
  );
}
