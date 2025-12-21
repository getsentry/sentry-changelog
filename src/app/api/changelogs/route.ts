import { prismaClient } from "@/server/prisma-client";
import type { Prisma } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";

// TypeScript types for API
interface ChangelogItem {
  title: string;
  slug: string;
  summary: string | null;
  publishedAt: string;
  categories: { id: string; name: string }[];
}

interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface QueryMetadata {
  category?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

interface ApiResponse {
  data: ChangelogItem[];
  pagination: PaginationMetadata;
  query: QueryMetadata;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const page = Math.max(
      1,
      Number.parseInt(searchParams.get("page") || "1", 10),
    );
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(searchParams.get("limit") || "50", 10)),
    );
    const category = searchParams.get("category") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const search = searchParams.get("search") || undefined;

    // Validate date parameters
    if (startDate && Number.isNaN(Date.parse(startDate))) {
      return NextResponse.json(
        { error: "Invalid startDate format. Use ISO date string." },
        { status: 400 },
      );
    }

    if (endDate && Number.isNaN(Date.parse(endDate))) {
      return NextResponse.json(
        { error: "Invalid endDate format. Use ISO date string." },
        { status: 400 },
      );
    }

    // Build dynamic Prisma where clause
    const whereClause: Prisma.ChangelogWhereInput = {
      published: true,
      deleted: false,
    };

    // Filter by category
    if (category) {
      whereClause.categories = {
        some: {
          name: {
            equals: category,
            mode: "insensitive",
          },
        },
      };
    }

    // Filter by date range
    if (startDate || endDate) {
      whereClause.publishedAt = {};
      if (startDate) {
        whereClause.publishedAt.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.publishedAt.lte = new Date(endDate);
      }
    }

    // Search in title and summary
    if (search) {
      whereClause.OR = [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          summary: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    // Get total count for pagination
    const total = await prismaClient.changelog.count({
      where: whereClause,
    });

    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    // Fetch changelogs with filters and pagination
    const changelogs = await prismaClient.changelog.findMany({
      where: whereClause,
      include: {
        categories: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
      skip,
      take: limit,
    });

    // Format response with essential fields only
    const data: ChangelogItem[] = changelogs.map((changelog) => ({
      title: changelog.title,
      slug: changelog.slug,
      summary: changelog.summary,
      publishedAt: changelog.publishedAt
        ? new Date(changelog.publishedAt).toISOString()
        : "",
      categories: changelog.categories,
    }));

    // Build query metadata
    const queryMetadata: QueryMetadata = {};
    if (category) queryMetadata.category = category;
    if (startDate) queryMetadata.startDate = startDate;
    if (endDate) queryMetadata.endDate = endDate;
    if (search) queryMetadata.search = search;

    // Build response
    const response: ApiResponse = {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      query: queryMetadata,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
