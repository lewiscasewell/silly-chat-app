import useMessageSubscription from "@/hooks/use-message-subscription";
import useMessages from "@/hooks/use-messages";
import { useEffect, useRef } from "react";

const Messages = () => {
  const chatEndRef = useRef<HTMLDivElement>(null);
  useMessageSubscription();

  const scrollToBottom = (behavior: "smooth" | "instant") => {
    chatEndRef.current?.scrollIntoView({ behavior });
  };
  const messagesQuery = useMessages();

  useEffect(() => {
    if (messagesQuery.data) {
      scrollToBottom("smooth");
    } else {
      scrollToBottom("instant");
    }
  }, [messagesQuery.data]);

  return (
    <div className="w-full flex justify-center top-0 h-full overflow-auto">
      <div className="max-w-2xl w-full">
        <div className="flex flex-col gap-2">
          <div className="h-20" />
          {messagesQuery.data?.length === 0 && (
            <div className="text-center text-zinc-500">
              No messages yet. Be the first to say something!
            </div>
          )}
          {messagesQuery.data?.map((msg, i) => {
            return (
              <div
                key={i}
                className="p-2 bg-gradient-to-t from-zinc-100 to-zinc-50 rounded-xl flex justify-start gap-2"
              >
                <div className="h-5 mt-1 rounded-full w-5 bg-gradient-to-tr from-cyan-300 to-pink-700" />
                <div className="">
                  <span className="text-[12px] text-zinc-600">
                    {msg.username}
                  </span>
                  <p className="text-zinc-700 text-sm">{msg.message}</p>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} className="h-20" />
        </div>
      </div>
    </div>
  );
};

export default Messages;
