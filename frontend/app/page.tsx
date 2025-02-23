'use client';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ChatterBox } from "@/components/ui/chatterbox";
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  username: z.string().min(2).max(50),
  email: z.string().email(),
  hobby: z.string().min(2).max(50),
})

export default function Home() {

  // Define profile schema
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      hobby: "",
    },
  })

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    toast.success('Values has been submitted!')
  }

  return (
    <div className="w-full md:w-[50%] space-y-2 flex flex-col justify-center h-screen">
      <h1 className={"text-3xl font-bold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-red-500"}>
  Gibble AI X 11Labs Hackathon
</h1>
      <p className={"text-muted-foreground"}>
        Imagine a friendly voice that guides your users through your platform like a personal concierge. A voice that is patient, knowledgeable, and always happy to help. A voice that is your customer support agent, but also a trusted friend.
      </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem id="username">
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="shadcn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem id="email">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="mati@elevenlabs.io" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="hobby"
            render={({ field }) => (
              <FormItem id="hobby">
                <FormLabel>Hobby</FormLabel>
                <FormControl>
                  <Textarea placeholder="Watching Anime, recently watched hell's paradise." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
      <ChatterBox />
    </div>
  );
}

