/* This file is auto-generated by SST. Do not edit. */
/* tslint:disable */
/* eslint-disable */
import "sst"
export {}
declare module "sst" {
  export interface Resource {
    "BuildZeroBucket": {
      "name": string
      "type": "sst.aws.Bucket"
    }
    "BuildZeroDatabase": {
      "database": string
      "host": string
      "password": string
      "port": number
      "type": "sst.aws.Postgres"
      "username": string
    }
    "BuildZeroUserPool": {
      "poolId": string
      "type": "aws.cognito/userPool.UserPool"
    }
    "BuildZeroUserPoolClient": {
      "clientId": string
      "type": "aws.cognito/userPoolClient.UserPoolClient"
    }
    "BuildZeroVpc": {
      "bastion": string
      "type": "sst.aws.Vpc"
    }
    "BuildZeroWeb": {
      "type": "sst.aws.Nextjs"
      "url": string
    }
  }
}
