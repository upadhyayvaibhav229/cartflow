'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function CheckoutPage() {
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fbfaf6] px-5 text-[#26352d]">
        <section className="w-full max-w-lg border border-[#26352d]/15 bg-[#f0eee6] p-8 text-center md:p-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a56f55]">Order received</p>
          <h1 className="mt-4 font-serif text-5xl tracking-[-0.06em]">Thank you.</h1>
          <p className="mx-auto mt-5 max-w-sm text-sm leading-6 text-[#26352d]/65">Your frontend checkout is complete. Payment processing can be connected when you are ready to accept live orders.</p>
          <Link href="/" className="mt-8 inline-flex bg-[#26352d] px-8 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-white">Continue shopping</Link>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#fbfaf6] text-[#26352d]">
      <header className="border-b border-[#26352d]/10 px-5 py-6 md:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="font-serif text-3xl tracking-[-0.06em]">morrow</Link>
          <Link href="/" className="text-xs font-semibold uppercase tracking-[0.14em]">Back to shop</Link>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 md:grid-cols-[1.15fr_0.85fr] md:px-10 md:py-16">
        <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true) }} className="flex flex-col gap-8">
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a56f55]">Secure checkout</p><h1 className="mt-3 font-serif text-5xl tracking-[-0.06em]">Complete your order</h1></div>
          <fieldset className="flex flex-col gap-4"><legend className="mb-1 font-serif text-2xl">Contact information</legend><input required type="email" placeholder="Email address" aria-label="Email address" className="border border-[#26352d]/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-[#26352d]" /><input required type="tel" placeholder="Phone number" aria-label="Phone number" className="border border-[#26352d]/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-[#26352d]" /></fieldset>
          <fieldset className="flex flex-col gap-4"><legend className="mb-1 font-serif text-2xl">Shipping address</legend><div className="grid gap-4 sm:grid-cols-2"><input required placeholder="First name" aria-label="First name" className="border border-[#26352d]/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-[#26352d]" /><input required placeholder="Last name" aria-label="Last name" className="border border-[#26352d]/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-[#26352d]" /></div><input required placeholder="Address" aria-label="Address" className="border border-[#26352d]/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-[#26352d]" /><div className="grid gap-4 sm:grid-cols-3"><input required placeholder="City" aria-label="City" className="border border-[#26352d]/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-[#26352d]" /><input required placeholder="State" aria-label="State" className="border border-[#26352d]/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-[#26352d]" /><input required placeholder="ZIP code" aria-label="ZIP code" className="border border-[#26352d]/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-[#26352d]" /></div></fieldset>
          <fieldset className="flex flex-col gap-4"><legend className="mb-1 font-serif text-2xl">Payment</legend><input required placeholder="Card number" aria-label="Card number" inputMode="numeric" className="border border-[#26352d]/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-[#26352d]" /><div className="grid gap-4 sm:grid-cols-2"><input required placeholder="MM / YY" aria-label="Expiration date" className="border border-[#26352d]/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-[#26352d]" /><input required placeholder="CVC" aria-label="CVC" inputMode="numeric" className="border border-[#26352d]/20 bg-transparent px-4 py-3 text-sm outline-none focus:border-[#26352d]" /></div></fieldset>
          <button type="submit" className="bg-[#26352d] px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-white">Place order</button>
        </form>
        <aside className="h-fit bg-[#f0eee6] p-6 md:sticky md:top-6 md:p-8"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a56f55]">Your order</p><div className="mt-6 flex items-center justify-between border-b border-[#26352d]/15 pb-5"><div><p className="font-serif text-xl">Dew Drop Serum</p><p className="mt-1 text-xs text-[#26352d]/55">1 × $42</p></div><span className="text-sm">$42</span></div><div className="flex justify-between py-5 text-sm text-[#26352d]/65"><span>Shipping</span><span>Free</span></div><div className="flex justify-between border-t border-[#26352d]/15 pt-5 font-serif text-2xl"><span>Total</span><span>$42</span></div></aside>
      </div>
    </main>
  )
}
