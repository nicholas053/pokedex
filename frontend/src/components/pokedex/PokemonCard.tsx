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
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="capitalize text-lg text-center">{name}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex flex-col items-center gap-4">
        <div className="relative w-32 h-32">
          {/* skeleton */}
          {isImageLoading && (
            <Skeleton className="absolute inset-0 w-full h-full rounded-full" />
          )}
          
          {image ? (
            <Image
              src={image}
              alt={`${name} official artwork`}
              fill
              sizes="(max-width: 768px) 100vw, 128px"
              className={`object-contain transition-opacity duration-300 ${
                isImageLoading ? "opacity-0" : "opacity-100"
              }`}
              onLoad={() => setIsImageLoading(false)}
              priority={false}
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-full text-gray-400 text-sm">
              No Image
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {types.map((type) => (
            <Badge key={type} className={`capitalize ${getPokemonTypeBadgeClasses(type)}`}>
              {type}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}