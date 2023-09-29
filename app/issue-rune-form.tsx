"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"

const FormSchema = z.object({
  symbol: z
    .string()
    .min(1, {
      message: "Symbol must be at least 1 characters.",
    })
    .refine((value) => /^[A-Z]+$/.test(value), "The only valid characters are A through Z."),
  source: z
    .string()
    .min(14, {
      message: "Bitcoin addresses are at least 14 characters.",
    })
    .refine((value) => /^[13|bc1][a-km-zA-HJ-NP-Z1-9]{25,87}$/.test(value), "Not a valid bitcoin address."),
  destination: z
    .string()
    .min(14, {
      message: "Bitcoin addresses are at least 14 characters.",
    })
    .refine((value) => /^[13|bc1][a-km-zA-HJ-NP-Z1-9]{13,87}$/.test(value), "Not a valid bitcoin address."),
})

export default function IssueRuneForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      symbol: "",
      source: "",
      destination: "",
    },
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log("here")
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[330px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="symbol"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Symbol</FormLabel>
              <FormControl>
                <Input placeholder="SYMBL" {...field} />
              </FormControl>
              <FormDescription>
                Symbols consist of uppercase letters. Make sure it&apos;s not issued previously.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="source"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source address</FormLabel>
              <FormControl>
                <Input placeholder="bc123...56789" {...field} />
              </FormControl>
              <FormDescription>
                Your address that holds some bitcoin and can sign raw transactions.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="destination"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destination address</FormLabel>
              <FormControl>
                <Input placeholder="bc123...56789" {...field} />
              </FormControl>
              <FormDescription>
                An address that you won&apos;t use until a Rune implementation exists.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Issue</Button>
      </form>
    </Form>
  )
}
