"use client";
import React from "react";

export default function SkeletonDashboard() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-xl p-6 space-y-4 animate-pulse"
            >
              {index === 0 ? (
                <>
                  <div className="flex justify-between">
                    <div className="h-6 w-1/3 bg-gray-300 rounded-md animate-shimmer"></div>
                    <div className="h-6 w-1/4 bg-gray-200 rounded-md animate-shimmer"></div>
                  </div>
                  <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center animate-shimmer">
                    <div className="h-64 w-64 bg-gray-200 rounded-full"></div>
                  </div>
                </>
              ) : index === 1 ? (
                <>
                  <div className="flex justify-between">
                    <div className="h-6 w-1/3 bg-gray-300 rounded-md animate-shimmer"></div>
                    <div className="h-6 w-1/4 bg-gray-200 rounded-md animate-shimmer"></div>
                  </div>
                  <div className="h-[400px] bg-gray-100 rounded-lg space-y-4 p-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-14 w-full bg-gray-200 rounded-md animate-shimmer"
                      ></div>
                    ))}
                  </div>
                  <div className="h-8 w-full bg-gray-200 rounded-md animate-shimmer"></div>
                </>
              ) : (
                <>
                  <div className="h-6 w-1/3 bg-gray-300 rounded-md animate-shimmer"></div>
                  <div className="h-[400px] bg-gray-100 rounded-lg animate-shimmer"></div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
