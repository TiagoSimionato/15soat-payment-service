resource "kubernetes_service" "payment-app" {
  metadata {
    name      = "svc-15soat-payment-service"
    namespace = var.namespace
  }

  spec {
    selector = { app = "15soat-payment-service" }

    port {
      port        = 3004
      target_port = 3004
      node_port   = 30004
    }

    type = "NodePort"
  }
}
