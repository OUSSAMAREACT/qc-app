import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, name = "QCMEchelle11", type = "website", image, url }) {
    const siteUrl = window.location.origin;
    const imageUrl = image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : `${siteUrl}/og-image.jpg`; // Assuming a default og-image exists or will exist
    const currentUrl = url ? (url.startsWith('http') ? url : `${siteUrl}${url}`) : window.location.href;

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{title} | QCMEchelle11</title>
            <meta name='description' content={description} />
            {/* End standard metadata tags */}

            {/* Facebook tags */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={imageUrl} />
            <meta property="og:url" content={currentUrl} />
            {/* End Facebook tags */}

            {/* Twitter tags */}
            <meta name="twitter:creator" content={name} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={imageUrl} />
            {/* End Twitter tags */}
        </Helmet>
    );
}
