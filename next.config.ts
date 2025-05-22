
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      // If you plan to use Firebase Storage for images, you might add its hostname here later
      // Example for Firebase Storage:
      // {
      //   protocol: 'https',
      //   hostname: 'firebasestorage.googleapis.com',
      // }
    ],
  },
};

export default nextConfig;
