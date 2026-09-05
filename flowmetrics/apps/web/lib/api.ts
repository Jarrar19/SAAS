/**
 * Typed client for Flowmetrics API.
 * All public landing page fetches strictly use `cache: 'no-store'`
 * to guarantee zero cache staleness — freshly published or updated posts/plans
 * appear on the public site immediately without requiring a redeploy or build.
 */

export interface PricingPlan {
  _id: string;
  name: string;
  price: number;
  billingCycle: "monthly" | "annual";
  features: string[];
  highlighted: boolean;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  featured: boolean;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial {
  _id: string;
  name: string;
  role: string;
  photoUrl: string;
  quote: string;
  published: boolean;
  order: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * Fetch published pricing plans.
 * Hits public route GET /api/plans (strictly published items).
 */
export async function fetchPublishedPlans(): Promise<PricingPlan[]> {
  try {
    const res = await fetch(`${API_BASE}/plans`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.error(`[API] Failed to fetch plans: HTTP ${res.status}`);
      return [];
    }

    const data = await res.json();
    return data.success && Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    console.error("[API] Error fetching plans:", error);
    return [];
  }
}

/**
 * Fetch published blog posts with optional limit.
 * Hits public route GET /api/posts?limit=... (strictly published items).
 */
export async function fetchPublishedPosts(limit?: number): Promise<BlogPost[]> {
  try {
    const url = limit ? `${API_BASE}/posts?limit=${limit}` : `${API_BASE}/posts`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.error(`[API] Failed to fetch posts: HTTP ${res.status}`);
      return [];
    }

    const data = await res.json();
    return data.success && Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    console.error("[API] Error fetching posts:", error);
    return [];
  }
}

/**
 * Fetch a single published post by slug.
 * Hits public route GET /api/posts/:slug.
 * Returns null if post does not exist or is unpublished (404).
 */
export async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API_BASE}/posts/${encodeURIComponent(slug)}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      console.error(`[API] Failed to fetch post '${slug}': HTTP ${res.status}`);
      return null;
    }

    const data = await res.json();
    return data.success && data.data ? data.data : null;
  } catch (error) {
    console.error(`[API] Error fetching post '${slug}':`, error);
    return null;
  }
}

/**
 * Fetch published testimonials.
 * Hits public route GET /api/testimonials (strictly published items).
 */
export async function fetchPublishedTestimonials(): Promise<Testimonial[]> {
  try {
    const res = await fetch(`${API_BASE}/testimonials`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.error(`[API] Failed to fetch testimonials: HTTP ${res.status}`);
      return [];
    }

    const data = await res.json();
    return data.success && Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    console.error("[API] Error fetching testimonials:", error);
    return [];
  }
}

// ----------------------------------------------------------------------
// ADMIN API CLIENT (Authenticated endpoints)
// ----------------------------------------------------------------------

export interface ApiError {
  code: string;
  message: string;
  details?: Array<{ field?: string; issue: string }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface PricingPlanInput {
  name: string;
  price: number;
  billingCycle: "monthly" | "annual";
  features: string[];
  highlighted?: boolean;
  published?: boolean;
  order?: number;
}

export interface BlogPostInput {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  featured?: boolean;
  published?: boolean;
}

/**
 * Helper to parse error bodies uniformly.
 */
async function parseErrorResponse(res: Response): Promise<ApiError> {
  try {
    const data = await res.json();
    if (data && data.error) {
      return data.error;
    }
  } catch (e) {
    // Ignore JSON parse error
  }
  return {
    code: `HTTP_${res.status}`,
    message: res.statusText || "An unexpected error occurred.",
  };
}

/**
 * Admin Login: POST /api/auth/login
 */
export async function adminLogin(
  email: string,
  password: string
): Promise<ApiResponse<{ token: string; user: { id: string; email: string; role: string } }>> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || { code: "AUTH_ERROR", message: "Failed to authenticate." },
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: { code: "NETWORK_ERROR", message: error.message || "Failed to connect to API server." },
    };
  }
}

/**
 * Fetch all pricing plans (published + drafts): GET /api/admin/plans
 */
export async function fetchAdminPlans(token: string): Promise<ApiResponse<PricingPlan[]>> {
  try {
    const res = await fetch(`${API_BASE}/admin/plans`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const err = await parseErrorResponse(res);
      return { success: false, error: err };
    }

    const data = await res.json();
    return { success: true, data: data.data || [] };
  } catch (error: any) {
    return {
      success: false,
      error: { code: "NETWORK_ERROR", message: error.message || "Failed to fetch admin plans." },
    };
  }
}

/**
 * Create a new pricing plan: POST /api/admin/plans
 */
export async function createAdminPlan(
  plan: PricingPlanInput,
  token: string
): Promise<ApiResponse<PricingPlan>> {
  try {
    const res = await fetch(`${API_BASE}/admin/plans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(plan),
    });

    if (!res.ok) {
      const err = await parseErrorResponse(res);
      return { success: false, error: err };
    }

    const data = await res.json();
    return { success: true, data: data.data };
  } catch (error: any) {
    return {
      success: false,
      error: { code: "NETWORK_ERROR", message: error.message || "Failed to create plan." },
    };
  }
}

/**
 * Update an existing pricing plan: PUT /api/admin/plans/:id
 */
export async function updateAdminPlan(
  id: string,
  plan: Partial<PricingPlanInput>,
  token: string
): Promise<ApiResponse<PricingPlan>> {
  try {
    const res = await fetch(`${API_BASE}/admin/plans/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(plan),
    });

    if (!res.ok) {
      const err = await parseErrorResponse(res);
      return { success: false, error: err };
    }

    const data = await res.json();
    return { success: true, data: data.data };
  } catch (error: any) {
    return {
      success: false,
      error: { code: "NETWORK_ERROR", message: error.message || "Failed to update plan." },
    };
  }
}

/**
 * Delete a pricing plan: DELETE /api/admin/plans/:id
 */
export async function deleteAdminPlan(
  id: string,
  token: string
): Promise<ApiResponse<{ message: string }>> {
  try {
    const res = await fetch(`${API_BASE}/admin/plans/${id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const err = await parseErrorResponse(res);
      return { success: false, error: err };
    }

    const data = await res.json();
    return { success: true, data: data.data };
  } catch (error: any) {
    return {
      success: false,
      error: { code: "NETWORK_ERROR", message: error.message || "Failed to delete plan." },
    };
  }
}

/**
 * Fetch all blog posts (published + drafts): GET /api/admin/posts
 */
export async function fetchAdminPosts(token: string): Promise<ApiResponse<BlogPost[]>> {
  try {
    const res = await fetch(`${API_BASE}/admin/posts`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const err = await parseErrorResponse(res);
      return { success: false, error: err };
    }

    const data = await res.json();
    return { success: true, data: data.data || [] };
  } catch (error: any) {
    return {
      success: false,
      error: { code: "NETWORK_ERROR", message: error.message || "Failed to fetch admin posts." },
    };
  }
}

/**
 * Create a new blog post: POST /api/admin/posts
 */
export async function createAdminPost(
  post: BlogPostInput,
  token: string
): Promise<ApiResponse<BlogPost>> {
  try {
    const res = await fetch(`${API_BASE}/admin/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(post),
    });

    if (!res.ok) {
      const err = await parseErrorResponse(res);
      return { success: false, error: err };
    }

    const data = await res.json();
    return { success: true, data: data.data };
  } catch (error: any) {
    return {
      success: false,
      error: { code: "NETWORK_ERROR", message: error.message || "Failed to create post." },
    };
  }
}

/**
 * Update an existing blog post: PUT /api/admin/posts/:id
 */
export async function updateAdminPost(
  id: string,
  post: Partial<BlogPostInput>,
  token: string
): Promise<ApiResponse<BlogPost>> {
  try {
    const res = await fetch(`${API_BASE}/admin/posts/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(post),
    });

    if (!res.ok) {
      const err = await parseErrorResponse(res);
      return { success: false, error: err };
    }

    const data = await res.json();
    return { success: true, data: data.data };
  } catch (error: any) {
    return {
      success: false,
      error: { code: "NETWORK_ERROR", message: error.message || "Failed to update post." },
    };
  }
}

/**
 * Delete a blog post: DELETE /api/admin/posts/:id
 */
export async function deleteAdminPost(
  id: string,
  token: string
): Promise<ApiResponse<{ message: string }>> {
  try {
    const res = await fetch(`${API_BASE}/admin/posts/${id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const err = await parseErrorResponse(res);
      return { success: false, error: err };
    }

    const data = await res.json();
    return { success: true, data: data.data };
  } catch (error: any) {
    return {
      success: false,
      error: { code: "NETWORK_ERROR", message: error.message || "Failed to delete post." },
    };
  }
}

