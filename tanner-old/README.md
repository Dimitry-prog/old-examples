# Tanner Start - React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## 📦 Package Manager

This project uses **Yarn** as the package manager. The project is configured to only allow Yarn to ensure consistency across all environments.

### Requirements

- Node.js >= 22.12.0
- Yarn >= 1.22.0

### Installation

```bash
# Install dependencies
yarn install

# Check engine requirements
yarn engines-check
```

### Available Scripts

```bash
# Development
yarn dev              # Start development server

# Building
yarn build            # Build for production
yarn preview          # Preview production build

# Testing
yarn test             # Run tests in watch mode
yarn test:run         # Run tests once
yarn test:coverage    # Run tests with coverage

# Code Quality
yarn lint:fix         # Fix ESLint issues
yarn format:fix       # Format code with Prettier
```

### Why Yarn Only?

This project is configured to use only Yarn for the following reasons:

1. **Consistency**: Ensures all team members use the same package manager
2. **Lock file**: Uses `yarn.lock` for deterministic dependency resolution
3. **Performance**: Yarn's caching and parallel installation
4. **Workspace support**: Better monorepo support if needed in the future

The `preinstall` script will prevent installation with npm or pnpm.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
});
```
