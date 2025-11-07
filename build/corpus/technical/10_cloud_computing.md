# Cloud Computing: Fundamentals and Best Practices

**Level: B2-C1**  
**Domain: Cloud Infrastructure**  
**Reading time: 5 minutes**

## Introduction

Cloud computing has revolutionized how organizations build and deploy technology infrastructure. By providing on-demand access to computing resources over the internet, cloud platforms enable unprecedented scalability, flexibility, and cost efficiency. Understanding cloud computing fundamentals is essential for modern IT professionals.

## Service Models

### Infrastructure as a Service (IaaS)

IaaS provides virtualized computing resources over the internet. Users rent virtual machines, storage, and networking components, maintaining control over operating systems and applications. Examples include Amazon EC2, Google Compute Engine, and Azure Virtual Machines.

IaaS offers maximum flexibility but requires significant management overhead. Organizations must handle patching, security configuration, and capacity planning for their virtual infrastructure.

### Platform as a Service (PaaS)

PaaS provides a complete development and deployment environment in the cloud. Developers focus on writing code while the platform handles infrastructure management, scaling, and maintenance. Examples include Heroku, Google App Engine, and Azure App Services.

PaaS accelerates development by abstracting infrastructure concerns, though it may impose constraints on application architecture and technology choices.

### Software as a Service (SaaS)

SaaS delivers complete applications over the internet. Users access software through web browsers without installing or maintaining anything locally. Examples include Gmail, Salesforce, and Microsoft 365.

SaaS offers the least control but requires minimal management, making it ideal for standardized business applications.

## Deployment Models

### Public Cloud

Public clouds provide resources over the internet to multiple organizations. Major providers include Amazon Web Services (AWS), Microsoft Azure, and Google Cloud Platform (GCP). Public clouds offer vast resources, pay-as-you-go pricing, and global reach.

### Private Cloud

Private clouds dedicate infrastructure to a single organization, either on-premises or hosted by third parties. They provide greater control and potential compliance benefits but require significant investment and management.

### Hybrid Cloud

Hybrid clouds combine public and private infrastructure, allowing workload distribution based on security, performance, and cost considerations. Organizations might keep sensitive data in private clouds while using public clouds for less sensitive workloads or burst capacity.

### Multi-Cloud

Multi-cloud strategies use multiple cloud providers to avoid vendor lock-in, optimize costs, or leverage specific providers' strengths. However, multi-cloud increases operational complexity and requires careful management.

## Key Technologies

### Virtualization

Virtualization enables multiple virtual machines to run on single physical servers, maximizing resource utilization. Hypervisors like KVM, VMware, and Hyper-V manage virtual machines, providing isolation and resource allocation.

### Containers

Containers provide lightweight alternatives to full virtual machines, sharing the host operating system kernel while isolating applications. Container orchestration platforms like Kubernetes manage containerized applications at scale across clusters of machines.

### Serverless Computing

Serverless, or Function as a Service (FaaS), executes code in response to events without provisioning servers. Developers write functions that cloud providers execute and scale automatically. AWS Lambda, Azure Functions, and Google Cloud Functions exemplify serverless platforms.

Serverless reduces operational overhead and can be cost-effective for sporadic workloads, though it introduces constraints on execution time and state management.

## Cloud Architecture Principles

### Scalability

Cloud applications should scale horizontally by adding more instances rather than vertically by upgrading individual instances. Auto-scaling automatically adjusts capacity based on demand, optimizing costs and performance.

### Resilience

Design for failure by assuming components will fail and building redundancy. Use multiple availability zones or regions, implement health checks, and enable automatic failover.

### Loose Coupling

Components should interact through well-defined interfaces, minimizing dependencies. Decoupled architecture enables independent scaling, updating, and replacing of components without affecting the entire system.

### Security

Implement security at every layer using the principle of defense in depth. Encrypt data in transit and at rest, use strong identity and access management, regularly audit configurations, and maintain current patches.

## Cost Management

### Pay-as-You-Go

Cloud computing shifts IT spending from capital expenditures (CapEx) to operational expenditures (OpEx). Organizations pay only for resources consumed, eliminating upfront hardware costs and reducing waste.

### Cost Optimization

Effective cost management requires:
- **Right-sizing**: Matching resources to actual needs
- **Reserved capacity**: Committing to long-term usage for discounts
- **Spot instances**: Using spare capacity at reduced prices
- **Auto-shutdown**: Stopping non-production resources when not needed
- **Cost monitoring**: Tracking spending and setting budgets

## Migration Strategies

### Rehosting (Lift and Shift)

Move applications to the cloud with minimal changes. This approach is fastest but doesn't fully leverage cloud capabilities or optimize costs.

### Replatforming

Make targeted optimizations while migrating, such as using managed databases instead of self-managed ones. This balances migration speed with cloud benefits.

### Refactoring

Redesign applications to be cloud-native, fully leveraging cloud services and architecture patterns. While requiring the most effort, refactoring maximizes long-term benefits.

### Retiring and Retaining

Some applications should be decommissioned rather than migrated, while others remain on-premises due to compliance, latency, or integration requirements.

## Conclusion

Cloud computing has become fundamental to modern IT infrastructure, offering scalability, flexibility, and innovation opportunities impossible with traditional infrastructure. Success requires understanding service models, implementing sound architecture principles, managing costs effectively, and maintaining robust security. As cloud technologies continue evolving, staying current with new services and best practices remains essential for IT professionals.

---

**Key Vocabulary:**
- Cloud computing: informatique en nuage
- Scalability: évolutivité/scalabilité
- Virtualization: virtualisation
- Serverless: sans serveur
- Pay-as-you-go: paiement à l'usage
- Migration: migration
- Resilience: résilience

