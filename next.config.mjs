/** @type {import('next').NextConfig} */
const config = {
 poweredByHeader: false,
 // Public images and canvas frames are already optimized at build time.
 images: { unoptimized: true },
 async headers() { return [{source:'/:path*',headers:[
 {key:'X-Content-Type-Options',value:'nosniff'},
 {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
 {key:'X-Frame-Options',value:'DENY'},
 {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'},
 {key:'Content-Security-Policy',value:"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'"}
 ]}, {
  // The raw HTML is a template fetched by the sandboxed CRT host.
  source: '/carmechanicos/index.html',
  headers: [{
   key: 'Content-Security-Policy',
   value: "sandbox; default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
  }],
 }]; }
};
export default config;
