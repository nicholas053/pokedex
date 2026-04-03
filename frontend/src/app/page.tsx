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
              <Image
                src="/images/top_side_banner_1.jpg"
                alt="Promotional banner"
                fill
                sizes="(max-width: 1400px) 33vw, 400px"
                className="object-cover"
              />
            </div>
            <div className="relative w-full h-[142px] rounded-lg overflow-hidden shadow-sm">
              <Image
                src="/images/top_side_banner_2.jpg"
                alt="Promotional banner"
                fill
                sizes="(max-width: 1400px) 33vw, 400px"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start relative">
          
          <div className="hidden lg:block sticky top-8 rounded-lg overflow-hidden shadow-sm h-[600px]">
            <Image
              src="/images/side_sticky_banner.jpg"
              alt="Side banner"
              fill
              sizes="300px"
              className="object-cover"
            />
          </div>

          <div className="col-span-1 lg:col-span-2 space-y-6">
            
            <PokemonList />

          </div>

          <div className="hidden lg:block sticky top-8 rounded-lg overflow-hidden shadow-sm h-[600px]">
            <Image
              src="/images/side_sticky_banner.jpg"
              alt="Side banner"
              fill
              sizes="300px"
              className="object-cover"
            />
          </div>

        </section>
      </div>
    </main>
  );
}