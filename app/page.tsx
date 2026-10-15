'use client'

import { useState } from 'react'
import { ArrowRight, ChevronDown, Heart, Menu, Search, ShoppingBag, Star, X } from 'lucide-react'

const products = [
  { name: 'Luna Lounge Chair', price: '$680', category: 'Seating', image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=900&q=85', badge: 'Bestseller' },
  { name: 'Sol Linen Throw', price: '$145', category: 'Textiles', image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=900&q=85', badge: 'New' },
  { name: 'Forma Ceramic Vase', price: '$92', category: 'Objects', image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=85', badge: '' },
  { name: 'Arc Table Lamp', price: '$215', category: 'Lighting', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85', badge: 'New' },
]

const collections = [
  { name: 'Living', count: '24 pieces', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=85' },
  { name: 'Objects', count: '18 pieces', image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1000&q=85' },
  { name: 'Textiles', count: '12 pieces', image: 'https://images.unsplash.com/photo-1602826348456-4f7c2c2c7f2d?auto=format&fit=crop&w=1000&q=85' },
]

export default function Page() {
  const [cartCount, setCartCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('All pieces')
  const [searchOpen, setSearchOpen] = useState(false)
  const [liked, setLiked] = useState<string[]>([])

  const filtered = activeCategory === 'All pieces' ? products : products.filter((p) => p.category === activeCategory)

  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#242521]">
      <div className="bg-[#d9785c] px-6 py-2 text-center text-[11px] font-medium tracking-[0.16em] text-white uppercase">Complimentary delivery on orders over $150</div>
      <header className="relative z-20 border-b border-[#242521]/10 bg-[#f7f5f0]/95 px-5 py-5 backdrop-blur md:px-10">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between">
          <button aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 text-sm md:hidden">{menuOpen ? <X /> : <Menu />} <span>Menu</span></button>
          <a href="#" className="font-serif text-2xl tracking-[-0.05em] md:text-3xl">n/est</a>
          <nav className="hidden items-center gap-8 text-[12px] font-medium tracking-[0.08em] uppercase md:flex">
            <a href="#shop" className="hover:text-[#d9785c]">Shop</a><a href="#collections" className="hover:text-[#d9785c]">Collections</a><a href="#story" className="hover:text-[#d9785c]">Our story</a>
          </nav>
          <div className="flex items-center gap-4 text-sm"><button aria-label="Search" onClick={() => setSearchOpen(!searchOpen)}><Search /></button><button aria-label="Wishlist" className="hidden md:block"><Heart /></button><button aria-label="Shopping bag" className="flex items-center gap-1" onClick={() => setCartCount(Math.max(0, cartCount))}><ShoppingBag /><span className="text-xs">({cartCount})</span></button></div>
        </div>
        {menuOpen && <nav className="flex flex-col gap-5 border-t border-[#242521]/10 pt-6 mt-5 text-sm md:hidden"><a href="#shop">Shop all</a><a href="#collections">Collections</a><a href="#story">Our story</a></nav>}
        {searchOpen && <div className="absolute left-0 right-0 top-full border-b border-[#242521]/10 bg-[#f7f5f0] px-6 py-5"><input autoFocus placeholder="Search our collection" className="mx-auto block w-full max-w-2xl border-b border-[#242521]/40 bg-transparent py-3 font-serif text-2xl outline-none placeholder:text-[#242521]/35" /></div>}
      </header>

      <section className="mx-auto grid max-w-[1440px] gap-8 px-5 pb-16 pt-10 md:grid-cols-[1fr_1.25fr] md:items-end md:px-10 md:pb-24 md:pt-16">
        <div className="max-w-xl pb-2"><p className="mb-8 text-[11px] font-semibold tracking-[0.2em] text-[#d9785c] uppercase">Objects for everyday rituals</p><h1 className="font-serif text-[clamp(3.5rem,7vw,7.5rem)] leading-[0.88] tracking-[-0.07em]">Make room<br /><em className="font-normal">for living.</em></h1><p className="mt-8 max-w-sm text-sm leading-6 text-[#242521]/65">Thoughtful pieces for a home that feels like you. Designed slowly, made to last.</p><a href="#shop" className="mt-8 inline-flex items-center gap-3 border-b border-[#242521] pb-2 text-xs font-semibold tracking-[0.14em] uppercase">Explore the collection <ArrowRight /></a></div>
        <div className="relative overflow-hidden rounded-[2px] bg-[#d9d0c4]"><img src="/images/hero-living.png" alt="Sunlit living room with sculptural furniture" className="aspect-[1.18] w-full object-cover" /><div className="absolute bottom-5 left-5 rounded-full bg-[#f7f5f0]/85 px-4 py-2 text-[10px] tracking-[0.14em] uppercase backdrop-blur">The spring edit · 2025</div></div>
      </section>

      <section id="shop" className="border-y border-[#242521]/10 bg-[#eeeae1] px-5 py-14 md:px-10 md:py-20"><div className="mx-auto max-w-[1440px]"><div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-[10px] font-semibold tracking-[0.18em] text-[#d9785c] uppercase">Curated for you</p><h2 className="mt-3 font-serif text-4xl tracking-[-0.05em] md:text-5xl">New in the nest</h2></div><div className="flex flex-wrap gap-5 text-xs"><button onClick={() => setActiveCategory('All pieces')} className={activeCategory === 'All pieces' ? 'border-b border-[#242521] pb-1' : 'text-[#242521]/50'}>All pieces</button>{['Seating', 'Textiles', 'Objects', 'Lighting'].map((cat) => <button key={cat} onClick={() => setActiveCategory(cat)} className={activeCategory === cat ? 'border-b border-[#242521] pb-1' : 'text-[#242521]/50'}>{cat}</button>)}</div></div><div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-6">{filtered.map((product) => <article key={product.name} className="group"><div className="relative overflow-hidden bg-[#d9d0c4]"><img src={product.image} alt={product.name} className="aspect-[0.86] w-full object-cover transition duration-500 group-hover:scale-105" />{product.badge && <span className="absolute left-3 top-3 bg-[#f7f5f0] px-2 py-1 text-[9px] font-semibold tracking-[0.1em] uppercase">{product.badge}</span>}<button aria-label={`Add ${product.name} to wishlist`} onClick={() => setLiked(liked.includes(product.name) ? liked.filter((n) => n !== product.name) : [...liked, product.name])} className="absolute right-3 top-3 rounded-full bg-[#f7f5f0] p-2"><Heart className={liked.includes(product.name) ? 'fill-[#d9785c] text-[#d9785c]' : ''} /></button><button onClick={() => setCartCount(cartCount + 1)} className="absolute bottom-3 left-3 right-3 translate-y-14 bg-[#242521] py-3 text-[10px] font-semibold tracking-[0.14em] text-white uppercase transition group-hover:translate-y-0">Add to bag</button></div><div className="flex justify-between gap-3 pt-4"><div><h3 className="font-serif text-lg">{product.name}</h3><p className="mt-1 text-xs text-[#242521]/50">{product.category}</p></div><p className="text-sm">{product.price}</p></div></article>)}</div></div></section>

      <section id="collections" className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-24"><div className="mb-10 flex items-end justify-between"><div><p className="text-[10px] font-semibold tracking-[0.18em] text-[#d9785c] uppercase">Find your feeling</p><h2 className="mt-3 font-serif text-4xl tracking-[-0.05em] md:text-5xl">Shop by collection</h2></div><a href="#shop" className="hidden text-xs underline underline-offset-4 md:block">View all</a></div><div className="grid gap-5 md:grid-cols-3">{collections.map((collection) => <a href="#shop" key={collection.name} className="group relative overflow-hidden"><img src={collection.image} alt={collection.name} className="aspect-[0.8] w-full object-cover brightness-90 transition duration-500 group-hover:scale-105 group-hover:brightness-100" /><div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/60 to-transparent p-6 pt-20 text-white"><div><h3 className="font-serif text-3xl">{collection.name}</h3><p className="mt-1 text-xs text-white/75">{collection.count}</p></div><ArrowRight /></div></a>)}</div></section>

      <section id="story" className="grid bg-[#dfe2d7] md:grid-cols-2"><div className="flex flex-col justify-center px-6 py-16 md:px-20 md:py-24"><p className="text-[10px] font-semibold tracking-[0.18em] text-[#d9785c] uppercase">A slower way home</p><h2 className="mt-5 max-w-lg font-serif text-5xl leading-[0.95] tracking-[-0.06em] md:text-6xl">Objects with a point of view.</h2><p className="mt-7 max-w-md text-sm leading-6 text-[#242521]/70">We work with small workshops and independent makers to bring you pieces with a story, a soul, and a place in your everyday.</p><a href="#" className="mt-8 inline-flex items-center gap-3 text-xs font-semibold tracking-[0.14em] uppercase">Read our story <ArrowRight /></a></div><div className="min-h-[400px] bg-[url('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85')] bg-cover bg-center" role="img" aria-label="Warmly styled dining room"></div></section>

      <footer className="bg-[#242521] px-5 py-12 text-[#f7f5f0] md:px-10 md:py-16"><div className="mx-auto grid max-w-[1440px] gap-12 md:grid-cols-[1.4fr_1fr_1fr_1.4fr]"><div><div className="font-serif text-3xl">n/est</div><p className="mt-4 max-w-xs text-sm leading-6 text-white/55">Considered objects for a more considered life.</p></div><div><p className="mb-5 text-[10px] tracking-[0.16em] text-white/45 uppercase">Explore</p><div className="flex flex-col gap-3 text-sm"><a href="#shop">Shop all</a><a href="#collections">Collections</a><a href="#story">Our story</a></div></div><div><p className="mb-5 text-[10px] tracking-[0.16em] text-white/45 uppercase">Help</p><div className="flex flex-col gap-3 text-sm"><a href="#">Shipping & returns</a><a href="#">Contact</a><a href="#">FAQ</a></div></div><div><p className="mb-5 text-[10px] tracking-[0.16em] text-white/45 uppercase">Stay in the know</p><p className="mb-4 text-sm text-white/55">Notes on living well, sent occasionally.</p><div className="flex border-b border-white/40 pb-2"><input placeholder="Your email address" className="w-full bg-transparent text-sm outline-none placeholder:text-white/40" /><button aria-label="Subscribe"><ArrowRight /></button></div></div></div><div className="mx-auto mt-16 max-w-[1440px] border-t border-white/15 pt-5 text-[10px] tracking-[0.1em] text-white/40 uppercase"><span>© 2025 n/est studio</span></div></footer>
    </main>
  )
}
