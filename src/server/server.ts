import ws from '@fastify/websocket';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import fastify from 'fastify';
import { appRouter } from './router';
import { createContext } from './router/context';
import * as MU from 'moving-average-ts';
export interface ServerOptions {
  dev?: boolean;
  port?: number;
  prefix?: string;
}

export function createServer(opts: ServerOptions) {
  const dev = opts.dev ?? true;
  const port = opts.port ?? 3000;
  const prefix = opts.prefix ?? '/trpc';
  const server = fastify({ logger: dev });

  server.register(ws);
  server.register(fastifyTRPCPlugin, {
    prefix,
    useWSS: true,
    trpcOptions: { router: appRouter, createContext },
  });

  server.get('/', async () => {
    return { hello: 'wait-on 💨', res: MU.ma([1, 2, 3, 4, 5, 6], 1) };
  });

  const stop = () => server.close();
  const start = async () => {
    try {
      await server.listen(port);
      console.log('listening on port', port);
    } catch (err) {
      server.log.error(err);
      process.exit(1);
    }
  };

  return { server, start, stop };
}
