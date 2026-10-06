import type { IncomingMessage, ServerResponse } from "node:http";
import { app } from "../server.js";

export default function handler(
  request: IncomingMessage,
  response: ServerResponse,
) {
  const handleRequest = app as unknown as (
    req: IncomingMessage,
    res: ServerResponse,
  ) => void;
  return handleRequest(request, response);
}
