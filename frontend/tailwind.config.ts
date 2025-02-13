import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}", // app 폴더 내의 파일 경로
    "./components/**/*.{js,ts,jsx,tsx}", // components 폴더 내의 파일 경로
    "./src/**/*.{js,ts,jsx,tsx}", // src 폴더 내의 모든 파일 경로
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
} satisfies Config;
