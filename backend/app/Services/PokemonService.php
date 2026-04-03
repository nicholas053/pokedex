<?php

namespace App\Services;

use Illuminate\Http\Client\Pool;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class PokemonService
{
    private const CACHE_TTL_SECONDS = 86400;

    private const INDEX_LIMIT = 10240;

    private const CACHE_KEY_ALL_INDEX = 'pokeapi:all_pokemon_index';

    private function typeCacheKey(string $type): string
    {
        return 'pokeapi:type_species:'.strtolower($type);
    }

    /**
     * @param  array<int, string>  $types  When multiple types are given, Pokémon must include every type (dual-type AND).
     * @return array{data: array<int, mixed>, status: int}|array{error: string, status: int}
     */
    public function getPokemons(int $page = 1, int $limit = 15, ?string $search = null, array $types = [])
    {
        $types = array_values(array_unique(array_filter(array_map(
            fn ($t) => strtolower((string) $t),
            $types
        ))));

        try {
            if ($types !== []) {
                $pokemonList = $this->pokemonListForTypes($types);
                if (isset($pokemonList['error'])) {
                    return $pokemonList;
                }
                $pokemonList = $pokemonList['list'];
            } else {
                $pokemonList = collect($this->allPokemonIndex());
            }
        } catch (RuntimeException $e) {
            return ['error' => 'Unable to reach Pokémon data source', 'status' => 502];
        }

        $needle = $search !== null ? strtolower(trim($search)) : '';
        if ($needle !== '') {
            $pokemonList = $pokemonList->filter(
                fn ($pokemon) => str_contains(strtolower($pokemon['name']), $needle)
            );
        }

        $paginatedList = $pokemonList->slice(($page - 1) * $limit, $limit)->values();

        $responses = Http::pool(function (Pool $pool) use ($paginatedList) {
            return $paginatedList->map(function ($pokemon) use ($pool) {
                return $pool->get($pokemon['url']);
            });
        });

        $formattedData = [];
        foreach ($responses as $response) {
            if ($response instanceof \Illuminate\Http\Client\Response && $response->ok()) {
                $data = $response->json();
                $formattedData[] = [
                    'name' => $data['name'],
                    'image' => $data['sprites']['other']['official-artwork']['front_default'] ?? null,
                    'types' => collect($data['types'])->pluck('type.name')->toArray(),
                    'height' => $data['height'],
                    'weight' => $data['weight'],
                ];
            }
        }

        return ['data' => $formattedData, 'status' => 200];
    }

    /**
     * @return array<int, array{name: string, url: string}>
     */
    private function allPokemonIndex(): array
    {
        return Cache::remember(self::CACHE_KEY_ALL_INDEX, self::CACHE_TTL_SECONDS, function () {
            $response = Http::timeout(60)
                ->connectTimeout(15)
                ->retry(2, 250, null, false)
                ->get('https://pokeapi.co/api/v2/pokemon?limit='.self::INDEX_LIMIT);

            if (! $response->successful()) {
                throw new RuntimeException('PokeAPI species index request failed');
            }

            $results = $response->json()['results'] ?? [];
            if (! is_array($results) || $results === []) {
                throw new RuntimeException('PokeAPI returned an empty species index');
            }

            return $results;
        });
    }

    /**
     * Cached species entries for one type: [['name' =>, 'url' =>], ...].
     * Returns false when PokeAPI responds 404 (invalid type); that outcome is cached briefly to avoid hammering the API.
     *
     * @return array<int, array{name: string, url: string}>|false
     */
    private function cachedSpeciesForType(string $type): array|false
    {
        return Cache::remember($this->typeCacheKey($type), self::CACHE_TTL_SECONDS, function () use ($type) {
            $response = Http::timeout(45)
                ->connectTimeout(10)
                ->retry(2, 200, null, false)
                ->get('https://pokeapi.co/api/v2/type/'.$type);

            if ($response->status() === 404) {
                return false;
            }

            if (! $response->successful()) {
                throw new RuntimeException('PokeAPI type request failed');
            }

            $entries = $response->json()['pokemon'] ?? [];

            return collect($entries)
                ->pluck('pokemon')
                ->map(fn ($p) => ['name' => $p['name'], 'url' => $p['url']])
                ->all();
        });
    }

    /**
     * @param  array<int, string>  $types
     * @return array{list: Collection<int, array{name: string, url: string}>}|array{error: string, status: int}
     */
    private function pokemonListForTypes(array $types): array
    {
        $speciesLists = [];

        foreach ($types as $type) {
            $species = $this->cachedSpeciesForType($type);
            if ($species === false) {
                return ['error' => 'Invalid type provided', 'status' => 400];
            }
            $speciesLists[] = collect($species);
        }

        if (count($speciesLists) === 1) {
            return ['list' => $speciesLists[0]->values()];
        }

        $nameSets = array_map(fn (Collection $c) => $c->pluck('name'), $speciesLists);
        $commonNames = $nameSets[0];
        for ($i = 1, $c = count($nameSets); $i < $c; $i++) {
            $commonNames = $commonNames->intersect($nameSets[$i]);
        }

        $list = $speciesLists[0]
            ->filter(fn ($row) => $commonNames->contains($row['name']))
            ->values();

        return ['list' => $list];
    }
}
