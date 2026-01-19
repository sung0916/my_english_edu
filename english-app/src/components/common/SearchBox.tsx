import { useState } from "react";
import CustomButton from "./PosButtonProps"; 

export interface SearchOption {
    value: string;
    label: string;
}

interface SearchBoxProps {
    options: SearchOption[];
    onSearch: (searchType: string, searchQuery: string) => void;
    defaultOption?: SearchOption;
}

export const SearchBox = ({ options, onSearch, defaultOption }: SearchBoxProps) => {
    if (!options || options.length === 0) {
        return null;
    }

    const [selectedType, setSelectedType] = useState<string>(
        defaultOption ? defaultOption.value : options[0].value
    );
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = () => {
        onSearch(selectedType, searchQuery);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="flex flex-row p-1 m-1 justify-center items-center gap-2 w-full max-w-4xl mx-auto">
            {/* 드롭다운 (Select) */}
            <div className="w-32 h-12 flex items-center">
                <select
                    className="w-full h-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={selectedType}
                    onChange={(e) => {
                        setSelectedType(e.target.value);
                        setSearchQuery('');
                    }}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* 입력창 (Input) */}
            <div className="flex-1 h-12">
                <input
                    type="text"
                    className="w-full h-full px-4 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Enter here"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>

            {/* 검색 버튼 */}
            <div className="h-12 flex items-center">
                <CustomButton title="Search" onClick={handleSearch} />
            </div>
        </div>
    );
};

export default SearchBox;
