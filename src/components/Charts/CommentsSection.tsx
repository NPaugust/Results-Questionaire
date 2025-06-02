import React, { useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface CommentsSectionProps {
  comments: { text: string }[];
  totalResponsesAnswer: number;
  remarksPath: string;
}

export default function CommentsSection({
  comments,
  totalResponsesAnswer,
  remarksPath,
}: CommentsSectionProps) {
  const { language, getTranslation } = useLanguage();

  return (
    <div className="bg-white rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200 flex flex-col justify-between h-full">
      <div className="px-6 py-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium DiagrammTwo">
            {getTranslation("DiagrammTwo", language)}
          </h2>
          <span className="text-gray-600 DiagrammTwoTotal">
            {getTranslation("DiagrammTwoTotal", language)}{" "}
            {totalResponsesAnswer}
          </span>
        </div>
      </div>
      <div className="p-6 flex-1 DiagrammTwoComments">
        {comments.length > 0 ? (
          <div className="space-y-3">
            {comments.map((comment, index) => {
              return (
                <div
                  key={index}
                  className="flex gap-4 p-3 border rounded bg-gray-50"
                >
                  <div key={index}>{totalResponsesAnswer - index}</div>
                  <span>{comment.text}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6">
            <p className="text-gray-700 text-base sm:text-sm font-medium text-center">
              Нет доступных комментариев.
            </p>
            <p className="text-gray-500 text-xs sm:text-xs text-center mt-1 sm:mt-2">
              Пока что комментарии отсутствуют.
            </p>
          </div>
        )}
      </div>
      <div className="px-6 pb-6">
        <Link href={remarksPath}>
          <button className="mt-4 w-full py-3 text-white rounded-lg bg-green-600 hover:shadow-2xl transition-all duration-200 DiagrammTwoCommentsBtn">
            {getTranslation("DiagrammTwoButton", language)}
          </button>
        </Link>
      </div>
    </div>
  );
}
