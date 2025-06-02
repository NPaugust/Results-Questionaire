import { AlertTriangle, Ban, CircleX, ShieldAlert } from "lucide-react";

export default function NoData() {
  return (

    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center">
      <div className="text-center p-8 max-w-md mx-auto animate-fadeIn">
        <div className="flex justify-center mb-6 ">
        <Ban color="#389cff"  width={100} height={100} />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Данные не найдены
        </h2>
        <p className="text-gray-600 mb-5">
          За выбранный период данные не найдены. Попробуйте изменить фильтры или дату.
        </p>
      </div>
    </div>
  );
}