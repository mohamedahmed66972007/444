
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-xl">الصفحة غير موجودة</p>
      <Link href="/" className="text-blue-500 hover:underline">
        العودة للصفحة الرئيسية
      </Link>
    </div>
  );
}
