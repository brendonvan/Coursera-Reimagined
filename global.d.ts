export {};

declare global {
  interface Window {
    YT: typeof import('@types/youtube');
    onYouTubeIframeAPIReady: () => void;
  }
}
