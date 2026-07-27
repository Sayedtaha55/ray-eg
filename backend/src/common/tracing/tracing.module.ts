import { Module, DynamicModule } from '@nestjs/common';

@Module({})
export class TracingModule {
  static forRoot(): DynamicModule {
    const enabled = String(process.env.OTEL_ENABLED || 'false').toLowerCase() === 'true';

    if (!enabled) {
      return { module: TracingModule, providers: [], exports: [] };
    }

    return {
      module: TracingModule,
      providers: [],
      exports: [],
      onModuleInit: async () => {
        await TracingModule.initTracing();
      },
    } as any;
  }

  static async initTracing() {
    try {
      const endpoint = String(process.env.JAEGER_ENDPOINT || 'http://localhost:4318/v1/traces').trim();
      const serviceName = String(process.env.OTEL_SERVICE_NAME || 'ray-marketplace-backend').trim();

      const dynamicRequire = require;
      const { trace, SpanStatusCode } = dynamicRequire('@opentelemetry/api');
      const { NodeSDK } = dynamicRequire('@opentelemetry/sdk-node');
      const { OTLPTraceExporter } = dynamicRequire('@opentelemetry/exporter-trace-otlp-http');
      const { ExpressInstrumentation } = dynamicRequire('@opentelemetry/instrumentation-express');
      const { HttpInstrumentation } = dynamicRequire('@opentelemetry/instrumentation-http');
      const { resourceFromAttributes } = dynamicRequire('@opentelemetry/resources');
      const semConv = dynamicRequire('@opentelemetry/semantic-conventions');

      const SERVICE_NAME = semConv.SEMATTRS_SERVICE_NAME || semConv.ATTR_SERVICE_NAME || 'service.name';
      const SERVICE_VERSION = semConv.SEMATTRS_SERVICE_VERSION || semConv.ATTR_SERVICE_VERSION || 'service.version';

      const exporter = new OTLPTraceExporter({ url: endpoint });
      const resource = resourceFromAttributes({
        [SERVICE_NAME]: serviceName,
        [SERVICE_VERSION]: process.env.npm_package_version || '1.0.0',
      });

      const sdk = new NodeSDK({
        resource,
        traceExporter: exporter,
        instrumentations: [new HttpInstrumentation(), new ExpressInstrumentation()],
      });

      await sdk.start();
      (globalThis as any).__otelSdk = sdk;
      console.log('[Tracing] OpenTelemetry initialized with Jaeger endpoint:', endpoint);
    } catch (err) {
      console.warn('[Tracing] Failed to initialize OpenTelemetry:', err instanceof Error ? err.message : err);
    }
  }

  static async shutdown() {
    const sdk = (globalThis as any).__otelSdk;
    if (sdk) {
      try { await sdk.shutdown(); } catch {}
    }
  }
}
