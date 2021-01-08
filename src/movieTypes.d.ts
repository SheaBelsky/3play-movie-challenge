// Shared TypeScript types on movies for the frontend and backend
export type ApiActorResponse = {
  id: number;
  cast: CastMember[];
};

export type ApiSearchResponse = {
  page: number;
  results: Movie[];
};

export type CastMember = {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string;
  cast_id: number;
  character: string;
  id: string;
  order: number;
  originalMovieId?: number;
};

export type Movie = {
  adult: boolean;
  backdrop_path: "string";
  genre_ids: Array<any>;
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
};

type MovieResult = { id: number; title: string };
