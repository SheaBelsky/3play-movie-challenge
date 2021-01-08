import type { ApiActorResponse, CastMember } from "../../src/movieTypes";
import type { NextApiRequest, NextApiResponse } from "next";

type RandomPerson = {
  name: { first: string; last: string };
  picture: {
    large: string;
    medium: string;
    thumbnail: string;
  };
};

type RandomPeopleResponse = {
  results: Array<RandomPerson>;
};

type RequestData = {
  movieId?: string;
};

type ResponseError = {
  error: string;
};

type ResponseData = {
  cast: string;
};

function shuffleArray(array: Array<any>): Array<any> {
  const arrayClone = [...array];
  for (let i = arrayClone.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arrayClone[i];
    arrayClone[i] = arrayClone[j];
    arrayClone[j] = temp;
  }
  return arrayClone;
}

async function getMovieActors(movieId: number) {
  const movieApiResponse = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${process.env.MOVIEDB_API_KEY}`
  );
  const parsedResponse = (await movieApiResponse.json()) as ApiActorResponse;
  return parsedResponse.cast;
}

async function getRandomPeople() {
  const randomPeopleResponse = await fetch(
    "https://randomuser.me/api/?results=2"
  );
  const parsedResponse = (await randomPeopleResponse.json()) as RandomPeopleResponse;
  return parsedResponse.results;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ResponseError>
) {
  const { movieId } = JSON.parse(req.body) as RequestData;
  if (!movieId) {
    res.statusCode = 400;
    return res.json({ error: "No movie ID was provided!" });
  }

  const parsedMovieId = parseInt(movieId);

  // Make request to the Movie API
  // eslint-disable-next-line prefer-const
  let [selectedMovie, randomPeople] = await Promise.all([
    getMovieActors(parsedMovieId),
    getRandomPeople(),
  ]);

  // Get three random actual actors/actresses, and two random actors/actresses from another movie
  const onlyActorsArray = selectedMovie.filter(
    (actor) => actor.known_for_department.toLowerCase().trim() === "acting"
  );
  const actingArrayLength = onlyActorsArray.length;

  // Some movies don't have enough of either kind of role from the API.
  // Handle those cases here
  if (actingArrayLength < 3) {
    res.statusCode = 500;
    return res.json({
      error:
        "There were not enough actors for this movie to play the game! Please pick another movie.",
    });
  }

  const randomActorIndex1 = Math.floor(Math.random() * actingArrayLength);
  let randomActorIndex2 = Math.floor(Math.random() * actingArrayLength);

  // Actors
  // Make sure numbers 1 and 2 are unique
  if (randomActorIndex1 === randomActorIndex2) {
    while (randomActorIndex1 === randomActorIndex2) {
      randomActorIndex2 = Math.floor(Math.random() * actingArrayLength);
    }
  }

  const randomActorIndex3 = Math.floor(Math.random() * actingArrayLength);
  // Make sure number 3 is unique from 1 and 2
  if (
    randomActorIndex3 === randomActorIndex2 ||
    randomActorIndex3 === randomActorIndex1
  ) {
    while (
      randomActorIndex3 === randomActorIndex2 ||
      randomActorIndex3 === randomActorIndex1
    ) {
      randomActorIndex2 = Math.floor(Math.random() * actingArrayLength);
    }
  }

  const randomActor1 = onlyActorsArray[randomActorIndex1];
  const randomActor2 = onlyActorsArray[randomActorIndex2];
  const randomActor3 = onlyActorsArray[randomActorIndex3];
  const correctMovieActors = [randomActor1, randomActor2, randomActor3].map(
    (actor: CastMember) => ({
      ...actor,
      originalMovieId: parsedMovieId,
      // Makes it easier to reference images in the frontend
      // But sometimes there isn't an image for this actor. Provide a placeholder
      // if that's the case.
      profile_path: actor.profile_path
        ? `https://image.tmdb.org/t/p/original${actor.profile_path}`
        : "https://via.placeholder.com/150",
    })
  );

  // Format the random people to be as close to cast members as possible
  const formattedRandomPeople = randomPeople.map((person) => ({
    id: `${person.name.first} ${person.name.last}`,
    name: `${person.name.first} ${person.name.last}`,
    profile_path: person.picture.large,
  }));

  // Shuffle the order of cast members so it's not always going to return an actor
  const shuffledCastMembers = shuffleArray([
    ...correctMovieActors,
    ...formattedRandomPeople,
  ]);

  res.statusCode = 200;
  return res.json({
    cast: JSON.stringify(shuffledCastMembers),
  });
}
