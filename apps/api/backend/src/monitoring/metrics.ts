import client from "prom-client";
import type { Request, Response, NextFunction } from "express";

// Initialize Registry
export const register = new client.Registry();

// Add default recommended metrics (CPU, Memory, Event Loop, GC)
client.collectDefaultMetrics({
  register,
  prefix: "stackpilot_backend_",
});

// Custom HTTP Metrics
export const httpRequestsTotal = new client.Counter({
  name: "stackpilot_http_requests_total",
  help: "Total number of HTTP requests processed",
  labelNames: ["method", "route", "status_code"],
});

export const httpRequestDuration = new client.Histogram({
  name: "stackpilot_http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

export const activeHttpRequests = new client.Gauge({
  name: "stackpilot_http_active_requests",
  help: "Number of active in-flight HTTP requests",
});

// Socket.IO Metrics
export const socketIoConnections = new client.Gauge({
  name: "stackpilot_socket_io_active_connections",
  help: "Current active Socket.IO connections",
  labelNames: ["namespace"],
});

// Container / Sandbox Metrics
export const sandboxContainersActive = new client.Gauge({
  name: "stackpilot_sandbox_containers_active",
  help: "Current active Docker sandbox containers",
});

export const sandboxContainersSpawnTotal = new client.Counter({
  name: "stackpilot_sandbox_containers_spawn_total",
  help: "Total Docker sandbox containers spawned",
  labelNames: ["status"],
});

// Register custom metrics
register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestDuration);
register.registerMetric(activeHttpRequests);
register.registerMetric(socketIoConnections);
register.registerMetric(sandboxContainersActive);
register.registerMetric(sandboxContainersSpawnTotal);

/**
 * Express middleware to record HTTP metrics
 */
export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.path === "/metrics") {
    return next();
  }

  activeHttpRequests.inc();
  const startTime = process.hrtime();

  res.on("finish", () => {
    activeHttpRequests.dec();

    const [seconds, nanoseconds] = process.hrtime(startTime);
    const durationInSeconds = seconds + nanoseconds / 1e9;

    // Normalize route to avoid high cardinality
    const route = req.baseUrl || req.route?.path || req.path || "unknown";
    const statusCode = res.statusCode.toString();

    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: statusCode,
    });

    httpRequestDuration.observe(
      {
        method: req.method,
        route,
        status_code: statusCode,
      },
      durationInSeconds
    );
  });

  next();
}

/**
 * Handler for GET /metrics endpoint
 */
export async function getMetricsHandler(_req: Request, res: Response) {
  try {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end(error instanceof Error ? error.message : "Error generating metrics");
  }
}
