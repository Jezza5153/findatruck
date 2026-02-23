import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/admin/', '/owner/', '/settings/', '/profile/', '/onboarding/'],
            },
        ],
        sitemap: 'https://foodtrucknext2me.com/sitemap.xml',
    };
}
