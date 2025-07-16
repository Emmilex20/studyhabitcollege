// client/src/swiper-custom.d.ts

// This declares modules for specific Swiper CSS paths
declare module 'swiper/css' {
  const content: Record<string, string>;
  export default content;
}

declare module 'swiper/css/pagination' {
  const content: Record<string, string>;
  export default content;
}

declare module 'swiper/css/navigation' {
  const content: Record<string, string>;
  export default content;
}

declare module 'swiper/css/effect-fade' {
  const content: Record<string, string>;
  export default content;
}