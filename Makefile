create-cluster:
	minikube start --memory=4G --cpus=6
	
deploy-istio:
	helm repo add istio https://istio-release.storage.googleapis.com/charts
	helm repo update
	kubectl create namespace istio-system
	helm install istio-base istio/base -n istio-system --set defaultRevision=default
	helm ls -n istio-system
	helm install istiod istio/istiod -n istio-system --wait --set meshConfig.outboundTrafficPolicy.mode=REGISTRY_ONLY
	helm ls -n istio-system
	helm status istiod -n istio-system
	kubectl get deployments -n istio-system --output wide
	kubectl create namespace istio-ingress
	helm install istio-ingressgateway istio/gateway -n istio-ingress
	kubectl label namespace default istio-injection=enabled --overwrite

deploy-app:
	kubectl apply -f k8s/services.yaml
	kubectl apply -f k8s/deployment.yaml
	kubectl apply -f k8s/loadbalancer.yaml

get-app:
	kubectl get pods && kubectl get svc && kubectl get svc istio-ingressgateway -n istio-ingress

ingress:
	kubectl apply -f istio/ingress.yaml
egress:
	kubectl apply -f istio/egress.yaml
prod:
	kubectl apply -f istio/destinationrules.yaml
	kubectl apply -f istio/routing-1.yaml
retry:
	kubectl apply -f istio/routing-2.yaml
headers:
	kubectl apply -f istio/routing-3.yaml
canary:
	kubectl apply -f istio/routing-4.yaml

delete-cluster: 
	minikube delete

restart-app:
	kubectl rollout restart -n default deployment backend-prod
	kubectl rollout restart -n default deployment frontend-prod
	kubectl rollout restart -n default deployment middleware-canary
	kubectl rollout restart -n default deployment middleware-prod
