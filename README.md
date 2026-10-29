# Deployment Guide

This guide explains how to deploy the Flight Booking application locally using **Kind** and to production using **DigitalOcean Kubernetes (DOKS)**.

## 1. Local Deployment

### Step 1: Create a Kind Cluster

Create a local Kubernetes cluster using the provided configuration:

```bash
kind create cluster --name kind-flight-booking --config infra/kind/kind-config.yaml
```

### Step 2: Install the Ingress Controller

Apply the NGINX Ingress Controller manifest for Kind:

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.12.0/deploy/static/provider/kind/deploy.yaml
```

### Step 3: Wait for the Ingress Controller to Be Ready

Wait until the controller pod is ready before proceeding:

```bash
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s
```

### Step 4: Configure the Stripe Webhook

Start the Stripe CLI listener and forward webhook events to the local application:

```bash
stripe listen --all-snapshot --forward-to localhost/api/payments/stripe-webhook
```

Copy the webhook signing secret (`whsec_...`) displayed by the Stripe CLI and use it as the value of `STRIPE_WEBHOOK_SECRET` in the `stripe-secret`.

### Step 5: Create Kubernetes Secrets

Create the required secrets for authentication, payment processing, email delivery, and manager credentials.

**JWT Secret**

```bash
kubectl create secret generic jwt-secret \
  --from-literal=JWT_KEY=<your-jwt-secret>
```

**Stripe Secret**

```bash
kubectl create secret generic stripe-secret \
  --from-literal=STRIPE_KEY=<your-stripe-secret-key> \
  --from-literal=STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
```

**Resend Secret**

```bash
kubectl create secret generic resend-secret \
  --from-literal=RESEND_API_KEY=<your-resend-api-key>
```

**Manager Secret**

```bash
kubectl create secret generic manager-secret \
  --from-literal=MANAGER_EMAIL=<your-manager-email> \
  --from-literal=MANAGER_PASSWORD=<your-manager-password>
```

Replace all placeholders with your actual credentials. Do not commit secrets or expose them in version control.

### Step 6: Deploy the Application

Start the development deployment using Skaffold:

```bash
skaffold dev
```

Skaffold will build and deploy the application according to the project's configuration.

---

## 2. Production Deployment on DigitalOcean Kubernetes (DOKS)

### Step 1: Create a DOKS Cluster

Visit the [DigitalOcean website](https://www.digitalocean.com/) and create a Kubernetes cluster through the control panel.

Choose the appropriate region, Kubernetes version, and node configuration for your application.

### Step 2: Connect to the Cluster

Install and configure `doctl`, then download the cluster credentials:

```bash
doctl kubernetes cluster kubeconfig save <your-cluster-name>
```

Verify that `kubectl` is connected to the correct cluster:

```bash
kubectl config current-context
kubectl get nodes
```

### Step 3: Install the Ingress Controller

Apply the production Ingress Controller configuration:

```bash
kubectl apply -f deploy.yaml
```

Ensure that the controller is running and that a DigitalOcean Load Balancer has been provisioned successfully.

### Step 4: Configure the Stripe Webhook

In the [Stripe Dashboard](https://dashboard.stripe.com/), create a webhook endpoint pointing to your production application:

```text
https://<your-domain>/api/payments/stripe-webhook
```

Select the events required by the payment service. Copy the endpoint's signing secret and update the Kubernetes `stripe-secret` accordingly.


### Step 5: Create Kubernetes Secrets

Create the secrets required by the application.

**JWT Secret**

```bash
kubectl create secret generic jwt-secret \
  --from-literal=JWT_KEY=<your-jwt-secret>
```

**Stripe Secret**

```bash
kubectl create secret generic stripe-secret \
  --from-literal=STRIPE_KEY=<your-stripe-secret-key> \
  --from-literal=STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
```

**Resend Secret**

```bash
kubectl create secret generic resend-secret \
  --from-literal=RESEND_API_KEY=<your-resend-api-key>
```

**Manager Secret**

```bash
kubectl create secret generic manager-secret \
  --from-literal=MANAGER_EMAIL=<your-manager-email> \
  --from-literal=MANAGER_PASSWORD=<your-manager-password>
```

Use production credentials and keep all sensitive values secure. For Stripe, configure the appropriate production API key and webhook signing secret.

### Step 6: Configure the Domain and Load Balancer

1. Retrieve the external IP address or hostname assigned to the DigitalOcean Load Balancer.
2. Configure your domain's DNS records to point to the load balancer.
3. Update the Ingress resource with the production hostname.
4. Configure HTTPS using a valid TLS certificate.
5. Verify that the domain resolves correctly and that requests reach the appropriate application services.


### Step 7: Deploy the Application

Apply the Kubernetes manifests for the application and its production configuration:

```bash
kubectl apply -f infra/k8s
kubectl apply -f infra/k8s-prod
```

Verify the deployment status:

```bash
kubectl get pods
kubectl get services
kubectl get ingress
```

Check the pod logs if any service fails to start, and verify that the application is accessible through the configured domain.