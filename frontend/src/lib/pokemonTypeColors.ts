export const POKEMON_TYPE_BADGE_CLASSES: Record<string, string> = {
  normal: "bg-stone-400 hover:bg-stone-500 text-stone-950",
  fire: "bg-orange-500 hover:bg-orange-600",
  water: "bg-blue-500 hover:bg-blue-600",
  electric: "bg-yellow-400 hover:bg-yellow-500 text-neutral-900",
  grass: "bg-green-500 hover:bg-green-600",
  ice: "bg-cyan-400 hover:bg-cyan-500 text-neutral-900",
  fighting: "bg-red-700 hover:bg-red-800",
  poison: "bg-purple-500 hover:bg-purple-600",
  ground: "bg-amber-600 hover:bg-amber-700",
  flying: "bg-indigo-400 hover:bg-indigo-500",
  psychic: "bg-pink-500 hover:bg-pink-600",
  bug: "bg-lime-600 hover:bg-lime-700",
  rock: "bg-yellow-700 hover:bg-yellow-800",
  ghost: "bg-violet-600 hover:bg-violet-700",
  dragon: "bg-purple-700 hover:bg-purple-800",
  dark: "bg-neutral-700 hover:bg-neutral-800",
  steel: "bg-slate-400 hover:bg-slate-500 text-neutral-900",
  fairy: "bg-rose-300 hover:bg-rose-400 text-neutral-900",
  stellar: "bg-sky-400 hover:bg-sky-500 text-neutral-900",
  unknown: "bg-gray-500 hover:bg-gray-600",
};

/** PokeAPI `/type/{name}` slugs for filters (excludes non-API types like `unknown`). */
const FILTER_TYPE_EXCLUDE = new Set(["unknown", "stellar"]);

export const POKEMON_API_FILTER_TYPES: readonly string[] = Object.keys(
  POKEMON_TYPE_BADGE_CLASSES
)
  .filter((slug) => !FILTER_TYPE_EXCLUDE.has(slug))
  .sort((a, b) => a.localeCompare(b));

const DEFAULT_TYPE_BADGE_CLASSES = "bg-gray-500 hover:bg-gray-600";

export function getPokemonTypeBadgeClasses(type: string): string {
  const key = type.trim().toLowerCase();
  return POKEMON_TYPE_BADGE_CLASSES[key] ?? DEFAULT_TYPE_BADGE_CLASSES;
}
