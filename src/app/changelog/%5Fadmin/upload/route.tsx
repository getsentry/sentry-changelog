import crypto from "node:crypto";

import { authOptions } from "@/server/authOptions";
import { Storage } from "@google-cloud/storage";
import { getVercelOidcToken } from "@vercel/oidc";
import { ExternalAccountClient } from "google-auth-library";
import { getServerSession } from "next-auth/next";
import type { NextRequest } from "next/server";

async function getStorageClient(): Promise<Storage> {
  // Use OIDC authentication on Vercel, static credentials for local dev
  if (process.env.VERCEL) {
    const projectId = process.env.GCP_PROJECT_ID;
    const projectNumber = process.env.GCP_PROJECT_NUMBER;
    const poolId = process.env.GCP_WORKLOAD_IDENTITY_POOL_ID;
    const providerId = process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID;
    const serviceAccountEmail = process.env.GCP_SERVICE_ACCOUNT_EMAIL;

    if (
      !projectId ||
      !projectNumber ||
      !poolId ||
      !providerId ||
      !serviceAccountEmail
    ) {
      throw new Error(
        `Missing GCP OIDC environment variables: ${JSON.stringify({
          GCP_PROJECT_ID: !!projectId,
          GCP_PROJECT_NUMBER: !!projectNumber,
          GCP_WORKLOAD_IDENTITY_POOL_ID: !!poolId,
          GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID: !!providerId,
          GCP_SERVICE_ACCOUNT_EMAIL: !!serviceAccountEmail,
        })}`,
      );
    }

    const authClient = ExternalAccountClient.fromJSON({
      type: "external_account",
      audience: `//iam.googleapis.com/projects/${projectNumber}/locations/global/workloadIdentityPools/${poolId}/providers/${providerId}`,
      subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
      token_url: "https://sts.googleapis.com/v1/token",
      service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${serviceAccountEmail}:generateAccessToken`,
      service_account_impersonation: {
        token_lifetime_seconds: 3600,
      },
      subject_token_supplier: {
        getSubjectToken: getVercelOidcToken,
      },
    });

    if (!authClient) {
      throw new Error("Failed to create ExternalAccountClient");
    }

    return new Storage({
      projectId,
      authClient,
    });
  }

  // Local development: use static service account credentials
  return new Storage({
    projectId: process.env.GOOGLE_PROJECT_ID,
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: `${process.env.GOOGLE_PRIVATE_KEY}`
        .split(String.raw`\n`)
        .join("\n"),
    },
  });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  const file = searchParams.get("file");

  const storage = await getStorageClient();
  const bucket = storage.bucket(`${process.env.GOOGLE_BUCKET_NAME}`);
  const randomFilename = `${crypto.randomBytes(5).toString("base64url")}-${file}`;
  const gcsFile = bucket.file(randomFilename as string);

  const options = {
    expires: Date.now() + 5 * 60 * 1000, //  5 minutes,
    fields: { "x-goog-meta-source": `${process.env.GOOGLE_PROJECT_ID}` },
  };

  const [response] = await gcsFile.generateSignedPostPolicyV4(options);

  return Response.json({ response, options });
}
