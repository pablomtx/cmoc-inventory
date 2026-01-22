/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cmoc: {
          primary: '#1e1547',    // Roxo escuro da logo CMOC
          secondary: '#6cb52d',  // Verde da logo CMOC
          dark: '#130f2e',       // Roxo mais escuro
          light: '#f8f9fa',      // Cinza claro
          accent: '#4a3f7a',     // Roxo médio
        },
      },
    },
  },
  plugins: [],
}
