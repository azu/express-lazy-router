# express-lazy-router

Lazy loading for express router.

## Motivation

I've used [ts-node](https://github.com/TypeStrong/ts-node)([ts-node-dev](https://github.com/wclr/ts-node-dev)) for
developing Node.js Web Application. It means that compile all TypeScript files at start time.

Many compilation make startup of the web app slow. Lazy routing avoid this compilation overhead by compiled when needed.

- [Compilation is unbelievably slow · Issue #754 · TypeStrong/ts-node](https://github.com/TypeStrong/ts-node/issues/754)

In a frontend, We have already used lazy loading for router like React Router, Vue Router.

- [Route-based code splitting | React](https://reactjs.org/docs/code-splitting.html#route-based-code-splitting)
- [Lazy Loading Routes | Vue Router](https://router.vuejs.org/guide/advanced/lazy-loading.html)

Also, [webpack](https://github.com/webpack/webpack) support [experiments.lazyCompilation](https://github.com/webpack/webpack/releases/tag/v5.17.0) as experimentally.

So, We can get lazy routing in Node.js [Express routing](https://expressjs.com/en/guide/routing.html) too.

## Install

Install with [npm](https://www.npmjs.com/):

    npm install express-lazy-router

## Usage

```ts
import { createLazyRouter } from 'express-lazy-router';
const lazyLoad = createLazyRouter({
    // In production, Load router asap
    preload: process.env.NODE_ENV === 'production',
});
const app = express();
// Load ./path_to_router.js when receive request to "/path_to_router"
app.use(
    '/path_to_router',
    lazyLoad(() => import('./path_to_router')),
);
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});
```

## Limitation

### Avoid to use non-path router

NG: express-lazy-router does not expect this way.

```ts
import { createLazyRouter } from 'express-lazy-router';
const lazyLoad = createLazyRouter();
const app = express();
// Load ./path_to_router.js when receive request to "/path_to_router"
app.use(
    lazyLoad(() => import('./path_to_router')),
);
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});
```



## Changelog

See [Releases page](https://github.com/azu/express-lazy-router/releases).

## Running tests

Install devDependencies and Run `npm test`:

    npm test

## Contributing

Pull requests and stars are always welcome.

For bugs and feature requests, [please create an issue](https://github.com/azu/express-lazy-router/issues).

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Author

- azu: [GitHub](https://github.com/azu), [Twitter](https://twitter.com/azu_re)

## License

MIT © azu
