"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import useSWRInfinite from "swr/infinite";
import { useInView } from "react-intersection-observer";
import { ChevronDown, X } from "lucide-react";
import PokemonCard from "./PokemonCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetcher } from "@/lib/fetcher";
import { POKEMON_API_FILTER_TYPES } from "@/lib/pokemonTypeColors";
import { cn } from "@/lib/utils";

interface Pokemon {
  name: string;
  image: string | null;
  types: string[];
}

function formatTypeLabel(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function PokemonList() {
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [typesMenuOpen, setTypesMenuOpen] = useState(false);
  const typesMenuRef = useRef<HTMLDivElement>(null);
  const { ref, inView } = useInView();

  const LIMIT = 15;

  const typesParam = useMemo(
    () => [...selectedTypes].sort((a, b) => a.localeCompare(b)).join(","),
    [selectedTypes]
  );

  const filterKey = useMemo(() => `${search}\n${typesParam}`, [search, typesParam]);

  const getKey = useCallback(
    (pageIndex: number, previousPageData: Pokemon[]) => {
      if (previousPageData && previousPageData.length < LIMIT) return null;

      const params = new URLSearchParams({
        page: (pageIndex + 1).toString(),
        limit: LIMIT.toString(),
      });

      if (search.trim()) params.append("search", search.trim());
      if (typesParam) params.append("types", typesParam);

      return `${process.env.NEXT_PUBLIC_API_URL}/pokemons?${params.toString()}`;
    },
    [search, typesParam]
  );

  const { data, error, size, setSize, isValidating } = useSWRInfinite<Pokemon[]>(
    getKey,
    fetcher
  );

  useEffect(() => {
    setSize(1);
  }, [filterKey, setSize]);

  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (
        typesMenuRef.current &&
        !typesMenuRef.current.contains(e.target as Node)
      ) {
        setTypesMenuOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const toggleType = (slug: string) => {
    setSelectedTypes((prev) =>
      prev.includes(slug) ? prev.filter((t) => t !== slug) : [...prev, slug]
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedTypes([]);
    setTypesMenuOpen(false);
  };

  const hasActiveFilters =
    search.trim().length > 0 || selectedTypes.length > 0;

  const isLoadingInitialData = !data && !error;
  const isLoadingMore =
    isLoadingInitialData || (size > 0 && data && typeof data[size - 1] === "undefined");

  const isEmpty = data?.[0]?.length === 0;
  const isReachingEnd =
    isEmpty ||
    (data && data[data.length - 1] && data[data.length - 1].length < LIMIT) ||
    (data && !Array.isArray(data[data.length - 1]));

  const pokemons = data ? data.filter(Array.isArray).flat() : [];

  useEffect(() => {
    if (inView && !isReachingEnd && !isLoadingMore && !isValidating) {
      setSize(size + 1);
    }
  }, [inView, isReachingEnd, isLoadingMore, isValidating, size, setSize]);

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search Pokémon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="grow min-w-0"
            aria-label="Search Pokémon by name"
          />

          <div className="relative shrink-0" ref={typesMenuRef}>
            <Button
              type="button"
              variant="outline"
              aria-expanded={typesMenuOpen}
              aria-haspopup="listbox"
              className="w-full sm:w-[220px] justify-between font-normal"
              onClick={() => setTypesMenuOpen((o) => !o)}
            >
              <span className="truncate text-left">
                {selectedTypes.length === 0
                  ? "All types"
                  : `${selectedTypes.length} type${selectedTypes.length === 1 ? "" : "s"}`}
              </span>
              <ChevronDown
                className={cn(
                  "size-4 opacity-60 transition-transform",
                  typesMenuOpen && "rotate-180"
                )}
              />
            </Button>

            {typesMenuOpen && (
              <div
                className="absolute right-0 z-50 mt-1 max-h-72 w-full min-w-[260px] overflow-auto rounded-md border border-input bg-popover p-2 shadow-md sm:left-0"
                role="listbox"
                aria-multiselectable="true"
              >
                <p className="px-2 pb-2 text-xs text-muted-foreground">
                  Pokémon must have every selected type (dual-type match).
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {POKEMON_API_FILTER_TYPES.map((slug) => {
                    const checked = selectedTypes.includes(slug);
                    return (
                      <label
                        key={slug}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted",
                          checked && "bg-muted"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleType(slug)}
                          className="size-3.5 rounded border-input accent-primary"
                        />
                        <span>{formatTypeLabel(slug)}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            className="shrink-0 gap-1.5 sm:ml-auto"
            disabled={!hasActiveFilters}
            onClick={clearFilters}
          >
            <X className="size-4" />
            Clear
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-4">
        {pokemons.map((pokemon, index) => (
          <PokemonCard
            key={`${pokemon.name}-${index}`}
            name={pokemon.name}
            image={pokemon.image}
            types={pokemon.types}
          />
        ))}
      </div>

      <div ref={ref} className="py-8 flex justify-center items-center">
        {isValidating && (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        )}
        {isReachingEnd && !isEmpty && (
          <p className="text-gray-500">You have caught them all!</p>
        )}
        {isEmpty && !isValidating && (
          <p className="text-gray-500">No Pokémon found.</p>
        )}
      </div>
    </div>
  );
}
