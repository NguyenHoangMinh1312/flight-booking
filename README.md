# 1. Create kind cluster
`kind create cluster --name kind-flight-booking --config infra/kind/kind-config.yaml`

# 2. Apply the Kind-specific manifest
`kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.12.0/deploy/static/provider/kind/deploy.yaml`
    
# 3. Wait for the controller to be ready
`kubectl wait --namespace ingress-nginx --for=condition=ready pod --selector=app.kubernetes.io/component=controller --timeout=90s`

# 4. Create secrets
`kubectl create secret generic jwt-secret --from-literal=JWT_KEY=<your-jwt-secret>`

`kubectl create secret generic stripe-secret --from-literal=STRIPE_KEY=<sk_test_1234> --from-literal=STRIPE_WEBHOOK_SECRET=<whsec_1234>`

<!-- `kubectl create secret generic google-secret --from-literal=GMAIL_USER=<gmail@gmail.com> --from-literal=GOOGLE_APP_PASSWORD=<abcdefghijklmnop>` -->

`kubectl create secret generic resend-secret --from-literal=RESEND_API_KEY=<resend-api-key>`

`kubectl create secret generic manager-secret --from-literal=MANAGER_EMAIL=<gmail@gmail.com> --from-literal=MANAGER_PASSWORD=<abcdefghijklmnop>`

# 5. Listen on Stripe Webhook (Local only)
`stripe listen --all-snapshot --forward-to localhost/api/payments/stripe-webhook`