/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
    extend: {
      colors: {
        macchiato: {
          rosewater: "#f5e0dc",
          flamingo: "#f2cdcd",
          pink: "#f5c2e7",
          mauve: "#cba6f7",
          red: "#f38ba8",
          maroon: "#eba0ac",
          peach: "#fab387",
          yellow: "#f9e2af",
          green: "#a6e3a1",
          teal: "#94e2d5",
          sky: "#89dceb",
          sapphire: "#74c7ec",
          blue: "#89b4fa",
          lavender: "#b4befe",
          text: "#cdd6f4",
          subtext1: "#bac2de",
          subtext0: "#a6adc8",
          overlay2: "#9399b2",
          overlay1: "#7f849c",
          overlay0: "#6c7086",
          surface2: "#585b70",
          surface1: "#45475a",
          surface0: "#313244",
          base: "#1e1e2e",
          mantle: "#181825",
          crust: "#11111b",
        },
        osvauld: {
          quarzowhite: "#C9D1D9",
          ninjablack: "#010409",
          lilacpink: "#CBA6F7",
          carolinablue: "#89B4FA",
          bordergreen: "#161B22",
          flaxblue: "#CDD6F4",
          chalkwhite: "#A6B0BB",
          pearlgreen: "#1C292C",
          cretangreen: "#598681",
          dusklabel: "#8B949E",
          iconblack: "#21262D",
          activelavender: "#B4BEFE",
          sheffieldgrey: "#6E7681",
          whaleblue: "#1D333F",
          spritzigblue: "#74C7EC",
          quartzitegreen: "#223127",
          grapegreen: "#A6E3A1",
          safflowerpink: "#322A35",
          croworange: "#33302A",
          frostylabel: "#9399B2",
          illutionpurple: "#B7BDF8",
          frameblack: "#0D1117",
          placeholderblack: "#30363D",
          sensitivebgblack: "#14191E",
          sensitivebgblue: "#253244",
          highlightwhite: "#E8EFF6",
          managerPurple: "#3B3441",
          ownerGreen: "#2C3B33",
          readerOrange: "#3C3B35",
          ownerText: "#A6E3A1",
          readerText: "#F9E2AF",
          managerText: "#F5C2E7",
        },
      },
      fontFamily: {
        sans: [
          '"Inter"',
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          '"Noto Sans"',
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
