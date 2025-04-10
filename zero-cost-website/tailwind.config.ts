
import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

function flattenColorPalette(colorObj: any) {
  const result: Record<string, string> = {};
  const flattenColors = (colorSet: any, prefix = "") => {
    for (const key in colorSet) {
      const value = colorSet[key];
      if (typeof value === "string") {
        result[prefix + key] = value;
      } else {
        flattenColors(value, `${prefix}${key}-`);
      }
    }
  };
  flattenColors(colorObj);
  return result;
}

function addVariablesForColors({ addBase, theme }: any) {
  const allColors = flattenColorPalette(theme("colors"));
  const newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: 'hsl(var(--primary))',
				'primary-foreground': 'hsl(var(--primary-foreground))',
				secondary: 'hsl(var(--secondary))',
				'secondary-foreground': 'hsl(var(--secondary-foreground))',
				destructive: 'hsl(var(--destructive))',
				'destructive-foreground': 'hsl(var(--destructive-foreground))',
				muted: 'hsl(var(--muted))',
				'muted-foreground': 'hsl(var(--muted-foreground))',
				accent: 'hsl(var(--accent))',
				'accent-foreground': 'hsl(var(--accent-foreground))',
				popover: 'hsl(var(--popover))',
				'popover-foreground': 'hsl(var(--popover-foreground))',
				card: 'hsl(var(--card))',
				'card-foreground': 'hsl(var(--card-foreground))',
				highlight: '#E7FF36',
				sky: colors.sky,
				slate: colors.slate,
				gray: colors.gray,
				neutral: colors.neutral,
				white: colors.white,
				black: colors.black,
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-in-right': {
					'0%': { opacity: '0', transform: 'translateX(20px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' }
				},
				'hover-glow': {
					'0%': { boxShadow: '0 0 0 0 rgba(231, 255, 54, 0.4)' },
					'70%': { boxShadow: '0 0 0 10px rgba(231, 255, 54, 0)' },
					'100%': { boxShadow: '0 0 0 0 rgba(231, 255, 54, 0)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out forwards',
				'fade-in-right': 'fade-in-right 0.5s ease-out forwards',
				'hover-glow': 'hover-glow 1.5s infinite'
			},
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
				heading: ['Inter', 'sans-serif']
			}
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		addVariablesForColors
	],
} satisfies Config;
