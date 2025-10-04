import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default {
  plugins: [
    tailwindcss,
    autoprefixer({
      // Add browser compatibility for vendor prefixes
      overrideBrowserslist: [
        '> 1%',
        'last 2 versions',
        'Firefox ESR',
        'not dead'
      ],
      // Suppress warnings about vendor prefixes
      ignoreUnknownVersions: true,
    }),
  ],
};
