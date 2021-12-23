import * as inspector from "inspector";

// re-export types from the underlying profiler session
export namespace Profiler {
  // properties
  export type Session = inspector.Session;

  // parameters
  export type SetSamplingIntervalParameterType =
    inspector.Profiler.SetSamplingIntervalParameterType;
  export type StartPreciseCoverageParameterType =
    inspector.Profiler.StartPreciseCoverageParameterType;
  export type TakePreciseCoverageReturnType =
    inspector.Profiler.TakePreciseCoverageReturnType;

  // return types
  export type StopReturnType = inspector.Profiler.StopReturnType;
  /**
   * A profile collected from v8's CPU Profiler
   * @see https://chromedevtools.github.io/devtools-protocol/tot/Profiler/#type-Profile
   */
  export type Profile = inspector.Profiler.Profile;
  /**
   * Profile node. Holds callsite information, execution statistics and child
   * nodes.
   * @see https://chromedevtools.github.io/devtools-protocol/tot/Profiler/#type-ProfileNode
   */
  export type ProfileNode = inspector.Profiler.ProfileNode;
  export type CoverageRange = inspector.Profiler.CoverageRange;
}

/**
 * Async wrapper around node's inspector.Session API. This provides a
 * simplified method of interferacting with v8's CPU profiling by exposing
 * messages as methods and wrapping node's callback API in promises
 * @see https://nodejs.org/api/inspector.html
 * @see https://chromedevtools.github.io/devtools-protocol/tot/Profiler/
 */
export class Profiler {
  private _session: Profiler.Session;

  /**
   * Constructs a new Profiler, optionally a new native inspector session can
   * be passed in. Else a new session is created.
   * Additionally the session is connected to the inspector back-end
   * Blocks until the session is connected
   */
  public constructor(session?: inspector.Session) {
    if (session === undefined) {
      this._session = new inspector.Session();
    } else {
      this._session = session;
    }
    this.connect();
  }

  public get session(): Profiler.Session {
    return this._session;
  }

  /**
   * Immediately close the session. All pending message callbacks will be
   * called with an error. session.connect() will need to be called to be able
   * to send messages again. Reconnected session will lose all inspector state,
   * such as enabled agents or configured breakpoints.
   *
   * @see https://nodejs.org/api/inspector.html#sessiondisconnect
   */
  public disconnect(): void {
    this._session.disconnect();
  }

  /**
   * Connects a session to the inspector back-end.
   *
   * @see https://nodejs.org/api/inspector.html#sessionconnect
   */
  public connect(): void {
    this._session.connect();
  }

  /**
   * Connects to the inspector back-end and enables a profiler session
   *
   * @see https://chromedevtools.github.io/devtools-protocol/tot/Profiler/#method-enable
   */
  public enable(): Promise<undefined> {
    return this.nullablePost("Profiler.enable");
  }

  /**
   * Disables the profiler and disconnects it from the inspector back-end
   *
   * @see https://chromedevtools.github.io/devtools-protocol/tot/Profiler/#method-disable
   */
  public disable(): Promise<undefined> {
    return this.nullablePost("Profiler.disable");
  }

  /**
   * Starts the profiler
   *
   * @see https://chromedevtools.github.io/devtools-protocol/tot/Profiler/#method-start
   */
  public start(): Promise<undefined> {
    return this.nullablePost("Profiler.start");
  }

  /**
   * Stops the profiler and returns the profile
   *
   * @see https://chromedevtools.github.io/devtools-protocol/tot/Profiler/#method-stop
   */
  public stop(): Promise<Profiler.StopReturnType> {
    return new Promise((res, rej) =>
      this._session.post("Profiler.stop", (err, params) =>
        err ? rej(err) : res(params)
      )
    );
  }

  /**
   * Changes CPU profiler sampling interval. Must be called before CPU profiles
   * recording started.
   *
   * @see https://chromedevtools.github.io/devtools-protocol/tot/Profiler/#method-setSamplingInterval
   */
  public setSamplingInterval(
    params: Profiler.SetSamplingIntervalParameterType
  ): Promise<undefined> {
    return new Promise((res, rej) =>
      this._session.post("Profiler.setSamplingInterval", params, (err) =>
        err ? rej(err) : res(undefined)
      )
    );
  }

  /**
   * Enable precise code coverage. Coverage data for JavaScript executed before
   * enabling precise code coverage may be incomplete. Enabling prevents
   * running optimized code and resets execution counters.
   *
   * @see https://chromedevtools.github.io/devtools-protocol/tot/Profiler/#method-startPreciseCoverage
   */
  public startPreciseCoverage(
    params?: Profiler.StartPreciseCoverageParameterType
  ): Promise<undefined> {
    return new Promise((res, rej) =>
      this._session.post("Profiler.startPreciseCoverage", params, (err) =>
        err ? rej(err) : res(undefined)
      )
    );
  }

  /**
   * Disable precise code coverage. Disabling releases unnecessary execution
   * count records and allows executing optimized code.
   *
   * @see https://chromedevtools.github.io/devtools-protocol/tot/Profiler/#method-stopPreciseCoverage
   */
  public stopPreciseCoverage(): Promise<undefined> {
    return this.nullablePost("Profiler.stopPreciseCoverage");
  }

  /**
   * Collect coverage data for the current isolate, and resets execution
   * counters. Precise code coverage needs to have started.
   *
   * @see https://chromedevtools.github.io/devtools-protocol/tot/Profiler/#method-takePreciseCoverage
   */
  public takePreciseCoverage(): Promise<Profiler.TakePreciseCoverageReturnType> {
    return new Promise((res, rej) =>
      this._session.post("Profiler.takePreciseCoverage", (err, coverage) =>
        err ? rej(err) : res(coverage)
      )
    );
  }

  /**
   * Convenience function for posting messages to the inspector back-end of
   * that do not take any parameters and return undefined. No type checking is
   * provided for the messages posted due to an inability to extract parameter
   * types from overloads in definition files so be sure that what you're
   * sending is an actual method
   *
   * @see https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/node/inspector.d.ts
   * @see https://nodejs.org/api/inspector.html#sessionpostmethod-params-callback
   * @see https://chromedevtools.github.io/devtools-protocol/tot/Profiler/
   */
  private nullablePost(method: string): Promise<undefined> {
    return new Promise((res, rej) =>
      this._session.post(method, (err: Error | null) =>
        err ? rej(err) : res(undefined)
      )
    );
  }
}
