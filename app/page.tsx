import Image from 'next/image'
import IssueRuneForm from './issue-rune-form'
import { Component1Icon } from '@radix-ui/react-icons'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between py-16 bg-gray-50">
      <div className="z-10 max-w-5xl w-full items-center justify-between text-sm">
        <div className="fixed bottom-0 left-0 flex h-28 w-full items-end justify-center bg-gradient-to-t from-gray-200 via-gray-200">
          <p className='flex place-items-center gap-1 pb-4 text-gray-600 lg:pointer-events-auto'>
            <span className="pointer-events-none">An</span>
            <a
              href="https://ordinals.neu.fi"
              target="_blank"
            >
              <span className="underline">Ordinals Lab</span>
            </a>
            <span className="pointer-events-none">experiment</span>
          </p>
        </div>
      </div>

      <div className="relative flex place-items-center">
        <Component1Icon className='scale-[4] ml-5 mr-8'/>
        <p className='text-5xl font-medium align-top'>Runes Zone</p>
      </div>

      <div className='my-12 py-6 px-4 w-full max-w-lg'>
        <Card>
          <CardHeader>
            <CardTitle>Issue a Rune token</CardTitle>
            <CardDescription>
              Most likely, these artifacts will not have any value.
              Use at your own risk after reading the <a href="https://x.com" className='underline text-black'>docs</a>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IssueRuneForm/>
          </CardContent>
        </Card>
      </div>

      <div className="mb-32 grid text-center gap-6 lg:pb-24 lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left">
        <a
          href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent p-5 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Docs{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Find information about Runes, how this app works and the next steps.
          </p>
        </a>

        <a
          href="https://rodarmor.com/blog/runes/"
          className="group rounded-lg border border-transparent p-5 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Casey&apos;s Blog Post{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            The original blog post that described a possible idea for Rune protocol.
          </p>
        </a>

        <a
          href="https://geniidata.com/user/poshi/rune-index"
          className="group rounded-lg border border-transparent p-5 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Poshi&apos;s Rune Index{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            An explorer for Runes as understood by Poshi. This app is compatible with it.
          </p>
        </a>
      </div>
    </main>
  )
}
