/// <reference path="../.astro/types.d.ts" />
declare module "*.css" {
  const content: any;
  export default content;
}
declare module "aos";
declare module "bootstrap/dist/js/bootstrap.bundle.min.js";
declare module "swiper/bundle";

interface Window {
  AOS: any;
  Swiper: any;
}