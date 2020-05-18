# Basic Website Template

## Setup

Install the project dependencies by running:

```bash
yarn
```

## Building

To compile the project simply run

```bash
yarn build
```

The resulting artifacts will be pushed into `/build`. These assets can be deployed as required.

## Development

This will watch changes to the source and serve the solution on `http://localhost:9000`

```bash
yarn dev
```

## Testing 

Testing uses Jest and will scan the projects for `*.spec.ts` files

```
yarn test
```

## Environment Variables

Environment variables are accessed via a global constant `__environment`.

Example usage would be:

```typescript
type Environment = {
  MY_VAR: string
}

declare const __environment: Environment

console.log(__environment.MY_VAR)
```

## Injecting Environment Variables

For security reasons your system's entire environment is not available inside your application. Instead, environment variables are added manually.

To inject environment variables into your bundles you can either use environment variables or dotenv files.

You must modify the call inside the build command (and your CI) to accommodate this.

We use the same API used by docker:

```bash
npx webpack --env MY_VAR=MY_VALUE --env MY_VAR_2=MY_VALUE_2
npx webpack --env-file ./prod.env
```
