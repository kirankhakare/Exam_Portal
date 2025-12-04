// frontend/src/student/hooks/useAntiCheat.js
import { useEffect } from "react";

export default function useAntiCheat(activeRef, handleSubmit) {
  /** ========================
   *  BLOCK BACK NAVIGATION
   ======================== */
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const blockBack = () => {
      if (!activeRef.current) return;
      alert("❌ Back navigation is blocked during exam.");
      window.history.go(1);
    };

    window.onpopstate = blockBack;

    return () => {
      window.onpopstate = null;
    };
  }, [activeRef]);


  /** ========================
   *  BLOCK REFRESH / CLOSE
   ======================== */
  useEffect(() => {
    const beforeUnload = (e) => {
      if (!activeRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [activeRef]);


  /** ========================
   *  DEVTOOLS DETECTION
   ======================== */
  useEffect(() => {
    const detectDevTools = (e) => {
      if (!activeRef.current) return;

      const invalid =
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "J", "U", "C"].includes(e.key));

      if (invalid) {
        alert("❌ DevTools detected. Submitting exam.");
        handleSubmit();
      }
    };

    document.addEventListener("keydown", detectDevTools);
    return () => document.removeEventListener("keydown", detectDevTools);
  }, [activeRef, handleSubmit]);


  /** ========================
   *  TAB SWITCH / MINIMIZE
   *  (any visibility loss → auto submit)
   ======================== */
  useEffect(() => {
    let timer = null;

    const handleVisibility = () => {
      if (!activeRef.current) return;

      if (document.hidden) {
        timer = setTimeout(() => {
          if (document.hidden && activeRef.current) {
            alert("❌ Tab switch / window change detected. Exam submitting...");
            handleSubmit();
          }
        }, 700); // small delay to avoid accidental flicker
      } else {
        if (timer) clearTimeout(timer);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [activeRef, handleSubmit]);


  /** ========================
   *  BLOCK KEYS
   *  (ESC / F5 / F11 / CTRL+R / BACKSPACE for navigation)
   ======================== */
  useEffect(() => {
    const keyBlock = (e) => {
      if (!activeRef.current) return;

      const target = e.target;
      const isInputField =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Backspace: allow inside input/textarea; block otherwise
      if (e.key === "Backspace" && !isInputField) {
        e.preventDefault();
        return;
      }

      // Block Esc, F5, F11
      if (["Escape", "F5", "F11"].includes(e.key)) {
        e.preventDefault();
        return;
      }

      // Ctrl+R or Cmd+R
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "r") {
        e.preventDefault();
        return;
      }
    };

    window.addEventListener("keydown", keyBlock);
    return () => window.removeEventListener("keydown", keyBlock);
  }, [activeRef]);
}
