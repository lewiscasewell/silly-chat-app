import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/auth";
import useSendMessage from "@/hooks/use-send-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const MessageInput = () => {
  const auth = useAuth();
  const sendMessage = useSendMessage();

  const messageSchema = z.object({ message: z.string().max(140).min(1) });

  const form = useForm({
    defaultValues: {
      message: "",
    },
    resolver: zodResolver(messageSchema),
  });

  const onSubmit = (data: z.infer<typeof messageSchema>) => {
    sendMessage.mutate(
      { message: data.message },
      {
        onSuccess: () => {
          form.reset();
        },
      }
    );
  };

  return (
    <div>
      <form
        className="flex gap-1"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(onSubmit)();
        }}
      >
        <Controller
          control={form.control}
          name="message"
          render={({ field }) => (
            <Input
              onClick={() => {
                if (!auth.isAuthenticated) {
                  alert("You need to be logged in to send messages");
                }
              }}
              {...field}
              placeholder="Type your message"
              className="bg-white"
            />
          )}
        />
        <Button type="submit">Send</Button>
      </form>
      <span className="text-[10px] p-1">
        Messages will be deleted after 24hrs.
      </span>
    </div>
  );
};

export default MessageInput;
