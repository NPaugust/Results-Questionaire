import React from "react";

interface TableSkeletonProps {
  rowCount?: number;
  columnCount?: number;
  hasHeader?: boolean;
  hasFilter?: boolean;
  className?: string;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rowCount = 5,
  columnCount = 8,
  hasHeader = true,
  hasFilter = true,
  className = "",
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {hasHeader && (
            <thead>
              <tr className="border-b border-gray-200">
                {Array.from({ length: columnCount }).map((_, colIndex) => (
                  <th 
                    key={`header-${colIndex}`} 
                    className="px-3 py-2.5 text-center text-xs bg-gray-50 border-r border-gray-200 w-96"
                  >
                    <div className="h-5 bg-gray-200 animate-pulse rounded w-64 mx-auto"></div>
                  </th>
                ))}
              </tr>
              {hasFilter && (
                <tr className="border-b border-gray-200">
                  {Array.from({ length: columnCount }).map((_, colIndex) => (
                    <th 
                      key={`filter-${colIndex}`} 
                      className="px-3 py-2 text-center text-xs bg-gray-50/50 border-r border-gray-200"
                    >
                      <div className="h-3 bg-gray-100 animate-pulse rounded w-1/2 mx-auto"></div>
                    </th>
                  ))}
                </tr>
              )}
            </thead>
          )}
          <tbody>
            {Array.from({ length: rowCount }).map((_, rowIndex) => (
              <tr 
                key={`row-${rowIndex}`} 
                className="border-b border-gray-100 hover:bg-gray-50/50"
              >
                {Array.from({ length: columnCount }).map((_, colIndex) => (
                  <td 
                    key={`cell-${rowIndex}-${colIndex}`} 
                    className="px-3 py-2.5 text-sm border-r border-gray-100"
                  >
                    <div className="h-5 bg-gray-200 animate-pulse rounded w-11/12"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const MobileCardsSkeleton: React.FC<{ cardCount?: number }> = ({ 
  cardCount = 5 
}) => {
  return (
    <div className="block sm:hidden p-3">
      {Array.from({ length: cardCount }).map((_, index) => (
        <div 
          key={`card-${index}`}
          className="mb-3 p-3 border border-gray-100 rounded-lg bg-white"
        >
          <div className="flex justify-between items-center mb-2">
            <div className="h-5 bg-gray-200 animate-pulse rounded w-2/3"></div>
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 bg-gray-200 animate-pulse rounded-full"></div>
              <div className="h-4 bg-gray-200 animate-pulse rounded w-8"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-x-2 gap-y-2">
            {Array.from({ length: 6 }).map((_, itemIndex) => (
              <div key={`card-item-${index}-${itemIndex}`} className="flex items-center gap-1">
                <div className="h-3.5 bg-gray-200 animate-pulse rounded w-16"></div>
                <div className="h-3.5 bg-gray-200 animate-pulse rounded w-6"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export const MapSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="w-full h-[400px] bg-gray-100 animate-pulse flex items-center justify-center">
        <svg 
          className="w-12 h-12 text-gray-300" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export const PageSkeleton: React.FC = () => {
  return (
    <div className="max-w-[1250px] mx-auto container px-4 py-8">
      {/* Хлебные крошки и заголовок */}
      <div className="mb-4 flex justify-between items-center">
        <div className="h-5 bg-gray-200 animate-pulse rounded w-48"></div>
        <div className="h-6 bg-gray-200 animate-pulse rounded w-64"></div>
      </div>
      
      {/* Карта */}
      <MapSkeleton />
      
      {/* Таблица */}
      <div className="mt-8">
        <TableSkeleton />
      </div>
      
      {/* Мобильные карточки */}
      <MobileCardsSkeleton />
    </div>
  );
};

export default TableSkeleton; 