"use client";

export default function DonationButton() {
  return (
    <a
      href="https://ko-fi.com/I3I81FBMLL"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-3 right-3 z-50 flex items-center gap-2 
           bg-pink-500 hover:bg-pink-600 text-white 
           px-3 py-2 md:px-4 md:py-2 
           rounded-full shadow-lg transition-all duration-300
           max-w-[90vw] overflow-hidden"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className="w-5 h-5 md:w-6 md:h-6 fill-current"
      >
        <path d="M26.74 8.73c-1.17-1.25-2.92-1.89-5.21-1.89h-17a1 1 0 0 0-1 1v17.62a1 1 0 0 0 1 1h13.62c5.65 0 9.55-3.43 9.55-8.53 0-1.81-.56-3.3-1.66-4.45.94-.93 1.42-2.12 1.42-3.49 0-1.41-.46-2.6-1.22-3.26zm-2.59 3.26c0 1.04-.36 1.8-1.07 2.3-.31.21-.48.55-.48.92 0 .37.17.7.48.92 1.1.78 1.65 1.81 1.65 3.1 0 3.58-2.83 5.53-7.55 5.53h-2.93V9.84h6.12c1.37 0 2.36.29 2.97.86.59.56.86 1.34.86 2.29z" />
      </svg>

      {/* Texto visível só em telas médias pra cima */}
      <span className="hidden md:inline">Donate on Ko-fi</span>
    </a>
  );
}
