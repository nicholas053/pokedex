import Image from "next/image";
import HeroCarousel from "@/components/pokedex/HeroCarousel";
import PokemonList from "@/components/pokedex/PokemonList";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2">
            <HeroCarousel />
          </div>

          <div className="hidden lg:flex flex-col justify-between gap-4">
            <div className="relative w-full h-[142px] rounded-lg overflow-hidden shadow-sm">
              <Image src="https://placehold.co/400x142/ffe4e1/000000?text=Static+Banner" alt="Banner 1" fill className="object-cover" unoptimized/>
            </div>
            <div className="relative w-full h-[142px] rounded-lg overflow-hidden shadow-sm">
              <Image src="https://placehold.co/400x142/ffe4e1/000000?text=Static+Banner" alt="Banner 2" fill className="object-cover" unoptimized/>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start relative">
          
          <div className="hidden lg:block sticky top-8 rounded-lg overflow-hidden shadow-sm h-[600px] relative">
             <Image src="https://placehold.co/300x600/e6f2ff/000000?text=Static+Image" alt="Left Static" fill className="object-cover" unoptimized/>
          </div>

          <div className="col-span-1 lg:col-span-2 space-y-6">
            
            <PokemonList />

          </div>

          <div className="hidden lg:block sticky top-8 rounded-lg overflow-hidden shadow-sm h-[600px] relative">
             <Image src="https://placehold.co/300x600/e6f2ff/000000?text=Static+Image" alt="Right Static" fill className="object-cover" unoptimized/>
          </div>

        </section>
      </div>
    </main>
  );
}