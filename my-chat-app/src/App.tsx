import apiClient from "./api/apiClient";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { AuthProvider, useAuth } from "./hooks/auth";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./components/ui/input";
import useSignIn from "./hooks/use-sign-in";
import Messages from "./features/messages/Messages";
import ActiveUsers from "./features/active-users/ActiveUsers";
import SignUp from "./features/signup/SignUp";
import MessageInput from "./features/messages/MessageInput";

const formSchema = z.object({
  username: z.string(),
  password: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

function InnerApp() {
  const auth = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const signInMutation = useSignIn();
  const logout = async () => {
    await apiClient.post("logout");
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    signInMutation.mutate(data);
  };

  return (
    <div className="w-[100w] h-[100vh]">
      {auth.isLoading ? (
        <div>loading</div>
      ) : (
        <nav className="flex justify-between items-center p-2 absolute w-full top-0 backdrop-blur-md">
          <h1 className="font-black">The Group Chat</h1>

          <div className="flex gap-2">
            <ActiveUsers />
            {auth.isAuthenticated ? (
              <Button onClick={logout}>Log out</Button>
            ) : (
              <div>
                <Dialog>
                  <div className="flex gap-2">
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => setActiveTab("login")}
                        variant="secondary"
                      >
                        Log in
                      </Button>
                    </DialogTrigger>
                    <DialogTrigger asChild>
                      <Button onClick={() => setActiveTab("signup")}>
                        Sign up
                      </Button>
                    </DialogTrigger>
                  </div>
                  <DialogContent>
                    <Tabs defaultValue={activeTab} className="w-[400px]">
                      <TabsList>
                        <TabsTrigger value="login">Login</TabsTrigger>
                        <TabsTrigger value="signup">Sign up</TabsTrigger>
                      </TabsList>
                      <TabsContent value="login">
                        <Form {...form}>
                          <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                          >
                            <FormField
                              control={form.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Username</FormLabel>
                                  <FormControl>
                                    <Input placeholder="shadcn" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    This is your public display name.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Password</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="password" />
                                  </FormControl>

                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button type="submit">Submit</Button>
                          </form>
                        </Form>
                      </TabsContent>
                      <TabsContent value="signup">
                        <DialogTitle>Sign up</DialogTitle>
                        <DialogDescription>
                          Create a new account
                        </DialogDescription>
                        <SignUp />
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </nav>
      )}
      <Messages />

      <div className="flex absolute bottom-0 w-full pb-4 pt-2 bg-gradient-to-t from-white to-white/0 justify-center">
        <div className="max-w-2xl w-full">
          <MessageInput />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  );
}

export default App;
