<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\PokemonService;

class PokemonController extends Controller
{
    protected $pokemonService;

    public function __construct(PokemonService $pokemonService)
    {
        $this->pokemonService = $pokemonService;
    }

    public function index(Request $request)
    {
        // base requirements
        $limit = $request->query('limit', 15);
        $page = $request->query('page', 1);

        $search = $request->query('search');

        $types = [];
        $typesQuery = $request->query('types');
        if (is_array($typesQuery)) {
            $types = array_values(array_unique(array_filter(array_map('trim', $typesQuery))));
        } elseif (is_string($typesQuery) && $typesQuery !== '') {
            $types = array_values(array_unique(array_filter(array_map('trim', explode(',', $typesQuery)))));
        }
        $legacyType = $request->query('type');
        if ($types === [] && is_string($legacyType) && $legacyType !== '') {
            $types = [trim($legacyType)];
        }

        $result = $this->pokemonService->getPokemons($page, $limit, $search, $types);

        if (isset($result['error'])) {
            return response()->json(['error' => $result['error']], $result['status']);
        }

        return response()->json($result['data']);
    }
}
