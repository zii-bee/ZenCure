module.exports = {
    content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
    theme: {
      extend: {
        colors: {
          primary: {
            light: '#60A5FA',
            DEFAULT: '#3B82F6',
            dark: '#2563EB',
          },
          secondary: {
            light: '#10B981',
            DEFAULT: '#059669',
            dark: '#047857',
          },
          background: {
            light: '#F9FAFB',
            DEFAULT: '#F3F4F6',
            dark: '#E5E7EB',
          },
        },
      },
    },
    plugins: [],
  };