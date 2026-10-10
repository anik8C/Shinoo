import { useEffect, useState } from "react";
import { XIcon } from "lucide-react";

function ProfilePictureViewer({ src, alt }) {
  const [isOpen, setIsOpen] = useState(false);
  const imageSrc = src || "/avatar.png";

  useEffect(() => {
    if (!isOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        className="block size-full aspect-square shrink-0 overflow-hidden rounded-full"
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen(true);
        }}
        aria-label={`View ${alt}'s profile picture`}
      >
        <img
          src={imageSrc}
          alt={alt}
          className="block size-full min-w-0 min-h-0 object-cover"
        />
      </button>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${alt} profile picture`}
          onClick={() => setIsOpen(false)}
        >
          <div className="relative max-h-full max-w-full" onClick={(event) => event.stopPropagation()}>
            <img src={imageSrc} alt={alt} className="max-h-[85dvh] max-w-[min(90vw,700px)] rounded-lg object-contain" />
            <button
              type="button"
              className="absolute -right-2 -top-2 rounded-full bg-slate-800 p-2 text-slate-200 shadow-lg"
              onClick={() => setIsOpen(false)}
              aria-label="Close profile picture"
            >
              <XIcon className="size-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ProfilePictureViewer;
