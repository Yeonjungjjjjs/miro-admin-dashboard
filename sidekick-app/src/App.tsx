import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatPanel } from "./components/ChatPanel";
import { useAgent } from "./hooks/useAgent";
import "./index.css";

const PANEL_WIDTH = 360;

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, append, isLoading, setMessages } = useAgent();
  const panelRef = useRef<HTMLDivElement>(null);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  useEffect(() => {
    (window as any).AdminSidekick = { open, close, toggle };

    const onOpen = () => open();
    const onClose = () => close();
    const onToggle = () => toggle();

    window.addEventListener("sidekick:open", onOpen);
    window.addEventListener("sidekick:close", onClose);
    window.addEventListener("sidekick:toggle", onToggle);

    return () => {
      window.removeEventListener("sidekick:open", onOpen);
      window.removeEventListener("sidekick:close", onClose);
      window.removeEventListener("sidekick:toggle", onToggle);
    };
  }, [open, close, toggle]);

  useEffect(() => {
    const trigger = document.getElementById("sidekick-trigger");
    if (trigger) {
      trigger.classList.toggle("active", isOpen);
    }
    document.body.classList.toggle("sidekick-open", isOpen);
  }, [isOpen]);

  const handleSubmit = useCallback(
    (text: string) => {
      append({ role: "user", content: text });
      setInput("");
    },
    [append]
  );

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setInput("");
  }, [setMessages]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Transparent click-away backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={close}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9998,
            }}
          />

          {/* Sidekick panel — positioned below header, flush right */}
          <motion.div
            ref={panelRef}
            initial={{ x: PANEL_WIDTH, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: PANEL_WIDTH, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            style={{
              position: "fixed",
              top: 56,
              right: 0,
              bottom: 0,
              width: PANEL_WIDTH,
              zIndex: 9999,
              borderRadius: 8,
              overflow: "hidden",
              background: "white",
            }}
          >
            <ChatPanel
              onClose={close}
              onCollapse={close}
              onNewChat={handleNewChat}
              messages={messages}
              input={input}
              setInput={setInput}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              isVisible={isOpen}
              voiceState="idle"
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
