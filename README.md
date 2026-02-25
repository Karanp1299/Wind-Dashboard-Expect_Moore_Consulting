# GenAI Conversational Analytics POC

## Overview
This repository contains the Proof of Concept (POC) implementation of a Generative AI-powered conversational analytics platform developed for Expect Moore Consulting. The solution enables users to query business data using natural language and view results through an interactive dashboard and chat interface.

## Key Features
- React-based dashboard and chat interface
- Backend REST API hosted on AWS EC2
- AI inference using Amazon Bedrock
- Serverless processing via AWS Lambda
- Chat log storage in Amazon S3
- Secure access using AWS IAM

## High-Level Architecture
User Interface (React SPA)  
→ Backend API (EC2)  
→ AWS Lambda  
→ Amazon Bedrock  
→ Amazon S3 (Chat Logs)

## Technology Stack
- Frontend: React (Single Page Application)
- Backend: Python/Node.js on Amazon EC2
- AI Service: Amazon Bedrock
- Serverless: AWS Lambda
- Storage: Amazon S3
- Security: AWS IAM
- Monitoring: Amazon CloudWatch

## Deployment Summary
1. Provision EC2 instance for frontend and API
2. Configure IAM roles and permissions
3. Create and secure S3 bucket
4. Deploy Lambda for AI processing
5. Enable Amazon Bedrock model access
6. Verify end-to-end workflow

## Operations
- Logs: CloudWatch, S3
- Monitoring: CloudWatch Metrics & Alarms
- Cost Control: EC2 scheduling, S3 lifecycle policies, AWS Budgets

## Environment
- Current Stage: Proof of Concept (POC)
- Not intended for production traffic

## Roadmap (High Level)
- Phase 1: AI-powered Search Agent
- Phase 2: RAG-based Information Agent
- Phase 3: Multi-Agent Decision System

## Purpose of This Repository
This repository is intended for internal reference and context setup.  
Detailed technical, operational, and governance documentation is provided separately in the Knowledge Transfer (KT) document.

## Ownership
Delivery Partner: Avahi  
Client: Expect Moore Consulting

---

For detailed architecture, governance, and operational procedures, please refer to the official KT documentation.
