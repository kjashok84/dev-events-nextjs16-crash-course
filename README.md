This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Deploy to Amazon ECS

The GitHub Actions workflow at `.github/workflows/deploy-ecs.yml` builds a Docker image, pushes it to ECR, and deploys it to an existing ECS Fargate service when code is pushed to `main`. It uses GitHub Actions OIDC to assume an AWS IAM role; it does not use long-lived AWS access keys.

Before enabling the workflow, create an ECR repository and an ECS Fargate service with a load balancer targeting container port `3000`. The task execution role must be able to pull from ECR, write to CloudWatch Logs, and read the Secrets Manager secrets listed below. Create the CloudWatch log group `/ecs/dev-events` in the deployment region. Ensure the task's network can reach the PostgreSQL database and Cloudinary.

Add these repository **Actions variables** in GitHub:

| Variable | Value |
| --- | --- |
| `AWS_ROLE_TO_ASSUME` | ARN of the IAM role trusted for this repository's GitHub Actions OIDC identity |
| `AWS_REGION` | AWS region containing the ECR repository and ECS service |
| `ECR_REPOSITORY` | ECR repository name |
| `ECS_CLUSTER` | ECS cluster name |
| `ECS_SERVICE` | ECS service name |
| `ECS_TASK_EXECUTION_ROLE_ARN` | Task execution role ARN |
| `DATABASE_URL_SECRET_ARN` | Secrets Manager ARN containing the production `DATABASE_URL` |
| `CLOUDINARY_URL_SECRET_ARN` | Secrets Manager ARN containing the production `CLOUDINARY_URL` |
| `NEXT_PUBLIC_BASE_URL` | Public base URL of the deployed app, including `https://` |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` | PostHog project token, embedded in the client bundle at build time |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host, embedded in the client bundle at build time |

The GitHub OIDC role needs permission to push images to the ECR repository, register task definitions, update and describe the ECS service, and pass the task execution role to ECS. Keep database and Cloudinary credentials in Secrets Manager; the task execution role needs `secretsmanager:GetSecretValue` access to those secrets.

Apply pending Prisma migrations to the production database before deploying an application version that requires them (`npx prisma migrate deploy`). The workflow updates an existing service and does not create the VPC, load balancer, database, ECR repository, or ECS cluster.
