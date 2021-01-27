import express, { RequestHandler } from "express";
import request from "supertest";

import { createLazyRouter } from "../src/express-lazy-router";
import assert from "assert";

const createMockRouter = (requestHandler: RequestHandler): express.Router => {
    const router = express.Router();
    router.get("/", requestHandler);
    return router;
};
const waitFor = (ms: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};
describe("express-lazy-router", function () {
    describe("default", () => {
        const lazyLoad = createLazyRouter();
        it("should lazy load router", async () => {
            const app = express();
            let testRouterCalled = 0;
            app.use(
                "/test",
                lazyLoad(async () => {
                    testRouterCalled++;
                    return createMockRouter((_, res) => {
                        res.json({
                            ok: true
                        });
                    });
                })
            );
            await waitFor(100);
            assert.strictEqual(testRouterCalled, 0);
            return request(app)
                .get("/test")
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200)
                .then(() => {
                    assert.strictEqual(testRouterCalled, 1);
                });
        });
        it("should lazy load router when receive request", () => {
            const app = express();
            const requestTracker = new assert.CallTracker();
            const requestHandler: RequestHandler = requestTracker.calls((_, res) => {
                res.json({
                    ok: true
                });
            }, 1);
            app.use(
                "/test",
                lazyLoad(async () => createMockRouter(requestHandler))
            );
            return request(app)
                .get("/test")
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200)
                .then((response) => {
                    assert.deepStrictEqual(response.body, { ok: true });
                    requestTracker.verify();
                });
        });
        it("should not multiple calls lazy load router when multiple requests to /test", async () => {
            const app = express();
            let testRouterCalledCount = 0;
            app.use(
                "/test",
                lazyLoad(async () => {
                    testRouterCalledCount++;
                    return createMockRouter((_, res) => {
                        res.json({
                            ok: true
                        });
                    });
                })
            );
            await waitFor(100);
            assert.strictEqual(testRouterCalledCount, 0);
            // When multiple requests
            return Promise.all([
                request(app).get("/test").set("Accept", "application/json"),
                request(app).get("/test").set("Accept", "application/json")
            ]).then(() => {
                assert.strictEqual(testRouterCalledCount, 1, "router initialized at once");
            });
        });
    });
    describe("{ preload: true }", () => {
        const lazyLoad = createLazyRouter({
            preload: true
        });
        it("should preload lazy load router", async () => {
            const app = express();
            let testRouterCalledCount = 0;
            app.use(
                "/test",
                lazyLoad(async () => {
                    testRouterCalledCount++;
                    return createMockRouter((_, res) => {
                        res.json({
                            ok: true
                        });
                    });
                })
            );
            await waitFor(100);
            assert.strictEqual(testRouterCalledCount, 1);
            return request(app)
                .get("/test")
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200)
                .then(() => {
                    assert.strictEqual(testRouterCalledCount, 1);
                });
        });
        it("should not multiple calls lazy load router when multiple requests to /test", async () => {
            const app = express();
            let testRouterCalledCount = 0;
            app.use(
                "/test",
                lazyLoad(async () => {
                    testRouterCalledCount++;
                    return createMockRouter((_, res) => {
                        res.json({
                            ok: true
                        });
                    });
                })
            );
            await waitFor(100);
            assert.strictEqual(testRouterCalledCount, 1);
            // When multiple requests
            return Promise.all([
                request(app).get("/test").set("Accept", "application/json"),
                request(app).get("/test").set("Accept", "application/json")
            ]).then(() => {
                assert.strictEqual(testRouterCalledCount, 1, "router initialized at once");
            });
        });
        it("should lazy load router when receive request", () => {
            const app = express();
            const requestTracker = new assert.CallTracker();
            const requestHandler: RequestHandler = requestTracker.calls((_, res) => {
                res.json({
                    ok: true
                });
            }, 1);
            app.use(
                "/test",
                lazyLoad(async () => createMockRouter(requestHandler))
            );
            return request(app)
                .get("/test")
                .set("Accept", "application/json")
                .expect("Content-Type", /json/)
                .expect(200)
                .then((response) => {
                    assert.deepStrictEqual(response.body, { ok: true });
                    requestTracker.verify();
                });
        });
    });
});
