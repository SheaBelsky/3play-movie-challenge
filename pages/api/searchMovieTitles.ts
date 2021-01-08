import type { ApiSearchResponse, Movie } from "../../src/movieTypes";
import type { NextApiRequest, NextApiResponse } from "next";

type RequestData = {
  requestedMovieTitle?: string;
};

type ResponseError = {
  error: string;
};

type ResponseData = {
  movies: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ResponseError>
) {
  const { requestedMovieTitle } = JSON.parse(req.body) as RequestData;
  if (!requestedMovieTitle) {
    res.statusCode = 400;
    return res.json({ error: "No movie name was provided!" });
  }

  // Make request to the Movie API
  const movieApiResponse = await fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIEDB_API_KEY}&query=${requestedMovieTitle}`
  );
  const parsedResponse = (await movieApiResponse.json()) as ApiSearchResponse;
  if (!Array.isArray(parsedResponse.results)) {
    res.statusCode = 500;
    return res.json({ error: "The search could not be completed." });
  }
  const movies = parsedResponse.results.map((result: Movie) => ({
    id: result.id,
    title: result.title,
  }));
  res.statusCode = 200;
  return res.json({ movies: JSON.stringify(movies) });
}
