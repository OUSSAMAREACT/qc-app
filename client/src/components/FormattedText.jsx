import React from 'react';
import { CheckCircle2, ChevronRight } from 'lucide-react';

const FormattedText = ({ text, className = "" }) => {
    if (!text) return null;

    // Helper to parse bold text (**text**)
    const parseBold = (str) => {
        const parts = str.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                const content = part.slice(2, -2);
                const lowerContent = content.toLowerCase();

                let colorClass = "text-gray-900 dark:text-white";

                // Check for positive keywords
                if (lowerContent.includes('correct') || lowerContent.includes('vrai') || lowerContent.includes('juste')) {
                    colorClass = "text-emerald-600 dark:text-emerald-400";
                }
                // Check for negative keywords
                else if (lowerContent.includes('incorrect') || lowerContent.includes('faux')) {
                    colorClass = "text-red-600 dark:text-red-400";
                }

                return (
                    <span key={index} className={`font-bold ${colorClass}`}>
                        {content}
                    </span>
                );
            }
            return part;
        });
    };

    // Split text into lines
    const lines = text.split('\n').filter(line => line.trim() !== '');

    return (
        <div className={`space-y-3 ${className}`}>
            {lines.map((line, index) => {
                const trimmedLine = line.trim();

                // Check if it's a list item (starts with *)
                if (trimmedLine.startsWith('*')) {
                    const content = trimmedLine.replace(/^\*\s*/, ''); // Remove leading * and space
                    return (
                        <div key={index} className="flex items-start gap-3 group">
                            <div className="mt-1.5 flex-shrink-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 group-hover:scale-125 transition-transform" />
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                                {parseBold(content)}
                            </p>
                        </div>
                    );
                }

                // Regular paragraph
                return (
                    <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                        {parseBold(trimmedLine)}
                    </p>
                );
            })}
        </div>
    );
};

export default FormattedText;
