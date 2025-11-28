import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Input({ label, error, className, rightElement, ...props }) {
    return (
        <div className="flex flex-col gap-1">
            {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
            <div className="relative">
                <input
                    className={twMerge(
                        "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors",
                        error
                            ? "border-red-500 focus:ring-red-200"
                            : "border-gray-300 focus:border-blue-500 focus:ring-blue-200",
                        className
                    )}
                    {...props}
                />
                {rightElement && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        {rightElement}
                    </div>
                )}
            </div>
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    );
}
