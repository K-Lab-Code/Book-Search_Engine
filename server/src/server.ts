import express from 'express';
import type { Request, Response } from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import path from 'node:path';
import { typeDefs, resolvers } from './Schemas/index.js';
import db from './config/connection.js';
//import routes from './routes/index.js';
import { authenticateToken } from './services/auth.js';

const app = express();
const PORT = process.env.PORT || 3001;
const server = new ApolloServer({
  typeDefs,
  resolvers,
});


const startServer = async () => {
  await server.start();
  await db();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use('/graphql', expressMiddleware(server as any,
    {
      context: authenticateToken as any
    }
  ));

  // if we're in production, serve client/build as static assets
 
  if (process.env.NODE_ENV === 'production') {
    const clientPath = path.join(process.cwd(), 'client', 'dist');
    app.use(express.static(clientPath));

    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(clientPath, 'index.html'));
    });
  }




  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
  });

}

startServer();