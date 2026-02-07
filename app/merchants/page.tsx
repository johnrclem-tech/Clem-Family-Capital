"use client";

import * as React from "react";
import { MerchantDataTable } from "@/components/merchants/merchant-data-table";
import { createMerchantColumns } from "@/components/merchants/merchant-columns";
import { MerchantWithStats, Category, Tag } from "@/lib/database";
import { RefreshCw } from "lucide-react";

export default function MerchantsPage() {
  const [merchants, setMerchants] = React.useState<MerchantWithStats[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [tags, setTags] = React.useState<Tag[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Fetch all data on mount
  React.useEffect(() => {
    fetchAllData().catch((error) => {
      console.error("Error in fetchAllData:", error);
      setLoading(false);
    });
  }, []);

  const fetchAllData = React.useCallback(async () => {
    await Promise.all([
      fetchMerchantsWithStats(),
      fetchCategories(),
      fetchTags(),
    ]);
  }, []);

  const fetchMerchantsWithStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/merchants/stats");
      if (response.ok) {
        const data = await response.json();
        setMerchants(data.merchants || []);
      }
    } catch (error) {
      console.error("Error fetching merchants:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/tags");
      if (response.ok) {
        const data = await response.json();
        setTags(data.tags || []);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  // Filter out parent categories from regular category selection
  const regularCategories = React.useMemo(() => {
    return categories.filter((c) => !c.is_parent_category);
  }, [categories]);

  const handleSaveMerchant = async (id: string, updates: Partial<MerchantWithStats>) => {
    try {
      console.log(`[CLIENT] Updating merchant ${id} with:`, updates);
      const response = await fetch(`/api/merchants/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`[CLIENT] Merchant ${id} updated successfully:`, result);
        await fetchMerchantsWithStats(); // Refresh merchants
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error(`[CLIENT] Error updating merchant ${id}:`, response.status, errorData);
      }
    } catch (error) {
      console.error(`[CLIENT] Error updating merchant ${id}:`, error);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Content Area */}
      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center border rounded-lg">
              <div className="text-center">
                <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground">Loading merchants...</p>
              </div>
            </div>
          ) : (
            <MerchantDataTable
              columns={createMerchantColumns({
                categories: regularCategories,
                allCategories: categories,
                tags,
                onMerchantUpdate: handleSaveMerchant,
              })}
              data={merchants}
              categories={regularCategories}
              tags={tags}
              onMerchantUpdate={handleSaveMerchant}
            />
          )}
        </div>
      </div>
    </div>
  );
}
