import '@/config'; // NOTE: need to be imported first to load env variables

import fastify from 'fastify';

const server = fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
    },
  },
});

server.get('/status', function (req, res) {
  res.status(200).send({ status: 'ok' });
});

const port = process.env.PORT || 3000;
server.listen({ port: +port }, function (err) {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
});
