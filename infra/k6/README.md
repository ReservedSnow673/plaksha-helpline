# k6 load tests

Requires [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/) installed locally.

## Scenarios

- `load-test.js` — mixed REST health + incident create burst (configure `API_BASE_URL` and `AUTH_TOKEN`)

## Run

```bash
export API_BASE_URL=http://localhost:4000
export AUTH_TOKEN=<dispatcher-or-test-user-jwt>
k6 run infra/k6/load-test.js
```

Target from plan: ~200 concurrent WS clients is validated separately with `socket.io-client` harness; extend this script when staging URL is stable.
