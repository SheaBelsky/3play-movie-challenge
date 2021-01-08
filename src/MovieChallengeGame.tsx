import { Action, DispatchAction, State, useAppReducer } from "./useAppReducer";
import { Alert, Autocomplete } from "@material-ui/lab";
import {
  AppBar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Checkbox,
  CircularProgress,
  Container,
  Grid,
  TextField,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { CastMember, MovieResult } from "./movieTypes";
import { Dispatch, Fragment } from "react";
import { makeStyles } from "@material-ui/core/styles";

// Allows us to extract code from the component (for readability)
const createHandleSearch = (dispatch: Dispatch<Action>) => async (
  event: React.ChangeEvent<HTMLInputElement>
) => {
  const requestedMovieTitle = event.target.value;

  if (requestedMovieTitle.length > 4) {
    dispatch({
      data: { isSearching: true, movieTitleSearch: requestedMovieTitle },
      type: DispatchAction.SET_MOVIE_TITLE_SEARCH,
    });
    try {
      const response = await fetch("/api/searchMovieTitles", {
        body: JSON.stringify({
          requestedMovieTitle,
        }),
        method: "POST",
      });

      // If the server comes back with an error, throw it
      const responseJson = await response.json();
      if (response.status !== 200) {
        throw new Error(responseJson.error);
      }

      const { movies } = responseJson as { movies: string };
      const movieTitlesArray = JSON.parse(movies) as Array<MovieResult>;
      dispatch({
        data: {
          movieTitleResults: movieTitlesArray,
          movieTitleSearch: requestedMovieTitle,
        },
        type: DispatchAction.SET_MOVIE_TITLE_RESULTS,
      });
    } catch (error) {
      dispatch({
        data: { error: error.message },
        type: DispatchAction.SET_ERROR,
      });
    }
  } else {
    dispatch({
      data: { movieTitleSearch: requestedMovieTitle },
      type: DispatchAction.SET_MOVIE_TITLE_SEARCH,
    });
  }
};

// Allows us to extract code from the component declaration
const createHandleAutocompleteChange = (dispatch: Dispatch<Action>) => async (
  event: any,
  movieTitleSelection: MovieResult,
  reason
) => {
  // Exit early if the Autocomplete was cleared.
  if (reason === "clear") {
    dispatch({
      data: { isLoadingActors: false, movieTitleSelection: null },
      type: DispatchAction.SET_MOVIE_TITLE_SELECTION,
    });
    return;
  }
  // If the reason for the autocomplete changing was NOT because it was being cleared,
  // proceed with the network request.
  dispatch({
    data: { isLoadingActors: true, movieTitleSelection },
    type: DispatchAction.SET_MOVIE_TITLE_SELECTION,
  });

  try {
    const response = await fetch("/api/searchMovieActors", {
      body: JSON.stringify({
        movieId: movieTitleSelection.id,
      }),
      method: "POST",
    });

    // If the server comes back with an error, throw it
    const responseJson = await response.json();
    if (response.status !== 200) {
      throw new Error(responseJson.error);
    }

    const { cast } = responseJson as { cast: string };
    const castArray = JSON.parse(cast) as Array<CastMember>;
    dispatch({
      data: { movieActors: castArray },
      type: DispatchAction.SET_MOVIE_ACTORS,
    });
  } catch (error) {
    console.error(error, "error");
    dispatch({
      data: { error: error.message },
      type: DispatchAction.SET_ERROR,
    });
  }
};

const createHandleCardClick = (dispatch: Dispatch<Action>) => (
  actor: CastMember
) => {
  dispatch({
    data: {
      movieActorToToggle: actor,
    },
    type: DispatchAction.SET_MOVIE_ACTOR_SELECTION,
  });
};

const createHandleSubmitGuesses = (
  dispatch: Dispatch<Action>,
  state: State
) => () => {
  // Determine which of the currently selected actors are from the movie selected by the gamer
  // Score of 3/3 = All actors guessed were from the movie
  // Score of 2/3 = Missed an actor
  // Score of 1/3 = Misssed two actors
  const selectedActorsFromSelectedMovie = state.movieActorsSelection.filter(
    (actor) => actor.originalMovieId === state.movieTitleSelection.id
  );
  dispatch({
    data: {
      score: selectedActorsFromSelectedMovie.length,
    },
    type: DispatchAction.SET_MOVIE_ACTOR_GUESS,
  });
};

const SCORE_TO_MESSAGE_MAP = {
  0: "How did you even get this score? You shouldn't have been able to!",
  1: "You only got one out of the thre actors. Did you watch this movie?",
  2: "You got two out of the three actors! Maybe you missed a background character?",
  3: "You got all three characters! You must have been on set producing the movie!",
};

const useStyles = makeStyles({
  nav: {
    backgroundColor: "royalBlue",
  },
  root: {
    maxWidth: 345,
  },
});

function Home() {
  // Hooks
  const classes = useStyles();
  const [state, dispatch] = useAppReducer();

  // Handlers
  const handleSearch = createHandleSearch(dispatch);
  const handleAutocompleteChange = createHandleAutocompleteChange(dispatch);
  const handleCardClick = createHandleCardClick(dispatch);
  const handleSubmitGuesses = createHandleSubmitGuesses(dispatch, state);

  return (
    <Fragment>
      <AppBar classes={{ colorPrimary: "royalblue" }}>
        <Toolbar>
          <Typography component="h1" variant="h6">
            The Celebrity Movie Game
          </Typography>
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="md">
        <Box my="5em">
          <Box>
            <Typography paragraph>
              Ready to test your knowledge about your favorite movies? Eager to
              prove your friend wrong about what actors or actresses cameoed in
              a movie you know a lot about? This is the place to show off!
            </Typography>
          </Box>
          <Box>
            <Typography component="h2" variant="h4">
              Goal
            </Typography>
            <Typography paragraph>
              Your task, should you choose to accept it, is to correctly
              identify the names of movie actors or actresses who appeared in
              the movie you search for. Guess right, and you'll win the game!
              But if you guess wrong, you'll have to try again with a different
              set of actors and actresses from the movie.
            </Typography>
            <Typography paragraph>
              For example, if you search for "Star Wars: A New Hope", you would
              expect to see choices that contain 3 actors/actresses who{" "}
              <b>were</b> in the movie, and two actors/actresses who were{" "}
              <b>not</b> in the movie. You have to identify the right ones!
            </Typography>
          </Box>
          <Box my={3}>
            <Box my={3}>
              <Typography component="h2" variant="h4">
                Search for a movie below to get started!
              </Typography>
            </Box>

            <Autocomplete
              freeSolo
              getOptionLabel={(option) => option.title}
              onChange={handleAutocompleteChange}
              options={state.movieTitleResults}
              loading={state.isSearching}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Movie Name"
                  onChange={handleSearch}
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <Fragment>
                        {state.isSearching ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </Fragment>
                    ),
                  }}
                />
              )}
            />

            {state.error && (
              <Box mt={3}>
                <Alert severity="error">{state.error}</Alert>
              </Box>
            )}

            {state.isLoadingActors && (
              <Box mt={3}>
                <CircularProgress /> Loading actors from{" "}
                {state.movieTitleSelection.title}, please wait...
              </Box>
            )}

            {!!state.movieActors?.length && (
              <Box mt={3}>
                <Typography>
                  Three of the below actors are from{" "}
                  {state.movieTitleSelection.title}, and two of them are not.
                  Check the ones you think are from{" "}
                  {state.movieTitleSelection.title}, then click "Submit"!
                </Typography>
                <Box my={3}>
                  <Grid
                    alignItems="stretch"
                    container
                    direction="row"
                    justify="center"
                    spacing={4}
                  >
                    {state.movieActors.map((actor) => {
                      const isChecked = !!state.movieActorsSelection.find(
                        (currentActor) => currentActor.id === actor.id
                      );
                      const isDisabled =
                        !isChecked && state.movieActorsSelection.length >= 3;
                      const ActionAreaWrapper = !isDisabled
                        ? CardActionArea
                        : Fragment;
                      return (
                        <Grid
                          item
                          key={actor.name}
                          style={{ display: "flex" }}
                          xs
                        >
                          <Card
                            className={classes.root}
                            onClick={
                              !isDisabled ? () => handleCardClick(actor) : null
                            }
                          >
                            <ActionAreaWrapper>
                              <CardMedia
                                alt={actor.name}
                                component="img"
                                height="128"
                                image={actor.profile_path}
                                title={actor.name}
                                width="128"
                              />
                              <CardContent>
                                <Typography>{actor.name}</Typography>
                              </CardContent>
                              <CardActions>
                                <Checkbox
                                  checked={isChecked}
                                  disabled={isDisabled}
                                />
                              </CardActions>
                            </ActionAreaWrapper>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                  <Box display="flex" justifyContent="center" my={3}>
                    <Button
                      color="secondary"
                      disabled={state.movieActorsSelection.length !== 3}
                      onClick={handleSubmitGuesses}
                      size="large"
                      variant="contained"
                    >
                      Submit Guesses
                    </Button>
                  </Box>
                  {!!state.score && (
                    <Typography align="center" paragraph>
                      {SCORE_TO_MESSAGE_MAP[state.score]}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </Fragment>
  );
}

export default Home;
