import { Session } from "inspector";
import { Profiler } from "../src/profiler";

// it would of course be ridiculous for jest to support auto-mocking
// non-default class exports ootb, so this does it instead
jest.mock("inspector", () => ({
  Session: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    post: jest.fn().mockImplementation((...args: unknown[]) => {
      // execute the callback with a null error
      const cb = args[args.length - 1];
      if (typeof cb === "function") {
        cb(null);
      }
    }),
  })),
}));

const SessionMock = Session as jest.MockedClass<typeof Session>;

describe("Profiler", () => {
  describe("when given an existing session", () => {
    const session = new SessionMock();
    const profiler = new Profiler(session);

    test("constructs a Profiler with the same session", () => {
      expect(profiler.session).toBe(session);
    });

    describe("enable", () => {
      test("posts 'Profiler.enable'", async () => {
        await profiler.enable();
        expect(session.post).toHaveBeenCalledWith(
          "Profiler.enable",
          expect.any(Function)
        );
      });
    });

    describe("disable", () => {
      test("posts 'Profiler.disable'", async () => {
        await profiler.disable();
        expect(session.post).toHaveBeenCalledWith(
          "Profiler.disable",
          expect.any(Function)
        );
      });
    });

    describe("start", () => {
      test("posts 'Profiler.start'", async () => {
        await profiler.start();
        expect(session.post).toHaveBeenCalledWith(
          "Profiler.start",
          expect.any(Function)
        );
      });
    });

    describe("stop", () => {
      test("posts 'Profiler.stop'", async () => {
        await profiler.stop();
        expect(session.post).toHaveBeenCalledWith(
          "Profiler.stop",
          expect.any(Function)
        );
      });
    });

    describe("setSamplingInterval", () => {
      test("posts 'Profiler.setSamplingInterval'", async () => {
        const params: Profiler.SetSamplingIntervalParameterType = {
          interval: 1,
        };
        await profiler.setSamplingInterval(params);
        expect(session.post).toHaveBeenCalledWith(
          "Profiler.setSamplingInterval",
          params,
          expect.any(Function)
        );
      });
    });

    describe("startPreciseCoverage", () => {
      test("posts 'Profiler.startPreciseCoverage'", async () => {
        const params: Profiler.StartPreciseCoverageParameterType = {
          detailed: false,
          callCount: true,
        };
        await profiler.startPreciseCoverage(params);
        expect(session.post).toHaveBeenCalledWith(
          "Profiler.startPreciseCoverage",
          params,
          expect.any(Function)
        );
      });
    });

    describe("stopPreciseCoverage", () => {
      test("posts 'Profiler.stopPreciseCoverage'", async () => {
        await profiler.stopPreciseCoverage();
        expect(session.post).toHaveBeenCalledWith(
          "Profiler.stopPreciseCoverage",
          expect.any(Function)
        );
      });
    });

    describe("takePreciseCoverage", () => {
      test("posts 'Profiler.takePreciseCoverage'", async () => {
        await profiler.takePreciseCoverage();
        expect(session.post).toHaveBeenCalledWith(
          "Profiler.takePreciseCoverage",
          expect.any(Function)
        );
      });
    });
  });

  test("should create a session when one is not provided", () => {
    const profiler = new Profiler();
    expect(profiler.session).toBeDefined();
  });
});
