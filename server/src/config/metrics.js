// server/src/config/metrics.js
import client from 'prom-client';

// Create a Registry to register the metrics
const register = new client.Registry();

// Add default metrics (CPU, memory, event loop lag, etc.)
client.collectDefaultMetrics({ 
  register,
  prefix: 'genesys_api_',
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5]
});

// ===================================================
// CUSTOM METRICS
// ===================================================

// HTTP Request Duration Histogram
const httpRequestDuration = new client.Histogram({
  name: 'genesys_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});
register.registerMetric(httpRequestDuration);

// HTTP Request Counter
const httpRequestCounter = new client.Counter({
  name: 'genesys_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});
register.registerMetric(httpRequestCounter);

// Active Requests Gauge
const activeRequests = new client.Gauge({
  name: 'genesys_active_requests',
  help: 'Number of active HTTP requests'
});
register.registerMetric(activeRequests);

// Job Processing Duration Histogram
const jobDuration = new client.Histogram({
  name: 'genesys_job_duration_seconds',
  help: 'Duration of background job processing in seconds',
  labelNames: ['job_type', 'status'],
  buckets: [1, 5, 10, 30, 60, 120, 300, 600]
});
register.registerMetric(jobDuration);

// Active Jobs Gauge
const activeJobs = new client.Gauge({
  name: 'genesys_active_jobs',
  help: 'Number of currently processing jobs',
  labelNames: ['job_type']
});
register.registerMetric(activeJobs);

// Database Query Duration Histogram
const dbQueryDuration = new client.Histogram({
  name: 'genesys_db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['query_type'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5]
});
register.registerMetric(dbQueryDuration);

// Document Generation Counter
const documentCounter = new client.Counter({
  name: 'genesys_documents_generated_total',
  help: 'Total number of documents generated',
  labelNames: ['document_type', 'status']
});
register.registerMetric(documentCounter);

// Cache Hit/Miss Counter
const cacheCounter = new client.Counter({
  name: 'genesys_cache_operations_total',
  help: 'Total number of cache operations',
  labelNames: ['operation', 'result']
});
register.registerMetric(cacheCounter);

// ===================================================
// MIDDLEWARE
// ===================================================

/**
 * Express middleware to track HTTP metrics
 */
export function metricsMiddleware(req, res, next) {
  // Skip metrics endpoint itself
  if (req.path === '/metrics') {
    return next();
  }

  const start = Date.now();
  activeRequests.inc();

  // Capture response finish
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    const labels = {
      method: req.method,
      route,
      status_code: res.statusCode
    };

    httpRequestDuration.observe(labels, duration);
    httpRequestCounter.inc(labels);
    activeRequests.dec();
  });

  next();
}

/**
 * Metrics endpoint handler
 */
export async function metricsHandler(req, res) {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (err) {
    res.status(500).end(err);
  }
}

// ===================================================
// HELPER FUNCTIONS
// ===================================================

/**
 * Track job processing time
 */
export function trackJob(jobType) {
  const end = jobDuration.startTimer({ job_type: jobType });
  activeJobs.inc({ job_type: jobType });

  return (status = 'success') => {
    end({ status });
    activeJobs.dec({ job_type: jobType });
  };
}

/**
 * Track database query time
 */
export function trackDbQuery(queryType) {
  const end = dbQueryDuration.startTimer({ query_type: queryType });
  return () => end();
}

/**
 * Track document generation
 */
export function trackDocument(documentType, status = 'success') {
  documentCounter.inc({ document_type: documentType, status });
}

/**
 * Track cache operations
 */
export function trackCache(operation, result) {
  cacheCounter.inc({ operation, result });
}

export default {
  register,
  metricsMiddleware,
  metricsHandler,
  trackJob,
  trackDbQuery,
  trackDocument,
  trackCache
};
