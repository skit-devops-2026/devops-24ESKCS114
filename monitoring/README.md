# Local Kubernetes monitoring

Prometheus scrapes the app's `/metrics` endpoint through `movforyou-service`. Grafana is provisioned with Prometheus as its default data source. Both services are internal to the cluster and use temporary `emptyDir` storage, suitable for the local Kind exercise.

Apply the monitoring stack after the app and MongoDB are running:

```sh
kubectl apply -f monitoring/monitoring.yaml
kubectl rollout status deployment/prometheus-deployment
kubectl rollout status deployment/grafana-deployment
```

Open Prometheus in one terminal:

```sh
kubectl port-forward svc/prometheus-service 9090:9090
```

Visit `http://localhost:9090/targets`. The `movforyou` target should be `UP`. You can also run `up{job="movforyou"}` in the Prometheus query page; it should return `1`.

Open Grafana in another terminal:

```sh
kubectl port-forward svc/grafana-service 3001:3000
```

Visit `http://localhost:3001` and sign in with the local-only default `admin` / `admin`, then set a new password when prompted. The Prometheus data source is provisioned automatically. Try `rate(http_requests_total[5m])` in Explore after generating app requests.

The monitoring data is ephemeral and is lost when its pods are recreated. These defaults are for a local Kind cluster only; configure persistent storage and secure credentials before using this outside local development.

Remove only the monitoring stack with:

```sh
kubectl delete -f monitoring/monitoring.yaml
```
