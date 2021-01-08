import { createMuiTheme } from "@material-ui/core/styles";
import { red } from "@material-ui/core/colors";
import type {} from "@material-ui/lab/themeAugmentation";

// Create a theme instance.
const theme = createMuiTheme({
  palette: {
    background: {
      default: "#fff",
    },
    error: {
      main: red.A400,
    },
    primary: {
      main: "#556cd6",
    },
    secondary: {
      main: "#19857b",
    },
  },
});

export default theme;
