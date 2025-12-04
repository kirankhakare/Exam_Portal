// frontend/src/student/hooks/useFullscreenProtection.js
import { useEffect, useRef } from "react";

export default function useFullscreenProtection({
  mode = "none",        // "none" | "logout" | "exam-submit"
  onLogout = null,      // function to call when we must logout (for instructions/start page)
  onExamSubmit = null,  // function to call when we must auto-submit (for exam page)
}) {
  const locked = useRef(false); // prevent multiple triggers

  useEffect(() => {
    if (mode === "none") return;

    const isFullscreen = () => {
      return !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
    };

    const enterFullscreen = () => {
      const el = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
      else if (el.msRequestFullscreen) el.msRequestFullscreen();
    };

    // Force fullscreen when hook is used
    if (!isFullscreen()) {
      enterFullscreen();
    }

    const handleFullscreenChange = () => {
      if (locked.current) return;

      // If still fullscreen, ignore
      if (isFullscreen()) return;

      // User has EXITED fullscreen
      if (mode === "logout") {
        const confirmLogout = window.confirm(
          "You exited fullscreen. You will be logged out and cannot continue the exam.\n\nDo you want to logout now?"
        );

        if (confirmLogout) {
          locked.current = true;
          if (onLogout) {
            onLogout();
          } else {
            // default behavior
            localStorage.clear();
            window.location.href = "/login";
          }
        } else {
          // User cancelled: try to re-enter fullscreen
          enterFullscreen();
        }
        return;
      }

      if (mode === "exam-submit") {
        locked.current = true;
        alert(
          "You exited fullscreen. Your exam will be auto-submitted and you will be logged out."
        );
        if (onExamSubmit) {
          onExamSubmit();
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, [mode, onLogout, onExamSubmit]);

  return {
    // If you ever want to stop reacting to fullscreen exits
    disable() {
      locked.current = true;
    },
  };
}
