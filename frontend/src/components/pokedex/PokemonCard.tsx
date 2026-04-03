"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getPokemonTypeBadgeClasses } from "@/lib/pokemonTypeColors";

interface PokemonProps {
  name: string;
  image: string | null;
  types: string[];
}

export default function PokemonCard({ name, image, types }: PokemonProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md h-full">
      <CardHeader className="p-2 pb-1 sm:p-4 sm:pb-2">
        <CardTitle className="capitalize text-center text-xs leading-tight line-clamp-2 sm:text-lg sm:line-clamp-none">
          {name}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0 sm:p-4 flex flex-col items-center gap-2 sm:gap-4">
        <div className="relative w-18 h-18 sm:w-32 sm:h-32 shrink-0">
          {/* skeleton */}
          {isImageLoading && (
            <Skeleton className="absolute inset-0 w-full h-full rounded-full" />
          )}

          {image ? (
            <Image
              src={image}
              alt={`${name} official artwork`}
              fill
              sizes="(max-width: 640px) 25vw, 128px"
              className={`object-contain transition-opacity duration-300 ${
                isImageLoading ? "opacity-0" : "opacity-100"
              }`}
              onLoad={() => setIsImageLoading(false)}
              priority={false}
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-full text-gray-400 text-[10px] sm:text-sm text-center px-0.5">
              No Image
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
          {types.map((type) => (
            <Badge
              key={type}
              className={`capitalize text-[10px] px-1 sm:text-xs sm:px-2 ${getPokemonTypeBadgeClasses(type)}`}
            >
              {type}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}