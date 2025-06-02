"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRemarks } from "@/components/RemarksApi";
import { getCookie } from "@/lib/api/login";
import { ArrowLeft, FileSearch, Search, X, Filter } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function RemarksPage() {
  const { remarks, isLoading, error } = useRemarks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [localRemarks, setLocalRemarks] = useState<any[]>([]);
  const [courtColumnWidth, setCourtColumnWidth] = useState<number>(250);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [courtFilter, setCourtFilter] = useState<string>("all");
  const [courtSearch, setCourtSearch] = useState<string>("");
  const resizingRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);
  
  const router = useRouter();
  const pathname = usePathname();
  const { language, getTranslation } = useLanguage();

  const startResize = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = courtColumnWidth;
    if (typeof document !== 'undefined') {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', stopResize);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    const diff = e.clientX - startXRef.current;
    const newWidth = Math.max(150, startWidthRef.current + diff);
    setCourtColumnWidth(newWidth);
  };

  const stopResize = () => {
    setIsResizing(false);
    if (typeof document !== 'undefined') {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', stopResize);
    }
  };

  const CommentModal = ({
    isOpen,
    onClose,
    onSubmit,
    selectedComment,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (comment: string) => void;
    selectedComment: string;
  }) => {
    const [comment, setComment] = useState("");

    useEffect(() => {
      if (isOpen) setComment("");
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = () => {
      onSubmit(comment);
      setComment("");
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
        <div className="bg-white rounded-lg p-6 w-full max-w-lg">
          <h3 className="text-lg font-semibold mb-4">{getTranslation("RemarksLogic_ModalTitle", language)}</h3>
          <p className="text-gray-600 mb-4">{getTranslation("RemarksLogic_ModalMessage", language)} {selectedComment}</p>
          <textarea
            className="w-full border rounded p-2 mb-4 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={getTranslation("RemarksLogic_ModalPlaceholder", language)}
          />
          <div className="flex justify-end gap-2">
            <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-all duration-200" onClick={onClose}>
              {getTranslation("RemarksLogic_ModalClose", language)}
            </button>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all duration-200"
              onClick={handleSubmit}
            >
              {getTranslation("RemarksLogic_ModalButton", language)}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ViewMessageModal = ({
    isOpen,
    onClose,
    message,
  }: {
    isOpen: boolean;
    onClose: () => void;
    message: string;
  }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
        <div className="bg-white rounded-lg p-6 w-full max-w-lg">
          <h3 className="text-lg font-semibold mb-4">{getTranslation("RemarksLogic_ViewMessageTitle", language)}</h3>
          <div className="border rounded p-4 mb-4 bg-gray-50 max-h-60 overflow-auto">
            <p className="text-gray-700 whitespace-pre-wrap">{message || "—"}</p>
          </div>
          <div className="flex justify-end">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all duration-200"
              onClick={onClose}
            >
              {getTranslation("RemarksLogic_ModalClose", language)}
            </button>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    try {
      if (remarks) {
        setLocalRemarks(remarks);
      }
    } catch (error) {
      console.error("Ошибка при обработке данных замечаний:", error);
      setLocalRemarks([]);
    }
  }, [remarks]);

  useEffect(() => {
    if (localRemarks.length === 0 && !isLoading) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [localRemarks, isLoading]);

  const handleCommentSubmit = async (comment: string) => {
    try {
      const token = getCookie("access_token");
      const response = await fetch(
        "https://opros.sot.kg/api/v1/comments/respond/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            question_response: selectedItem.id,
            reply_to_comment: comment,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || getTranslation("RemarksLogic_Error_Adding", language)
        );
      }

      setLocalRemarks((prev) =>
        prev.map((item) =>
          item.id === selectedItem.id
            ? { ...item, reply_to_comment: comment }
            : item
        )
      );

      setIsModalOpen(false);
    } catch (error) {
      console.error("Ошибка при добавлении комментария:", error);
      alert(getTranslation("RemarksLogic_Error_Adding", language));
    }
  };

  const normalizeString = (str: string) => str.replace(/-/g, ' ').toLowerCase();

  const uniqueCourts = useMemo(() => {
    const courts = new Set<string>(localRemarks.map((item) => item.court || "Не указано"));
    return ["all", ...Array.from(courts).sort()];
  }, [localRemarks]);

  const filteredRemarks = useMemo(() => {
    return localRemarks.filter((item) => {
      const court = item.court || "Не указано";
      const normalizedCourt = normalizeString(court);
      const normalizedSearch = normalizeString(courtSearch);
      const matchesFilter = courtFilter === "all" || court === courtFilter;
      const matchesSearch = courtSearch === "" || normalizedCourt.includes(normalizedSearch);
      return matchesFilter && matchesSearch;
    });
  }, [localRemarks, courtFilter, courtSearch]);

  const handleMessageClick = (item: any) => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };

  const handleCommentClick = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const resetFilters = () => {
    setCourtFilter("all");
    setCourtSearch("");
  };

  if (isLoading) {
    return <p className="text-center text-gray-700">{getTranslation("RemarksLogic_Loading", language)}</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{getTranslation("RemarksLogic_Error", language)}: {error}</p>;
  }

  return (
    <>
      {filteredRemarks.length === 0 && localRemarks.length === 0 ? (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center max-w-3xl w-full mx-auto">
            <div className="animate-bounce mb-8">
              <FileSearch size={72} className="text-blue-500" />
            </div>
            <p className="text-gray-800 text-3xl font-bold mb-4 text-center">
              {getTranslation("RemarksLogic_NoRemarks", language)}
            </p>
            <p className="text-gray-600 text-lg mb-10 text-center max-w-lg">
              {getTranslation("RemarksLogic_NoRemarksMessage", language)}
            </p>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-3 px-8 py-3 bg-blue-500 text-white text-base font-medium rounded-lg hover:bg-blue-600 transition-all duration-200"
            >
              <ArrowLeft size={20} />
              <span>{getTranslation("RemarksLogic_Back", language)}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 mx-auto">
          <div className="flex sm:flex-row items-center justify-between mb-6 gap-4 sm:gap-0">
            <h1 className="text-2xl max-sm:text-xl font-bold text-gray-800 tracking-tight text-center sm:text-left RemarksText">
              {getTranslation("RemarksLogic_Remarks", language)}
            </h1>
            <button
              onClick={() => router.back()}
              className="max-sm:px-2 max-sm:py-2 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
            >
              <ArrowLeft size={18} />
              {getTranslation("RemarksLogic_Back", language)}
            </button>
          </div>

          {/* Filter and Search Section */}
          <div className="mb-6 bg-white shadow-md rounded-lg p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <label htmlFor="court-filter" className="text-sm font-medium text-gray-700">
                  {getTranslation("RemarksLogic_FilterByCourt", language)}
                </label>
              </div>
              <select
                id="court-filter"
                value={courtFilter}
                onChange={(e) => {
                  setCourtFilter(e.target.value);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 text-sm transition-all duration-200"
              >
                {uniqueCourts.map((court) => (
                  <option key={court} value={court}>
                    {court === "all" ? getTranslation("RemarksLogic_AllCourts", language) : court}
                  </option>
                ))}
              </select>
              <div className="flex-1 sm:flex-initial relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={courtSearch}
                  onChange={(e) => {
                    setCourtSearch(e.target.value);
                  }}
                  placeholder={getTranslation("RemarksLogic_SearchCourt", language)}
                  className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 text-sm w-full transition-all duration-200"
                />
              </div>
            </div>
            {(courtFilter !== "all" || courtSearch) && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-all duration-200"
              >
                <X size={16} />
                {getTranslation("RemarksLogic_ClearFilters", language)}
              </button>
            )}
          </div>

          <div className="bg-white shadow-md rounded-lg w-full overflow-hidden">
            <div className="w-full overflow-x-auto">
              <table className="w-full table-fixed border-collapse">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th scope="col" className="w-16 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      №
                    </th>
                    <th scope="col" style={{ width: `${courtColumnWidth}px` }} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative border-r border-gray-200">
                      {getTranslation("RemarksLogic_Court", language)}
                      <div 
                        ref={resizingRef}
                        className="absolute right-0 top-0 bottom-0 w-2 bg-transparent hover:bg-blue-300 cursor-col-resize"
                        onMouseDown={startResize}
                      ></div>
                    </th>
                    <th scope="col" className="w-1/3 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      {getTranslation("RemarksLogic_Message", language)}
                    </th>
                    <th scope="col" className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      {getTranslation("RemarksLogic_Chairman", language)}
                    </th>
                    <th scope="col" className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      {getTranslation("RemarksLogic_Reply", language)}
                    </th>
                    <th scope="col" className="w-1/6 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {getTranslation("RemarksLogic_Actions", language)}
                    </th>
                  </tr>
                </thead>
                <tbody className="min-h-[320px]">
                  {filteredRemarks.slice().reverse().map((item: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50 h-16 border-b border-gray-100 transition-colors duration-150">
                      <td className="px-6 py-4 text-sm text-gray-700 text-center border-r border-gray-200">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-200" style={{ width: `${courtColumnWidth}px` }}>
                        <div className="whitespace-normal break-words" title={item.court || "Не указано"}>
                          {item.court || "Не указано"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 border-r border-gray-200">
                        <div 
                          className="line-clamp-2 h-10 overflow-hidden cursor-pointer hover:text-blue-600 transition-colors duration-200" 
                          title={item.custom_answer || "—"}
                          onClick={() => handleMessageClick(item)}
                        >
                          {item.custom_answer || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 text-center border-r border-gray-200">
                        <div className="truncate" title={item.author || "—"}>
                          {item.author || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 text-center border-r border-gray-200">
                        <div className="truncate" title={item.reply_to_comment || "—"}>
                          {item.reply_to_comment || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleCommentClick(item)}
                          className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                        >
                          {getTranslation("RemarksLogic_Comment", language)}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <CommentModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleCommentSubmit}
            selectedComment={selectedItem?.custom_answer || ""}
          />

          <ViewMessageModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            message={selectedItem?.custom_answer || ""}
          />
        </div>
      )}
    </>
  );
}