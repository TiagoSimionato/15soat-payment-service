resource "kubernetes_deployment" "payment-app" {
  metadata {
    name      = "15soat-payment-service"
    namespace = var.namespace
    labels    = { app = "15soat-payment-service" }
  }

  spec {
    replicas = 1

    selector {
      match_labels = { app = "15soat-payment-service" }
    }

    template {
      metadata {
        name   = "15soat-payment-service"
        labels = { app = "15soat-payment-service" }
      }

      spec {
        automount_service_account_token = false

        image_pull_secrets {
          name = "ghcr-secrets"
        }

        container {
          name  = "c-15soat-payment-service"
          image = var.image

          liveness_probe {
            http_get {
              path = "/health"
              port = 3004
            }
            initial_delay_seconds = 10
          }

          resources {
            requests = {
              cpu               = "100m"
              memory            = "100Mi"
              ephemeral-storage = "2Gi"
            }
            limits = {
              cpu    = "200m"
              memory = "100Mi"
            }
          }

          port {
            container_port = 3004
          }

          env {
            name = "DB_NAME"
            value = var.postgres_db
          }

          env {
            name = "DB_USER"
            value = var.postgres_user
          }

          env {
            name = "DB_PASSWORD"
            value = var.postgres_password
          }

          env {
            name = "DB_HOST"
            value = var.db_host
          }

          env {
            name = "DB_PORT"
            value = var.db_port
          }

          env {
            name = "MP_ACCESS_TOKEN"
            value = var.mp_access_token
          }
          
          env {
            name  = "JWT_SECRET"
            value_from {
              secret_key_ref {
                name = "secrets-15soat"
                key  = "JWT_SECRET"
              }
            }
          }
          
          env {
            name  = "CLIENT_ID"
            value_from {
              secret_key_ref {
                name = "secrets-15soat"
                key  = "CLIENT_ID"
              }
            }
          }
          
          env {
            name  = "CLIENT_SECRET"
            value_from {
              secret_key_ref {
                name = "secrets-15soat"
                key  = "CLIENT_SECRET"
              }
            }
          }
          
          env {
            name  = "AUTHORIZATION_SERVER_URL"
            value_from {
              secret_key_ref {
                name = "secrets-15soat"
                key  = "AUTHORIZATION_SERVER_URL"
              }
            }
          }
          
          env {
            name  = "STATUS_SERVICE_URL"
            value_from {
              secret_key_ref {
                name = "secrets-15soat"
                key  = "STATUS_SERVICE_URL"
              }
            }
          }
          
          env {
            name  = "SERVICE_ORDER_URL"
            value_from {
              secret_key_ref {
                name = "secrets-15soat"
                key  = "SERVICE_ORDER_URL"
              }
            }
          }
          
          env {
            name  = "STOCK_SERVICE_URL"
            value_from {
              secret_key_ref {
                name = "secrets-15soat"
                key  = "STOCK_SERVICE_URL"
              }
            }
          }
        }
      }
    }
  }
}
