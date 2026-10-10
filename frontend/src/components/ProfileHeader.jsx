import { useState, useRef } from "react";
import { LogOutIcon, PlusIcon, VolumeOffIcon, Volume2Icon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore.js";
import { useChatStore } from "../store/useChatStore.js";
import ProfilePictureViewer from "./ProfilePictureViewer";

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

function ProfileHeader() {
  const { logout, authUser, updateProfile } = useAuthStore();
  const { isSoundEnabled, toggleSound } = useChatStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  return (
    <div className="p-4 sm:p-6 border-b border-slate-700/50 shrink-0">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {/*AVATAR*/}
          <div className="avatar online relative size-14 shrink-0">
            <div className="size-14 aspect-square overflow-hidden rounded-full">
              <ProfilePictureViewer
                src={selectedImg || authUser?.profilePic}
                alt="User image"
              />
            </div>
            <button
              type="button"
              className="absolute -bottom-1 -right-3 z-10 flex size-5 items-center justify-center rounded-full border border-slate-900 bg-slate-700 text-slate-200 transition-colors hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              onClick={(event) => {
                event.stopPropagation();
                fileInputRef.current.click();
              }}
              aria-label="Change profile picture"
              title="Change profile picture"
            >
              <PlusIcon className="size-3.5" strokeWidth={2.5} />
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/*USERNAME & ONLINE TEXT*/}
          <div>
            <h3 className="text-base sm:text-lg font-medium text-slate-200 max-w-[140px] sm:max-w-[180px] truncate">
              {authUser?.fullName}
            </h3>
            <p className="text-xs text-slate-400">Online</p>
          </div>
        </div>

        {/*BUTTONS*/}
        <div className="flex gap-3 sm:gap-4 items-center shrink-0">
          {/* LOGOUT BTN*/}
          <button
            className="text-slate-400 hover:text-slate-200 transition-colors"
            onClick={logout}
          >
            <LogOutIcon className="size-5" />
          </button>

          {/*SOUND TOGGLE BTN*/}
          <button
            className="text-slate-400 hover:text-slate-200 transition-colors"
            onClick={() => {
              //play click sound before toggling
              mouseClickSound.currentTime = 0; // reset to start
              mouseClickSound
                .play()
                .catch((error) => console.log("Audio play failed: ", error));
              toggleSound();
            }}
          >
            {isSoundEnabled ? (
              <Volume2Icon className="size-5" />
            ) : (
              <VolumeOffIcon className="size-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;
