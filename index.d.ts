import { IncomingMessage, ServerResponse, Server } from 'http';
import { ReadStream } from 'fs';

export declare class Restar {
  constructor();

  listen(...args: any[]): Server;

  fire(): RequestListener;

  use(handler: RequestHandler): void;
  use(path: string, handler: RequestHandler): void;
  end(handler: RequestHandler): void;
  end(path: string, handler: RequestHandler): void;
  catch(handler: ErrorHandler): void | string | Object | Buffer | ReadStream;
  catch(path: string, handler: ErrorHandler): void | string | Object | Buffer | ReadStream;

  get(path: string, handler: RequestHandler): void | string | Object | Buffer | ReadStream;
  post(path: string, handler: RequestHandler): void | string | Object | Buffer | ReadStream;
  put(path: string, handler: RequestHandler): void | string | Object | Buffer | ReadStream;
  head(path: string, handler: RequestHandler): void;
  delete(path: string, handler: RequestHandler): void | string | Object | Buffer | ReadStream;
  options(path: string, handler: RequestHandler): void;
  all(path: string, handler: RequestHandler): void | string | Object | Buffer | ReadStream;
}

type RequestListener = (req: IncomingMessage, res: ServerResponse) => void;

export type RequestHandler = (req?: IncomingMessage, res?: ServerResponse, next?: Next) => any;

export type ErrorHandler = (e: Error) => (req?: IncomingMessage, res?: ServerResponse, next?: Next) => any;

export interface Next {
  (err?: any): void;

  ifError(err?: any): void;
}
