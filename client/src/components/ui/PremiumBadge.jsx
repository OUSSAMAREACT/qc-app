import React from 'react';

export default function PremiumBadge({ type, size = 64, className = '' }) {
    const getColors = () => {
        switch (type) {
            case 'GOLD':
                return {
                    main: ['#FFD700', '#FDB931'], // Gold gradients
                    border: '#B8860B',
                    shadow: '#DAA520',
                    text: '#FFF',
                    ribbon: '#C41E3A'
                };
            case 'SILVER':
                return {
                    main: ['#E0E0E0', '#BDBDBD'], // Silver gradients
                    border: '#757575',
                    shadow: '#9E9E9E',
                    text: '#FFF',
                    ribbon: '#1976D2'
                };
            case 'BRONZE':
                return {
                    main: ['#CD7F32', '#A0522D'], // Bronze gradients
                    border: '#8B4513',
                    shadow: '#A0522D',
                    text: '#FFF',
                    ribbon: '#2E7D32'
                };
            default:
                return {
                    main: ['#E0E0E0', '#BDBDBD'],
                    border: '#757575',
                    shadow: '#9E9E9E',
                    text: '#FFF',
                    ribbon: '#1976D2'
                };
        }
    };

    const colors = getColors();
    const uniqueId = `badge-${type}-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-lg"
            >
                {/* Definitions for Gradients */}
                <defs>
                    <linearGradient id={`${uniqueId}-gradient`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={colors.main[0]} />
                        <stop offset="50%" stopColor={colors.main[1]} />
                        <stop offset="100%" stopColor={colors.main[0]} />
                    </linearGradient>
                    <linearGradient id={`${uniqueId}-shine`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="white" stopOpacity="0" />
                        <stop offset="50%" stopColor="white" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Ribbon (Behind) */}
                <path d="M20 70 L20 95 L35 85 L50 95 L50 70 Z" fill={colors.ribbon} transform="rotate(-15 50 50)" />
                <path d="M80 70 L80 95 L65 85 L50 95 L50 70 Z" fill={colors.ribbon} transform="rotate(15 50 50)" />

                {/* Outer Ring */}
                <circle cx="50" cy="50" r="45" fill={colors.border} />

                {/* Main Body */}
                <circle cx="50" cy="50" r="40" fill={`url(#${uniqueId}-gradient)`} stroke="white" strokeWidth="1" />

                {/* Inner Detail Ring */}
                <circle cx="50" cy="50" r="32" fill="none" stroke={colors.border} strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />

                {/* Star Icon */}
                <path
                    d="M50 25 L56 38 L70 38 L59 47 L63 60 L50 52 L37 60 L41 47 L30 38 L44 38 Z"
                    fill="white"
                    filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.2))"
                />

                {/* Shine Effect */}
                <circle cx="50" cy="50" r="40" fill={`url(#${uniqueId}-shine)`} />

                {/* Rank Number */}
                <text
                    x="50"
                    y="62"
                    textAnchor="middle"
                    fill={colors.text}
                    fontSize="14"
                    fontWeight="bold"
                    filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.3))"
                    style={{ fontFamily: 'serif', letterSpacing: '1px' }}
                >
                    {type === 'GOLD' ? 'CHAMPION' : type === 'SILVER' ? 'MASTER' : 'ELITE'}
                </text>
            </svg>

            {/* Optional Label below or tooltip could be added here if needed, but SVG is self-contained */}
        </div>
    );
}
