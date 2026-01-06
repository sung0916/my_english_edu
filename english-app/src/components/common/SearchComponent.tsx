import React, { useState } from "react";

export interface SearchFilter {
    key: string;
    label: string;
    type: 'text' | 'select';
    options?: string[];
}

interface SearchComponentProps {
    filters: SearchFilter[];
    onSearch: (searchCriteria: Record<string, any>) => void;
}

const SearchComponent: React.FC<SearchComponentProps> = ({ filters, onSearch }) => {
    const [searchValues, setSearchValues] = useState<Record<string, any>>({});

    const handleInputChange = (key: string, value: string) => {
        setSearchValues(prev => ({ ...prev, [key]: value }));
    };

    const handleSearch = () => {
        onSearch(searchValues);
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {filters.map(filter => (
                    <div key={filter.key} className="flex flex-col space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                            {filter.label}
                        </label>

                        {filter.type === 'text' && (
                            <input
                                type="text"
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder={`${filter.label} 입력`}
                                onChange={(e) => handleInputChange(filter.key, e.target.value)}
                                value={searchValues[filter.key] || ''}
                            />
                        )}
                        
                        {/* select 타입 처리 추가 (예시) */}
                        {filter.type === 'select' && filter.options && (
                            <select
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                onChange={(e) => handleInputChange(filter.key, e.target.value)}
                                value={searchValues[filter.key] || ''}
                            >
                                <option value="">전체</option>
                                {filter.options.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        )}
                    </div>
                ))}
            </div>
            
            <div className="flex justify-end">
                <button 
                    onClick={handleSearch}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    검색 적용
                </button>
            </div>
        </div>
    );
}

export default SearchComponent;
