/**
 * 轻量级路由器
 * 支持路径参数（:param）和 HTTP 方法匹配
 */

export type Handler = (
  request: Request,
  env: Env,
  params: Record<string, string>,
) => Promise<Response>;

interface Route {
  method: string;
  pattern: RegExp;
  paramNames: string[];
  handler: Handler;
}

export class Router {
  private routes: Route[] = [];

  private addRoute(method: string, path: string, handler: Handler): void {
    const paramNames: string[] = [];
    const pattern = path.replace(/:(\w+)/g, (_, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });
    this.routes.push({
      method,
      pattern: new RegExp(`^${pattern}$`),
      paramNames,
      handler,
    });
  }

  get(path: string, handler: Handler): void {
    this.addRoute('GET', path, handler);
  }

  post(path: string, handler: Handler): void {
    this.addRoute('POST', path, handler);
  }

  put(path: string, handler: Handler): void {
    this.addRoute('PUT', path, handler);
  }

  delete(path: string, handler: Handler): void {
    this.addRoute('DELETE', path, handler);
  }

  async handle(request: Request, env: Env): Promise<Response | null> {
    const url = new URL(request.url);
    const method = request.method;
    const pathname = url.pathname;

    for (const route of this.routes) {
      if (route.method !== method) continue;
      const match = pathname.match(route.pattern);
      if (!match) continue;

      const params: Record<string, string> = {};
      route.paramNames.forEach((name, i) => {
        params[name] = match[i + 1];
      });

      return route.handler(request, env, params);
    }

    return null;
  }
}
