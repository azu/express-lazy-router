import express from "express";

export type createLazyLoaderOptions = {
    /**
     * if preload is true, load router asap
     * Default: false
     */
    preload?: boolean;
};

/**
 * @param options
 * @example
 * ```js
 * const lazyLoad = createLazyLoader();
 * router.use(
 *   '/path_to_router',
 *   lazyLoad(() => import('./path_to_router')),
 * );
 * ```
 */
export function createLazyRouter(options: createLazyLoaderOptions = {}) {
    const preload = options.preload ?? false;
    /**
     * lazy load express router
     * @param resolver
     */
    return function lazyRouter(resolver: () => Promise<{ default: express.Router } | express.Router>) {
        const lazyRouter = express.Router();
        let alreadyLoaded = false;
        const resolveResolver = () => {
            return resolver().then((router) => {
                alreadyLoaded = true;
                if ("default" in router) {
                    lazyRouter.use(router.default);
                } else {
                    lazyRouter.use(router);
                }
            });
        };
        lazyRouter.use((_req, _res, next) => {
            if (alreadyLoaded) {
                return next();
            } else {
                // first request handler
                resolveResolver()
                    .then(() => {
                        next();
                    })
                    .catch((error) => {
                        next(error);
                    });
            }
        });
        if (preload) {
            resolveResolver().catch((error) => {
                console.error("[lazy-router] Fail to preload", error);
            });
        }
        return lazyRouter;
    };
}
