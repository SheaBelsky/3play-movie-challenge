import { CastMember, Movie, MovieResult } from "src/movieTypes";
import { useReducer } from "react";

const DEFAULT_STATE = {
  error: null,
  isLoadingActors: false,
  isSearching: false,
  movieActors: [] as Array<CastMember>,
  movieActorsSelection: [] as Array<CastMember>,
  movieTitleResults: [] as Array<MovieResult>,
  movieTitleSearch: "",
  movieTitleSelection: null as Movie,
  score: 0,
};

export enum DispatchAction {
  SET_ERROR,
  SET_MOVIE_ACTOR_GUESS,
  SET_MOVIE_ACTOR_SELECTION,
  SET_MOVIE_ACTORS,
  SET_MOVIE_TITLE_RESULTS,
  SET_MOVIE_TITLE_SEARCH,
  SET_MOVIE_TITLE_SELECTION,
}

// A dispatch by the reducer can only occur with one of these kinds of actions
// matching an expected shape of data with a specific type of action
export type Action =
  | {
      data: DispatchDataActorGuess;
      type: DispatchAction.SET_MOVIE_ACTOR_GUESS;
    }
  | {
      data: DispatchDataActorSelection;
      type: DispatchAction.SET_MOVIE_ACTOR_SELECTION;
    }
  | { data: DispatchError; type: DispatchAction.SET_ERROR }
  | { data: DispatchDataActors; type: DispatchAction.SET_MOVIE_ACTORS }
  | { data: DispatchDataResults; type: DispatchAction.SET_MOVIE_TITLE_RESULTS }
  | { data: DispatchDataSearch; type: DispatchAction.SET_MOVIE_TITLE_SEARCH }
  | {
      data: DispatchDataSelection;
      type: DispatchAction.SET_MOVIE_TITLE_SELECTION;
    };

type DispatchDataActorGuess = {
  score: number;
};
type DispatchDataActorSelection = {
  movieActorToToggle: CastMember;
};
type DispatchDataActors = {
  movieActors: Array<CastMember>;
};
type DispatchDataResults = {
  movieTitleResults: Array<MovieResult>;
  movieTitleSearch: string;
};
type DispatchDataSearch = {
  isSearching?: boolean;
  movieTitleSearch: string;
};
type DispatchDataSelection = {
  isLoadingActors?: boolean;
  movieTitleSelection: MovieResult;
};
type DispatchError = {
  error: string;
};

export type State = {
  error: string;
  isLoadingActors: boolean;
  isSearching: boolean;
  movieActors: Array<CastMember>;
  movieActorsSelection: Array<CastMember>;
  movieTitleResults: Array<MovieResult>;
  movieTitleSearch: string;
  movieTitleSelection: MovieResult;
  score: number;
};

function stateReducer(state: State, action: Action) {
  switch (action.type) {
    case DispatchAction.SET_ERROR: {
      return {
        ...DEFAULT_STATE,
        error: action.data.error,
      };
    }
    case DispatchAction.SET_MOVIE_ACTOR_GUESS: {
      return {
        ...state,
        score: action.data.score,
      };
    }
    case DispatchAction.SET_MOVIE_ACTOR_SELECTION: {
      // Search the array of selected movie actors to see if the one from
      // the dispatch already exists
      const currentActorIndex = state.movieActorsSelection.findIndex(
        (actor) => actor.id === action.data.movieActorToToggle.id
      );
      const movieActorsSelectionClone = [...state.movieActorsSelection];

      // If it exists, remove it
      if (currentActorIndex !== -1) {
        movieActorsSelectionClone.splice(currentActorIndex, 1);
      }
      // If it does not exist, add it
      else {
        movieActorsSelectionClone.push(action.data.movieActorToToggle);
      }
      return {
        ...state,
        movieActorsSelection: movieActorsSelectionClone,
      };
    }
    case DispatchAction.SET_MOVIE_ACTORS: {
      return {
        ...state,
        error: null,
        isLoadingActors: false,
        movieActors: action.data.movieActors,
        score: 0,
      };
    }
    case DispatchAction.SET_MOVIE_TITLE_RESULTS: {
      return {
        ...state,
        error: null,
        isSearching: false,
        movieTitleResults: action.data.movieTitleResults,
        movieTitleSearch: action.data.movieTitleSearch,
        score: 0,
      };
    }
    case DispatchAction.SET_MOVIE_TITLE_SEARCH: {
      return {
        ...state,
        error: null,
        movieTitleSearch: action.data.movieTitleSearch,
        score: 0,
      };
    }
    case DispatchAction.SET_MOVIE_TITLE_SELECTION: {
      return {
        ...state,
        error: null,
        isLoadingActors: action.data.isLoadingActors,
        movieActors: [],
        movieTitleSelection: action.data.movieTitleSelection,
        score: 0,
      };
    }
    default: {
      return state;
    }
  }
}

export function useAppReducer() {
  return useReducer(stateReducer, DEFAULT_STATE);
}
