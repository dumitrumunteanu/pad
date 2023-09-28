# PAD

This project aims to implement a simple restaurant app which will be compose of two services: products and orders.

## Assess Application Suitability

**Scalability**: Microservices architecture allows you to scale individual components independently based on their specific needs. For a restaurant app, this means you can scale up the order processing service during peak hours while keeping other services at their normal scale.

**Complexity**:The app includes multiple components (such as order management, menu display). Microservices can help in breaking down this complexity into manageable parts. Each of these components can be developed and maintained independently as separate microservices.

**Team Independence**: Microservices enable multiple development teams to work on different services concurrently. This speeds up development, and each team can focus on their area of expertise. For example, one team can handle the products service, while another can work on order service.

## Define Service Boundaries

The responsibility of the services is as follows:

1. Product Service: this service is responsible for the functionality related to products.
    - Products list (menu)
    - Product creation
    - Product deletion

2. Orders Service: this service is responsible for the fuctionality related to orders.
    - Create order
    - Cancel order

System Architecture Design:
![architecture](architecture.png)

## Tech Stack and Communication Patterns

The products and order services will be written in python and the API Gateway will be written in go. The API Gateway will handle the requests from clients and will redirect them to the appropriate serice. The services will communicate through RESTful APIs.

## Deployment and Scaling

Each service will have its own docker container. Docker compose will be used to orchestrate the containers.
