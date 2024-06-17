'use client';
import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  /*
    Josh's Custom CSS Reset
    https://www.joshwcomeau.com/css/custom-css-reset/
  */
  *, *::before, *::after {
    box-sizing: border-box;
  }
  * {
    margin: 0;
    padding: 0;
  }
  body {
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;

    display: flex;
    flex-direction: column;
  }
  img, picture, video, canvas, svg {
    display: block;
    max-width: 100%;
  }
  input, button, textarea, select {
    font: inherit;
  }
  p, h1, h2, h3, h4, h5, h6 {
    overflow-wrap: break-word;
  }

  body,
  html,
  main {
    height: 100%;
  }

  html {
    --color-gray-86: hsl(0deg, 0%, 86%);
    --color-gray-36: hsl(0deg, 0%, 36%);
    --color-green-49: hsl(115deg, 38%, 49%);
    --color-red-47: hsl(0deg, 50%, 47%);
  }

`;

export default GlobalStyles;
